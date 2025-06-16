import { SettingsStorageService } from "@src/shared/services/settingsStorage";
import { PlayerSettings } from "@src/shared/hooks/usePlayerSettings";
import { WorldConfig } from "@src/shared/models/game/WorldConfig";
import {
  BackendActionContext,
  BackendActionHelpers,
} from "@src/shared/actions/backend/core/BackendActionContext";
import { TabMessenger } from "@src/shared/actions/content/core/TabMessenger";
import { ActionScheduler } from "@src/shared/actions/backend/core/ActionScheduler";
import { MessengerWrapper } from "@src/shared/actions/content/core/MessengerWrapper";
import { BackendAction } from "@src/shared/actions/backend/core/BackendAction";
import {logError, logInfo} from "@src/shared/helpers/sendLog";
import {GameDataBase} from "@src/shared/db/GameDataBase";
import {Runtime} from "webextension-polyfill";
import MessageSender = Runtime.MessageSender;
import {GameDatabaseBackgroundSync} from "@src/shared/db/GameDatabaseBackgroundSync";
import {IDBPDatabase} from "idb";

export class PlayerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, BackendAction<any, any>> = {};
  private actionContext: BackendActionContext;
  private gameDatabaseSync: GameDatabaseBackgroundSync;

  constructor(
    private settings: SettingsStorageService,
    private playerSettings: PlayerSettings,
    private worldConfig: WorldConfig,
    private tabMessanger: TabMessenger,
    private actionScheduler: ActionScheduler,
    private database: GameDataBase,
    private mainTabId: number
  ) {
    // Explicitly declare actionContext in the class (if not done already)
    this.actionContext = {
      helpers: new BackendActionHelpers(),
      messenger: new MessengerWrapper(this.tabMessanger),
      playerSettings: this.playerSettings,
      scheduler: this.actionScheduler,
      worldConfig: this.worldConfig,
      gameDatabase: this.database,
    };

    this.gameDatabaseSync = new GameDatabaseBackgroundSync(this.database.db  as IDBPDatabase, this.database.prefix)

    // Set up the executor for the action scheduler
    this.actionScheduler.setExecutor(
      async (type: string, action: unknown): Promise<void> => {
        const handler = this.handlers[type]; // Safely access handlers
        if (!handler) {
          logError(`No handler for given action type: ${type}`);
          throw new Error(`Handler not found for action type: ${type}`);
        }
        await handler.execute(this.actionContext, action); // Execute the action
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerHandler(type: string, action: BackendAction<any, any>) {
    this.handlers[type] = action;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async onMessage(message: any, sender: MessageSender, sendResponse: (response?: any) => void): Promise<void> {
    const type = message.type;
    if(type !== "ui_action"){
      logInfo(`we are not handling action different than "ui_action": ${type}`); // Correct
      return
    }

    const actionType = message.payload.action
    const handler = this.handlers[actionType];
    if(!handler){
      logError(`no handler for given action type: ${type}`); // Correct
      return;
    }
    const actionContent = message.payload.parameters;
    logInfo(`start execute action ${message.payload.action}`)
    return handler.execute(this.actionContext, actionContent);
  }
}