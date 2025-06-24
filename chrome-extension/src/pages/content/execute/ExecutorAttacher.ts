import {BasePageResponse, CommandMessage, GenericStatusPayload, Message} from "@src/shared/actions/content/core/types";
import { stateManager } from "./StateManager";
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
import { PlayerUiContextState } from "@src/shared/contexts/PlayerContext";
import { ContentMessengerWrapper } from "./ContentMessenger";

// Actions that might cause page refresh
const ACTIONS_WITH_PAGE_REFRESH = ['navigate', 'click'];

/**
 * ExecutorAttacher is responsible for attaching action execution capabilities to the content page.
 * It handles command execution, state management, and communication with the service worker.
 */
export class ExecutorAttacher {
  private fullDomain: string;
  private contentPageContext: PlayerUiContextState;
  private actionExecutor: ActionExecutor;
  private messenger: ContentMessengerWrapper;
  private messageListener: (
    message: CommandMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: Record<string, unknown>) => void
  ) => Promise<boolean>;

  /**
   * Creates a new ExecutorAttacher instance.
   * @param contentPageContext The context of the content page
   */
  constructor(contentPageContext: PlayerUiContextState) {
    this.contentPageContext = contentPageContext;
    this.actionExecutor = new ActionExecutor();
    this.fullDomain = contentPageContext.gameUrlInfo.fullDomain ?? "";

    this.messenger = new ContentMessengerWrapper({
      sendMessage: (message: Message) => {
        chrome.runtime.sendMessage(message);
      }
    });

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
    chrome.runtime.onMessage.addListener(this.messageListener);

    // Announce that the content script is ready
    this.announceContentScriptReady();

    // Set up beforeunload handler for page reloads
    this.setupBeforeUnloadHandler();

    // Return cleanup function
    return () => {
      chrome.runtime.onMessage.removeListener(this.messageListener);
    };
  }

  /**
   * Sets the paused state of the executor.
   * @param paused Whether execution should be paused
   */
  public setPaused(paused: boolean): void {
    if (paused === stateManager.isPaused()) {
      return;
    }

    stateManager.setPaused(paused);

    // If unpausing and there's a command in progress, resume execution
    if (!paused) {
      const state = stateManager.getState();
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
      messenger: this.messenger,
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
        stateManager.setCommandStatus(result.status);
        stateManager.addLog(`${successLogPrefix}: ${result.status}`);

        // Send status update to service worker
        this.messenger.sendMessage({
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
        stateManager.setCommandStatus('error');
        stateManager.addLog(`Command failed: ${error.message}`);

        // Send error to service worker
        this.messenger.sendMessage({
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
    stateManager.addLog(`Resuming command execution: ${command.payload.action}`);

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
    if (!stateManager.loadStateFromStorage()) {
      return;
    }

    stateManager.addLog('Restored state after page reload');

    // Clear the saved state to prevent reprocessing on future reloads
    stateManager.clearStateFromStorage();

    // Get the current state
    const state = stateManager.getState();

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
    stateManager.addLog(`Command execution remains paused after reload: ${restoredCommand.payload.action}`);

    // Notify that the command is still paused
    this.sendPausedCommandStatus(restoredCommand, "Command execution is paused after page reload");
  }

  /**
   * Handles an active command after a page reload.
   * @param restoredCommand The command that was restored
   */
  private handleActiveCommandAfterReload(restoredCommand: CommandMessage): void {
    stateManager.addLog(`Continuing command after reload: ${restoredCommand.payload.action}`);

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
    stateManager.addLog('Navigation completed after reload');
    stateManager.setCommandStatus('done');

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
    stateManager.addLog('Click action completed (caused page reload)');
    stateManager.setCommandStatus('done');

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
    stateManager.addLog(`Re-executing command after reload: ${restoredCommand.payload.action}`);

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
  ) => Promise<boolean> {
    return async (
      message: CommandMessage, 
      sender: chrome.runtime.MessageSender, 
      sendResponse: (response?: Record<string, unknown>) => void
    ) => {
      console.log('Received message:', message);

      if (message.type !== 'command') {
        return false;
      }

      console.log('Received command:', message);
      this.handleIncomingCommand(message);

      sendResponse({ status: 'processing' });
      return true;
    };
  }

  /**
   * Handles an incoming command message.
   * @param message The command message to handle
   */
  private handleIncomingCommand(message: CommandMessage): void {
    stateManager.setCurrentCommand(message);
    stateManager.setCommandStatus('in-progress');
    stateManager.addLog(`Received command: ${message.payload.action}`);

    // If this is an action that might cause a page refresh, save state immediately
    if (ACTIONS_WITH_PAGE_REFRESH.includes(message.payload.action)) {
      this.handlePotentialPageRefreshAction(message);
    }

    // Check if execution is paused
    if (stateManager.isPaused()) {
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
    stateManager.addLog('Preparing for possible page reload');
    stateManager.saveStateToStorage();

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
    stateManager.addLog(`Command execution paused: ${message.payload.action}`);
    stateManager.saveStateToStorage();

    this.sendPausedCommandStatus(message, "Command execution is paused");
  }

  // ===== Messaging Helpers =====

  /**
   * Sends a status message indicating that navigation has started.
   * @param command The command message
   */
  private sendNavigationStartedStatus(command: CommandMessage): void {
    this.messenger.sendMessage({
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
    this.messenger.sendMessage({
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
    this.messenger.sendMessage({
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
    this.messenger.sendMessage({
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
      stateManager.saveStateToStorage();

      const state = stateManager.getState();

      this.messenger.sendMessage({
        type: 'event',
        fullDomain: this.fullDomain,
        actionId: state.currentCommand?.actionId || 'none',
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
}
