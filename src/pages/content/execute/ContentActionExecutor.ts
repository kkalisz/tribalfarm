import {BasePageResponse, CommandMessage, GenericStatusPayload} from "@src/shared/actions/content/core/types";
import {StateManager} from "./StateManager";
import { ActionExecutor } from "@src/shared/actions/content/core/AcitionExecutor";
import { PageStatusActionHandler } from "@src/shared/actions/content/pageStatus/PageStatusActionHandler";
import { PAGE_STATUS_ACTION } from "@src/shared/actions/content/pageStatus/PageStatusAction";
import { NAVIGATE_TO_PAGE_ACTION } from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";
import { NavigateToPageActionHandler } from "@src/shared/actions/content/navigateToPage/NavigateToPageActionHandler";
import { ActionContext } from "@src/shared/actions/content/core/ActionContext";
import { CLICK_ACTION } from "@src/shared/actions/content/click/ClickAction";
import { ClickActionHandler } from "@src/shared/actions/content/click/ClickActionHandler";
import { FILL_INPUT_ACTION } from "@src/shared/actions/content/fillInput/FillInputAction";
import { FillInputActionHandler } from "@src/shared/actions/content/fillInput/FillInputActionHandler";
import { PlayerUiContext } from "@src/shared/contexts/PlayerContext";
import {MessageRouter} from '@src/shared/services/MessageRouter';

// Actions that might cause page refresh
const ACTIONS_WITH_PAGE_REFRESH = ['navigate', 'click'];

export class ContentActionExecutor {
  private readonly messageRouter = new MessageRouter();

  private readonly fullDomain: string;
  public contentPageContext: PlayerUiContext;
  private readonly actionExecutor: ActionExecutor;
  public stateManager: StateManager;
  private readonly messageListener: (
    message: CommandMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: Record<string, unknown>) => void
  ) => boolean;

  /**
   * Creates a new ExecutorAttacher instance.
   * @param contentPageContext The context of the content page
   */
  constructor(contentPageContext: PlayerUiContext) {
    this.contentPageContext = contentPageContext;
    this.actionExecutor = new ActionExecutor();
    this.fullDomain = contentPageContext.gameUrlInfo.fullDomain ?? "";
    this.stateManager = new StateManager(this.fullDomain);

    this.messageListener = this.createMessageListener();
  }

  /**
   * Attaches the executor to the content page.
   * @returns A cleanup function to detach the executor
   */
  public attach(): () => void {
    // Register action handlers
    this.registerActionHandlers();

    // Check for saved state on load
    this.handleStateRestoration();

    // Set up message listener
    this.messageRouter.addListener("command", this.messageListener);

    // Announce that the content script is ready
    this.announceContentScriptReady();

    // Set up beforeunload handler for page reloads
    this.setupBeforeUnloadHandler();

    // Return cleanup function
    return () => {
      this.messageRouter.removeListener("command");
    };
  }

  /**
   * Sets the paused state of the executor.
   * @param paused Whether execution should be paused
   */
  public setPaused(paused: boolean): void {
    if (paused === this.stateManager.getState().paused) {
      return;
    }

    this.stateManager.setPaused(paused);

    // If unpausing and there's a command in progress, resume execution
    if (!paused) {
      const state = this.stateManager.getState();
      if (state.currentCommand && state.commandStatus === 'in-progress') {
        this.resumeCommand(state.currentCommand);
      }
    }
  }

  // ===== Action Handling =====

  /**
   * Registers action handlers with the action executor.
   */
  private registerActionHandlers(): void {
    this.actionExecutor.register(PAGE_STATUS_ACTION, new PageStatusActionHandler());
    this.actionExecutor.register(NAVIGATE_TO_PAGE_ACTION, new NavigateToPageActionHandler());
    this.actionExecutor.register(CLICK_ACTION, new ClickActionHandler());
    this.actionExecutor.register(FILL_INPUT_ACTION, new FillInputActionHandler());
  }

  /**
   * Executes a command and handles the result.
   * @param command The command to execute
   * @param isRestored Whether the command is being restored after a page reload
   * @returns A promise that resolves when the command is executed
   */
  private executeCommand(command: CommandMessage, isRestored: boolean = false): Promise<GenericStatusPayload<BasePageResponse>> {
    const actionContext: ActionContext = {
      isCurrentActionRestored: isRestored,
      actionId: command.actionId,
      ...this.contentPageContext,
    };

    return this.executeCommandAndHandleResult(actionContext, command);
  }

  /**
   * Executes a command and handles the result.
   * @param actionContext The context for the action
   * @param command The command to execute
   * @returns A promise that resolves with the result of the command
   */
  private executeCommandAndHandleResult(
    actionContext: ActionContext,
    command: CommandMessage,
  ): Promise<GenericStatusPayload<BasePageResponse>> {
    const fullDomain = actionContext.gameUrlInfo.fullDomain ?? "";
    const successLogPrefix = actionContext.isCurrentActionRestored ? "Command restored" : "Command executed";

    return this.actionExecutor.execute(actionContext, command.payload.action, command.payload.parameters)
      .then(result => {
        console.log(`${successLogPrefix}: ${result.status}`);
        this.stateManager.setCommandStatus(result.status);
        this.stateManager.addLog(`${successLogPrefix}: ${result.status}`);

        // Send status update to service worker
        this.contentPageContext.messenger.sendMessage({
          type: 'status',
          fullDomain: fullDomain,
          actionId: command.actionId,
          timestamp: new Date().toISOString(),
          correlationId: command.correlationId,
          payload: {
            status: result.status,
            details: result.details
          }
        });

        return result;
      })
      .catch(error => {
        console.log(`fail ${JSON.stringify(error)}`);
        console.error(`Command failed: ${error.message}`);
        this.stateManager.setCommandStatus('error');
        this.stateManager.addLog(`Command failed: ${error.message}`);

        // Send error to service worker
        this.contentPageContext.messenger.sendMessage({
          type: 'error',
          fullDomain: fullDomain,
          actionId: command.actionId,
          timestamp: new Date().toISOString(),
          correlationId: command.correlationId,
          payload: {
            message: error.message,
            details: error.details
          }
        });

        throw error;
      });
  }

  /**
   * Resumes execution of a paused command.
   * @param command The command to resume
   */
  private resumeCommand(command: CommandMessage): void {
    this.stateManager.addLog(`Resuming command execution: ${command.payload.action}`);

    this.executeCommand(command)
      .catch(() => {
        // Error already handled in executeCommandAndHandleResult
      });
  }

  // ===== State Management =====

  /**
   * Handles restoration of state after a page reload.
   */
  private handleStateRestoration(): void {
    if (!this.stateManager.loadStateFromStorage()) {
      return;
    }

    this.stateManager.addLog('Restored state after page reload');

    // Clear the saved state to prevent reprocessing on future reloads
    this.stateManager.clearStateFromStorage();

    // Get the current state
    const state = this.stateManager.getState();

    // If we have a command that was in progress during reload, continue processing it
    if (state.currentCommand && state.commandStatus === 'in-progress') {
      this.handleRestoredCommand(state.currentCommand, state.paused);
    }
  }

  /**
   * Handles a command that was restored after a page reload.
   * @param restoredCommand The command that was restored
   * @param isPaused Whether execution is paused
   */
  private handleRestoredCommand(restoredCommand: CommandMessage, isPaused: boolean): void {
    if (isPaused) {
      this.handlePausedCommandAfterReload(restoredCommand);
    } else {
      this.handleActiveCommandAfterReload(restoredCommand);
    }
  }

  /**
   * Handles a paused command after a page reload.
   * @param restoredCommand The command that was restored
   */
  private handlePausedCommandAfterReload(restoredCommand: CommandMessage): void {
    this.stateManager.addLog(`Command execution remains paused after reload: ${restoredCommand.payload.action}`);

    // Notify that the command is still paused
    this.sendPausedCommandStatus(restoredCommand, "Command execution is paused after page reload");
  }

  /**
   * Handles an active command after a page reload.
   * @param restoredCommand The command that was restored
   */
  private handleActiveCommandAfterReload(restoredCommand: CommandMessage): void {
    this.stateManager.addLog(`Continuing command after reload: ${restoredCommand.payload.action}`);

    const action = restoredCommand.payload.action;

    // For navigate commands, we're already at the destination, so mark as complete
    if (action === 'navigate' || action === 'navigateToScreenAction') {
      this.handleNavigationAfterReload(restoredCommand);
    } 
    // For click commands that caused a reload, we'll consider them done
    else if (action === 'click') {
      this.handleClickAfterReload(restoredCommand);
    }
    // For other commands, we might need to re-execute them
    else {
      this.reExecuteCommandAfterReload(restoredCommand);
    }
  }

  /**
   * Handles a navigation command after a page reload.
   * @param restoredCommand The command that was restored
   */
  private handleNavigationAfterReload(restoredCommand: CommandMessage): void {
    this.stateManager.addLog('Navigation completed after reload');
    this.stateManager.setCommandStatus('done');

    // Send completion status to background
    this.sendCommandCompletionStatus(restoredCommand, {
      url: window.location.href
    });
  }

  /**
   * Handles a click command after a page reload.
   * @param restoredCommand The command that was restored
   */
  private handleClickAfterReload(restoredCommand: CommandMessage): void {
    this.stateManager.addLog('Click action completed (caused page reload)');
    this.stateManager.setCommandStatus('done');

    this.sendCommandCompletionStatus(restoredCommand, {
      url: window.location.href,
      reloadedAfterClick: true
    });
  }

  /**
   * Re-executes a command after a page reload.
   * @param restoredCommand The command to re-execute
   */
  private reExecuteCommandAfterReload(restoredCommand: CommandMessage): void {
    this.stateManager.addLog(`Re-executing command after reload: ${restoredCommand.payload.action}`);

    this.executeCommand(restoredCommand, true)
      .catch(() => {
        // Error already handled in executeCommandAndHandleResult
      });
  }

  // ===== Message Handling =====

  /**
   * Creates a message listener for handling commands from the service worker.
   * @returns A function that handles messages
   */
  private createMessageListener(): (
    message: CommandMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response?: Record<string, unknown>) => void
  ) => boolean {
    return (
      message: CommandMessage, 
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: Record<string, unknown>) => void
    ) => {
      if (message.type === 'command') {
        this.handleIncomingCommand(message);
      }
      return false;
    };
  }

  /**
   * Handles an incoming command message.
   * @param message The command message to handle
   */
  private handleIncomingCommand(message: CommandMessage): void {
    this.stateManager.setCurrentCommand(message);
    this.stateManager.setCommandStatus('in-progress');
    this.stateManager.addLog(`Received command: ${message.payload.action}`);

    // If this is an action that might cause a page refresh, save state immediately
    if (ACTIONS_WITH_PAGE_REFRESH.includes(message.payload.action)) {
      this.handlePotentialPageRefreshAction(message);
    }

    // Check if execution is paused
    if (this.stateManager.getState().paused) {
      this.handlePausedCommand(message);
    } else {
      this.executeCommand(message)
        .catch(() => {
          // Error already handled in executeCommandAndHandleResult
        });
    }
  }

  /**
   * Handles an action that might cause a page refresh.
   * @param message The command message
   */
  private handlePotentialPageRefreshAction(message: CommandMessage): void {
    console.log('Command might cause page refresh, saving state');
    this.stateManager.addLog('Preparing for possible page reload');
    this.stateManager.saveStateToStorage();

    // For navigate actions, we'll send an immediate acknowledgment
    if (message.payload.action === 'navigate') {
      this.sendNavigationStartedStatus(message);
    }
  }

  /**
   * Handles a command when execution is paused.
   * @param message The command message
   */
  private handlePausedCommand(message: CommandMessage): void {
    this.stateManager.addLog(`Command execution paused: ${message.payload.action}`);
    this.stateManager.saveStateToStorage();

    this.sendPausedCommandStatus(message, "Command execution is paused");
  }

  // ===== Messaging Helpers =====

  /**
   * Sends a status message indicating that navigation has started.
   * @param command The command message
   */
  private sendNavigationStartedStatus(command: CommandMessage): void {
    this.contentPageContext.messenger.sendMessage({
      fullDomain: this.fullDomain,
      type: 'status',
      actionId: command.actionId,
      timestamp: new Date().toISOString(),
      correlationId: command.correlationId,
      payload: {
        status: "in-progress",
        details: {
          message: "Navigation started, page reload expected"
        },
      }
    });
  }

  /**
   * Sends a status message indicating that a command is paused.
   * @param command The command message
   * @param message The message to include in the status
   */
  private sendPausedCommandStatus(command: CommandMessage, message: string): void {
    this.contentPageContext.messenger.sendMessage({
      type: 'status',
      fullDomain: this.fullDomain,
      actionId: command.actionId,
      timestamp: new Date().toISOString(),
      correlationId: command.correlationId,
      payload: {
        status: 'in-progress',
        details: {
          paused: true,
          message: message
        }
      }
    });
  }

  /**
   * Sends a status message indicating that a command has completed.
   * @param command The command message
   * @param details Additional details to include in the status
   */
  private sendCommandCompletionStatus(command: CommandMessage, details: Record<string, unknown>): void {
    this.contentPageContext.messenger.sendMessage({
      type: 'status',
      fullDomain: this.fullDomain,
      actionId: command.actionId,
      timestamp: new Date().toISOString(),
      correlationId: command.correlationId,
      payload: {
        status: 'done',
        details: details
      }
    });
  }

  /**
   * Announces that the content script is ready.
   */
  private announceContentScriptReady(): void {
    this.contentPageContext.messenger.sendMessage({
      actionId: "-1",
      type: 'contentScriptReady',
      fullDomain: this.fullDomain,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sets up a handler for the beforeunload event to save state before page unload.
   */
  private setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.stateManager.saveStateToStorage();

      const state = this.stateManager.getState();

      this.contentPageContext.messenger.sendMessage({
        type: 'event',
        fullDomain: this.fullDomain,
        actionId: state.currentCommand?.actionId ?? '',
        timestamp: new Date().toISOString(),
        payload: {
          eventType: 'stateChange',
          details: {
            type: 'pageUnload'
          }
        }
      });
    });
  }

  public async sendUiActionRequest<T =  any>(payload: { type: string, parameters: T }): Promise<void> {
    this.contentPageContext.messenger.sendMessage({
      type: "ui_action",
      fullDomain: this.fullDomain,
      actionId: "",
      timestamp: new Date().toISOString(),
      payload: {
        type: payload.type,
        parameters: payload.parameters as Record<string, any>
      },
    });
  }
}
