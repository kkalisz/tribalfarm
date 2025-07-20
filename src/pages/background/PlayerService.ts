import { PlayerSettings } from "@src/shared/hooks/usePlayerSettings";
 import {
  BackendActionContext,
  BackendActionHelpers,
} from "@src/shared/actions/backend/core/BackendActionContext";
import { TabMessenger } from "@src/shared/actions/content/core/TabMessenger";
import { ActionScheduler } from "@src/shared/actions/backend/core/ActionScheduler";
import { MessengerWrapper } from "@src/shared/actions/content/core/MessengerWrapper";
import { BackendAction } from "@src/shared/actions/backend/core/BackendAction";
import MessageSender = chrome.runtime.MessageSender;
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {ServerConfig} from "@pages/background/serverConfig";
import {LoggerImpl} from "@src/shared/log/LoggerImpl";
import {MessageRouter} from "@src/shared/services/MessageRouter";
import {Message, UiActionMessage} from "@src/shared/actions/content/core/types";
import {Logger} from "@src/shared/log/Logger";

export class PlayerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, BackendAction<any, any>> = {};
  private readonly actionContext: BackendActionContext;

  private async executeWithRetries<T>(
    operation: () => Promise<T>, // Function to execute
    logger: Logger, // Logger for logging information and errors
    actionType: string, // The type of action being executed
    maxRetries: number = 3, // Maximum number of retries
    retryDelayMs: number = 1000 // Delay between retries
  ): Promise<T> {
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
          logger.logInfo({
            type: "action",
            content: `Retrying action of type: ${actionType}. Attempt: ${attempt}`,
          });

          // Add delay before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }

        logger.logInfo({
          type: "action",
          content: `Executing action of type: ${actionType}`,
        });

        return await operation(); // Execute the operation
      } catch (error) {
        attempt++;

        logger.logError({
          type: "action",
          content: `Error while executing action of type: ${actionType}. Attempt: ${attempt}. Error: ${error}`,
        });

        // If all retries are exceeded, rethrow the error
        if (attempt > maxRetries) {
          logger.logError({
            type: "action",
            content: `Failed to execute action of type: ${actionType} after ${maxRetries} retries.`,
          });
          throw error;
        }
      }
    }

    // Should never be reached
    throw new Error("Unexpected execution flow in executeWithRetries");
  }

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

    await this.executeWithRetries(
      () => handler.execute(this.actionContext, action), // Pass the handler's execute function
      this.actionContext.logger, // Provide the logger instance
      type, // Action type for logging
      3, // Max retries (you can adjust this or fetch from config)
      1000 // Retry delay in milliseconds
    ).catch((error) => {
      this.actionContext.logger.logError({
        type: "action",
        content: `Error while executing action of type: ${type}. Error: ${error} skipping`,
      });
    });
  };

  constructor(
    private readonly playerSettings: PlayerSettings,
    private readonly serverConfig: ServerConfig,
    public tabMessanger: TabMessenger,
    private readonly actionScheduler: ActionScheduler,
    public database: GameDataBaseAccess,
    private readonly mainTabId: number,
    messageRouter: MessageRouter,
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

    messageRouter.addListener<UiActionMessage>("ui_action", (message: UiActionMessage, sender: MessageSender, sendResponse: (response?: any) => void) => {
      return this.onUiActionMessage(message, sender, sendResponse);
    });

    messageRouter.addListener("status", (message: Message, sender: MessageSender, _: any) => {
      tabMessanger.messageListener(message, sender);
      return false;
    });

    messageRouter.addListener("error" ,(message: Message, sender: MessageSender, _: any) => {
      tabMessanger.messageListener(message, sender);
      return false;
    });

    // Set up the executor for the action scheduler
    this.actionScheduler.setExecutor(this.actionExecutor);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerHandler(type: string, action: BackendAction<any, any>) {
    this.handlers[type] = action;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  private onUiActionMessage(message: UiActionMessage, _: MessageSender, _sendResponse: (response?: any) => void): boolean {
    this.actionExecutor(
      message.payload.type,
      message.payload.parameters)
    return false;
  }
}