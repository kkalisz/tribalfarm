import { SettingsStorageService } from "@src/shared/services/settingsStorage";
import { PlayerSettings } from "@src/shared/hooks/usePlayerSettings";
import {
  BackendActionContext,
  BackendActionHelpers,
} from "@src/shared/actions/backend/core/BackendActionContext";
import { TabMessenger } from "@src/shared/actions/content/core/TabMessenger";
import { ActionScheduler } from "@src/shared/actions/backend/core/ActionScheduler";
import { MessengerWrapper } from "@src/shared/actions/content/core/MessengerWrapper";
import { BackendAction } from "@src/shared/actions/backend/core/BackendAction";
import {logError, logInfo} from "@src/shared/helpers/sendLog";
import MessageSender = chrome.runtime.MessageSender;
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {ServerConfig} from "@pages/background/serverConfig";

export class PlayerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, BackendAction<any, any>> = {};
  private actionContext: BackendActionContext;

  constructor(
    private settings: SettingsStorageService,
    private playerSettings: PlayerSettings,
    private serverConfig: ServerConfig,
    private tabMessanger: TabMessenger,
    private actionScheduler: ActionScheduler,
    private database: GameDataBaseAccess,
    private mainTabId: number
  ) {
    // Explicitly declare actionContext in the class (if not done already)
    console.log(JSON.stringify(this.serverConfig, null, 2))
    this.actionContext = {
      helpers: new BackendActionHelpers(this.database),
      messenger: new MessengerWrapper(this.tabMessanger),
      playerSettings: this.playerSettings,
      scheduler: this.actionScheduler,
      serverConfig: this.serverConfig,
      gameDatabase: this.database,
    };

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

  registerStartHandlers(){

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