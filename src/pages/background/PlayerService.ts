import { PlayerSettings } from "@src/shared/hooks/usePlayerSettings";
import {
  BackendActionContext,
  BackendActionHelpers,
} from "@src/shared/actions/backend/core/BackendActionContext";
import { TabMessenger } from "@src/shared/actions/content/core/TabMessenger";
import { ActionScheduler } from "@src/shared/actions/backend/core/ActionScheduler";
import { MessengerWrapper } from "@src/shared/actions/content/core/MessengerWrapper";
import { BackendAction } from "@src/shared/actions/backend/core/BackendAction";
import {logInfo} from "@src/shared/helpers/sendLog";
import MessageSender = chrome.runtime.MessageSender;
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {ServerConfig} from "@pages/background/serverConfig";
import {LoggerImpl} from "@src/shared/log/LoggerImpl";

export class PlayerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, BackendAction<any, any>> = {};
  private readonly actionContext: BackendActionContext;

  private readonly actionExecutor: ((type: string, action: Record<any, any>) => Promise<void>) = async (
    type: string,
    action: Record<any, any>
  ): Promise<void> => {
    const handler = this.handlers[type];
    if (!handler) {
      this.actionContext.logger.logError({
        type: "action",
        content: `No handler found for action type: ${type}`,
      });
      return;
    }

    try {
      this.actionContext.logger.logInfo({
        type: "action",
        content: `Executing action of type: ${type}`,
      });

      await handler.execute(this.actionContext, action);
    } catch (error) {
      this.actionContext.logger.logError({
        type: "action",
        content: `Error while executing action of type: ${type}. Error: ${error}`,
      });
    }
  };

  constructor(
    private playerSettings: PlayerSettings,
    private serverConfig: ServerConfig,
    private tabMessanger: TabMessenger,
    private actionScheduler: ActionScheduler,
    private database: GameDataBaseAccess,
    private mainTabId: number
  ) {
    this.actionContext = {
      helpers: new BackendActionHelpers(this.database),
      messenger: new MessengerWrapper(this.tabMessanger),
      playerSettings: this.playerSettings,
      scheduler: this.actionScheduler,
      serverConfig: this.serverConfig,
      gameDatabase: this.database,
      logger: new LoggerImpl(database)
    };

    // Set up the executor for the action scheduler
    this.actionScheduler.setExecutor(this.actionExecutor);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerHandler(type: string, action: BackendAction<any, any>) {
    this.handlers[type] = action;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async onMessage(message: any, sender: MessageSender, sendResponse: (response?: any) => void): Promise<boolean> {
    const type = message.type;
    if(type !== "ui_action"){
      logInfo(`we are not handling action different than "ui_action": ${type}`);
      return false
    }

    this.actionExecutor(
      message.payload.type,
      message.payload.parameters)
    return false;
  }
}