import {logError, logInfo} from "@src/shared/helpers/sendLog";
import {hasValidPlayerSettings} from "@src/shared/services/hasValidPlayerSettings";
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
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
import {MessageRouter} from '@src/shared/services/MessageRouter';

interface DatabaseHolder {
  dbSync: GameDatabaseBackgroundSync<DatabaseSchema>;
  database: GameDataBase;
  databaseAccess: GameDataBaseAccess;
}

const playerServiceCache = new Map<string, PlayerService>();
const databaseCache = new Map<string, DatabaseHolder>();

const messageRouter = new MessageRouter();

async function ensureDatabase(fullDomain: string): Promise<DatabaseHolder> {
  if (!databaseCache.has(fullDomain)) {
    const database = new GameDataBase(fullDomain);
    await database.init();
    const gameDatabaseAccess = new GameDataBaseAccess(database.db)
    const gameDatabaseSync = new GameDatabaseBackgroundSync(database.db, fullDomain)

    databaseCache.set(fullDomain, {
      dbSync: gameDatabaseSync,
      database: database,
      databaseAccess: gameDatabaseAccess
    })
  }
  return databaseCache.get(fullDomain)!
}

async function ensureServerConfig(gameDatabaseAccess: GameDataBaseAccess, fullDomain: string): Promise<ServerConfig | undefined> {
  const basicWorldConfig = await gameDatabaseAccess.settingDb.getWorldConfig();
  const basicTroopsConfig = await gameDatabaseAccess.settingDb.getTroopConfigs();
  const basicBuildingsConfig = await gameDatabaseAccess.settingDb.getBuildingConfigs();

  try {
    if (!basicWorldConfig) {
      const worldConfig = await fetchWorldConfig(fullDomain)
      await gameDatabaseAccess.settingDb.saveWorldConfig(worldConfig)
    }
    if (!basicTroopsConfig || !basicTroopsConfig.length) {
      const troopsConfig = await fetchTroopInfo(fullDomain);
      console.log(`troops ${JSON.stringify(troopsConfig)}`);
      await gameDatabaseAccess.settingDb.saveTroopsConfig(troopsConfig)
    }
    if (!basicBuildingsConfig || !basicBuildingsConfig.length) {
      const buildingConfig = await fetchBuildingInfo(fullDomain)
      console.log(`basicBuildingsConfig ${JSON.stringify(buildingConfig)}`);
      await gameDatabaseAccess.settingDb.saveBuildingConfig(buildingConfig)
    }
  } catch (e) {
    logError("can't fetch config", e)
    return undefined

  }
  return {
    worldConfig: (await gameDatabaseAccess.settingDb.getWorldConfig())!,
    troopsConfig: await gameDatabaseAccess.settingDb.getTroopConfigs(),
    buildingConfig: await gameDatabaseAccess.settingDb.getBuildingConfigs(),
  }
}

messageRouter.addListener("db_init" ,async (message, sender, sendResponse) => {
  logInfo('Message from content script:', JSON.stringify(message), 'Sender:', sender);
  logInfo(Object.keys(message));
  const fullDomain = message.fullDomain;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return false;
  }
  logInfo("db_init")
  ensureDatabase(fullDomain)
    .then(() => sendResponse({ success: true }))
    .catch(err => sendResponse({ error: err.message }));
  return true;
});

const createPlayerService = async (fullDomain: string, tabId: number) => {
  if (!playerServiceCache.has(fullDomain)) {
    logInfo('Creating new PlayserService for ', fullDomain, ' tab ', tabId, '');

    const database = await ensureDatabase(fullDomain)
    const gameDatabaseAccess = database.databaseAccess;
    const playerSettings = await gameDatabaseAccess.settingDb.getPlayerSettings();
    if (playerSettings == null || !hasValidPlayerSettings(playerSettings)) {
      console.log('No valid player settings found, skipping initialization');
      return;
    }

    const serverConfig = await ensureServerConfig(gameDatabaseAccess, fullDomain);
    if (!serverConfig) {
      return false
    }

    const activeTabMessenger = new TabMessenger(tabId)
    const scheduler: ActionScheduler = new ActionScheduler()

    const playerService = new PlayerService(playerSettings, serverConfig, activeTabMessenger, scheduler, database.databaseAccess, tabId);
    playerServiceCache.set(fullDomain, playerService);
    playerService.registerHandler(SCAVENGE_VILLAGE_ACTION, new ScavengeVillageAction())
    playerService.registerHandler(GET_OVERVIEW_ACTION, new GetOverviewAction())
    playerService.registerHandler(SCAVENGE_ALL_VILLAGES_ACTION, new ScavengeAllVillagesAction())

    // Using the new parameter object approach
    scheduler.scheduleTask(GET_OVERVIEW_ACTION)
    scheduler.scheduleTask(SCAVENGE_ALL_VILLAGES_ACTION,)
  }
  return playerServiceCache.get(fullDomain)!
}

messageRouter.addListener("contentScriptReady" ,(message, sender, sendResponse) => {
  const fullDomain = message.fullDomain;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return false;
  }
  if (!(sender.tab && sender.tab.id)) {
    logInfo('No sender return');
    return;
  }
  const tabId = sender.tab.id;

  createPlayerService(fullDomain, tabId)
    .then(() => sendResponse({ success: true }))
    .catch(err => sendResponse({ error: err.message }));
  return true;
});

messageRouter.addListener("ui_action" ,(message, sender, sendResponse) => {
  const fullDomain = message.fullDomain;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return false;
  }
  playerServiceCache.get(fullDomain)?.onMessage(message, sender, sendResponse);
  return false;
});

messageRouter.addListener("status" ,(message, sender, sendResponse) => {
  const fullDomain = message.fullDomain;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return false;
  }
  playerServiceCache.get(fullDomain)?.tabMessanger.messageListener(message, sender);
  return false;
});

messageRouter.addListener("error" ,(message, sender, sendResponse) => {
  const fullDomain = message.fullDomain;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return false;
  }
  playerServiceCache.get(fullDomain)?.tabMessanger.messageListener(message, sender);
  return false;
});

messageRouter.addListener("db_sync" ,(message, sender, sendResponse) => {
  const fullDomain = message.fullDomain;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return false;
  }
  databaseCache.get(fullDomain)?.dbSync?.messageListener(message, sender, sendResponse);
  return true;
});

logInfo('Service worker initialized');
