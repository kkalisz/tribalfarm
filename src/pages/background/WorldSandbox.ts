import {hasValidPlayerSettings} from "@src/shared/services/hasValidPlayerSettings";
import {TabMessenger} from "@src/shared/actions/content/core/TabMessenger";
import {PlayerService} from './PlayerService';
import {ActionScheduler} from "@src/shared/actions/backend/core/ActionScheduler";
import {SCAVENGE_VILLAGE_ACTION, ScavengeVillageAction} from "@src/shared/actions/backend/scavenge/ScavengeVillageAction";
import {GET_OVERVIEW_ACTION, GetOverviewAction} from "@src/shared/actions/backend/metadata/GetOverviewAction";
import {DatabaseSchema, GameDataBase} from "@src/shared/db/GameDataBase";
import {fetchWorldConfig} from "@src/shared/services/fetchWorldConfig";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {GameDatabaseBackgroundSync} from "@src/shared/db/GameDatabaseBackgroundSync";
import {fetchTroopInfo} from "@src/shared/services/fetchTroopInfo";
import {fetchBuildingInfo} from "@src/shared/services/fetchBuildings";
import {ServerConfig} from "@pages/background/serverConfig";
import {
  SCAVENGE_ALL_VILLAGES_ACTION,
  ScavengeAllVillagesAction
} from "@src/shared/actions/backend/scavenge/ScavengeAllVillagesAction";
import { MessageRouter} from '@src/shared/services/MessageRouter';
import {
  ContentScriptReadyMessage, ContentScriptReadyResponse,
  DbInitMessage,
  DbSyncMessage
} from '@src/shared/actions/content/core/types';
import {Logger} from '@src/shared/log/Logger';
import {LoggerImpl} from '@src/shared/log/LoggerImpl';
import {MessageResponse, sendTypedResponse} from "@src/shared/services/MessageSender";


interface DatabaseHolder {
  dbSync: GameDatabaseBackgroundSync<DatabaseSchema>;
  database: GameDataBase;
  databaseAccess: GameDataBaseAccess;
  logger: Logger;
}

export class WorldSandbox {

  private playerServices: PlayerService| null = null
  private databaseHolder: DatabaseHolder| null = null

  constructor(private readonly fullDomain: string, private readonly messageRouter: MessageRouter) {
    messageRouter.addTypedListener<ContentScriptReadyMessage, ContentScriptReadyResponse>("contentScriptReady" ,(message: ContentScriptReadyMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: MessageResponse<ContentScriptReadyResponse>) => void) => {
      console.log(` -> 232223}`)
      if (!(sender.tab?.id)) {
        this.databaseHolder?.logger?.logWarning({ type: "infra", content: `No sender tab` });
        return false;
      }
      const tabId = sender.tab.id;

      this.ensurePlayerService(fullDomain, tabId)
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      console.log(` -> 2333}`)

      sendResponse({ value: { mainTabId: this.playerServices?.tabMessanger.getTabId() ?? -1, currenTabId: sender.tab?.id }, success: true })
      return false;
    });

    messageRouter.addListener("db_sync" ,(message: DbSyncMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
      this.ensureDatabase(fullDomain)?.then( holder => holder.dbSync.onDatabaseMessage(message, sender, sendResponse))
      return true;
    });

    messageRouter.addListener("db_init" ,(message: DbInitMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      this.ensureDatabase(fullDomain)
        .then(() => {
          sendResponse({ success: true })
        })
        .catch(err => sendResponse({ error: err.message }));
      return true;
    });
  }

  invalidate(){
    this.playerServices?.onInvalidate()
    this.playerServices = null;
  }

  async ensureDatabase(fullDomain: string): Promise<DatabaseHolder> {
    if (!this.databaseHolder) {
      const database = new GameDataBase(fullDomain);
      await database.init();
      const gameDatabaseAccess = new GameDataBaseAccess(database.db)
      const gameDatabaseSync = new GameDatabaseBackgroundSync(database.db, fullDomain)
      const logger = new LoggerImpl(gameDatabaseAccess)

      this.databaseHolder = {
        dbSync: gameDatabaseSync,
        database: database,
        databaseAccess: gameDatabaseAccess,
        logger: logger
      }
    }
    return this.databaseHolder
  }

  async ensureServerConfig(gameDatabaseAccess: GameDataBaseAccess, fullDomain: string): Promise<ServerConfig | undefined> {
    const basicWorldConfig = await gameDatabaseAccess.settingDb.getWorldConfig();
    const basicTroopsConfig = await gameDatabaseAccess.settingDb.getTroopConfigs();
    const basicBuildingsConfig = await gameDatabaseAccess.settingDb.getBuildingConfigs();

    try {
      if (!basicWorldConfig) {
        const worldConfig = await fetchWorldConfig(fullDomain)
        await gameDatabaseAccess.settingDb.saveWorldConfig(worldConfig)
      }
      if (!basicTroopsConfig.length) {
        const troopsConfig = await fetchTroopInfo(fullDomain);
        await gameDatabaseAccess.settingDb.saveTroopsConfig(troopsConfig)
      }
      if (!basicBuildingsConfig?.length) {
        const buildingConfig = await fetchBuildingInfo(fullDomain)
        await gameDatabaseAccess.settingDb.saveBuildingConfig(buildingConfig)
      }
    } catch (e) {
      this.databaseHolder?.logger?.logError({ type: "infra", content: `No valid player settings found, skipping initialization ${e}` });
      return undefined

    }
    return {
      worldConfig: (await gameDatabaseAccess.settingDb.getWorldConfig())!,
      troopsConfig: await gameDatabaseAccess.settingDb.getTroopConfigs(),
      buildingConfig: await gameDatabaseAccess.settingDb.getBuildingConfigs(),
    }
  }

   ensurePlayerService = async (fullDomain: string, tabId: number) => {
    if (!this.playerServices) {
      const database = await this.ensureDatabase(fullDomain)
      const gameDatabaseAccess = database.databaseAccess;
      const playerSettings = await gameDatabaseAccess.settingDb.getPlayerSettings();
      if (playerSettings == null || !hasValidPlayerSettings(playerSettings)) {
        database.logger.logWarning({ type: "infra", content: 'No valid player settings found, skipping initialization' });
        return;
      }

      const serverConfig = await this.ensureServerConfig(gameDatabaseAccess, fullDomain);
      if (!serverConfig) {
        return false
      }

      const activeTabMessenger = new TabMessenger(tabId)
      const scheduler: ActionScheduler = new ActionScheduler()

      database.logger.logInfo({ type: "infra", content: 'Starting player service' });
      this.playerServices = new PlayerService(
        playerSettings,
        serverConfig,
        activeTabMessenger,
        scheduler,
        database.databaseAccess,
        tabId,
        database.logger,
        this.messageRouter);
      this.playerServices.registerHandler(SCAVENGE_VILLAGE_ACTION, new ScavengeVillageAction())
      this.playerServices.registerHandler(GET_OVERVIEW_ACTION, new GetOverviewAction())
      this.playerServices.registerHandler(SCAVENGE_ALL_VILLAGES_ACTION, new ScavengeAllVillagesAction())

      // Using the new parameter object approach
      scheduler.scheduleTask(GET_OVERVIEW_ACTION)
      scheduler.scheduleTask(SCAVENGE_ALL_VILLAGES_ACTION,)
    }
    return this.playerServices
  }
}

