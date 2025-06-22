import {CommandMessage, Message} from "@src/shared/actions/content/core/types";
import { stateManager } from "./StateManager";
import {ActionExecutor} from "@src/shared/actions/content/core/AcitionExecutor";
import {PageStatusActionHandler} from "@src/shared/actions/content/pageStatus/PageStatusActionHandler";
import {PAGE_STATUS_ACTION} from "@src/shared/actions/content/pageStatus/PageStatusAction";
import {NAVIGATE_TO_PAGE_ACTION} from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";
import {NavigateToPageActionHandler} from "@src/shared/actions/content/navigateToPage/NavigateToPageActionHandler";
import {ActionContext} from "@src/shared/actions/content/core/ActionContext";
import {CLICK_ACTION} from "@src/shared/actions/content/click/ClickAction";
import {ClickActionHandler} from "@src/shared/actions/content/click/ClickActionHandler";
import {FILL_INPUT_ACTION} from "@src/shared/actions/content/fillInput/FillInputAction";
import {FillInputActionHandler} from "@src/shared/actions/content/fillInput/FillInputActionHandler";
import {PlayerUiContextState} from "@src/shared/contexts/PlayerContext";
import { ContentMessengerWrapper } from "./ContentMessenger";

// Actions that might cause page refresh
const ACTIONS_WITH_PAGE_REFRESH = ['navigate', 'click'];

export class ExecutorAttacher {
  private fullDomain: string;
  private contentPageContext: PlayerUiContextState;
  private actionExecutor: ActionExecutor;
  private messenger: ContentMessengerWrapper;

  // Re-export state management functions from StateManager for backward compatibility
  public setCurrentCommand = stateManager.setCurrentCommand.bind(stateManager);
  public setCommandStatus = stateManager.setCommandStatus.bind(stateManager);
  public setLogs = stateManager.setLogs.bind(stateManager);
  public addLog = stateManager.addLog.bind(stateManager);
  public subscribeToState = stateManager.subscribeToState.bind(stateManager);
  public getState = stateManager.getState.bind(stateManager);

  private messageListener: (
    message: CommandMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: Record<string, unknown>) => void
  ) => Promise<boolean>;

  constructor(
    contentPageContext: PlayerUiContextState,
  ) {
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

  async executeCommandAndHandleResult(
    messager: ContentMessengerWrapper,
    actionExecutor: ActionExecutor,
    actionContext: ActionContext,
    command: CommandMessage,
  ) {

    const fullDomain = actionContext.gameUrlInfo.fullDomain ?? "";
    const successLogPrefix = actionContext.isCurrentActionRestored ? "Command restored": "Command executed"
    return actionExecutor.execute(actionContext, command.payload.action, command.payload.parameters)
      .then(result => {
        console.log(`${successLogPrefix}: ${result.status}`);
        this.setCommandStatus(result.status);
        this.addLog(`${successLogPrefix}: ${result.status}`);

        // Send status update to service worker
        messager.sendMessage({
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
        console.log(`fail ${JSON.stringify(error)}`)
        console.error(`Command failed: ${error.message}`);
        this.setCommandStatus('error');
        this.addLog(`Command failed: ${error.message}`);

        // Send error to service worker
        messager.sendMessage({
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

  private registerActionHandlers(): void {
    this.actionExecutor.register(PAGE_STATUS_ACTION, new PageStatusActionHandler());
    this.actionExecutor.register(NAVIGATE_TO_PAGE_ACTION, new NavigateToPageActionHandler());
    this.actionExecutor.register(CLICK_ACTION, new ClickActionHandler());
    this.actionExecutor.register(FILL_INPUT_ACTION, new FillInputActionHandler());
  }

  private handleStateRestoration(): void {
    if (stateManager.loadStateFromStorage()) {
      stateManager.addLog('Restored state after page reload');
      
      // Clear the saved state to prevent reprocessing on future reloads
      stateManager.clearStateFromStorage();
      
      // Get the current state
      const state = stateManager.getState();
      
      // If we have a command that was in progress during reload, continue processing it
      if (state.currentCommand && state.commandStatus === 'in-progress') {
        const restoredCommand = state.currentCommand;
        stateManager.addLog(`Continuing command after reload: ${restoredCommand.payload.action}`);
        
        // For navigate commands, we're already at the destination, so mark as complete
        if (restoredCommand.payload.action === 'navigate' || restoredCommand.payload.action == 'navigateToScreenAction') {
          this.handleNavigationAfterReload(restoredCommand);
        } 
        // For click commands that caused a reload, we'll consider them done
        else if (restoredCommand.payload.action === 'click') {
          this.handleClickAfterReload(restoredCommand);
        }
        // For other commands, we might need to re-execute them
        else {
          this.reExecuteCommandAfterReload(restoredCommand);
        }
      }
    }
  }

  private handleNavigationAfterReload(restoredCommand: CommandMessage): void {
    stateManager.addLog('Navigation completed after reload');
    
    // Send completion status to background
    this.messenger.sendMessage({
      type: 'status',
      fullDomain: this.fullDomain,
      actionId: restoredCommand.actionId,
      timestamp: new Date().toISOString(),
      correlationId: restoredCommand.correlationId,
      payload: {
        status: 'done',
        details: {
          url: window.location.href,
        }
      }
    });
  }

  private handleClickAfterReload(restoredCommand: CommandMessage): void {
    stateManager.addLog('Click action completed (caused page reload)');
    
    this.messenger.sendMessage({
      type: 'status',
      fullDomain: this.fullDomain,
      actionId: restoredCommand.actionId,
      timestamp: new Date().toISOString(),
      correlationId: restoredCommand.correlationId,
      payload: {
        status: 'done',
        details: {
          url: window.location.href,
          reloadedAfterClick: true
        }
      }
    });
    
    stateManager.setCommandStatus('done');
  }

  private reExecuteCommandAfterReload(restoredCommand: CommandMessage): void {
    stateManager.addLog(`Re-executing command after reload: ${restoredCommand.payload.action}`);
    
    const actionContext: ActionContext = {
      isCurrentActionRestored: true,
      messenger: this.messenger,
      actionId: restoredCommand.actionId,
      ...this.contentPageContext,
    };
    
    // Re-execute the command using the helper function
    this.executeCommandAndHandleResult(this.messenger, this.actionExecutor, actionContext, restoredCommand)
      .catch(() => {
        // Error already handled in the helper function
      });
  }

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
      if (message.type === 'command') {
        console.log('Received command:', message);
        stateManager.setCurrentCommand(message);
        stateManager.setCommandStatus('in-progress');
        stateManager.addLog(`Received command: ${message.payload.action}`);
        
        // If this is an action that might cause a page refresh, save state immediately
        if (ACTIONS_WITH_PAGE_REFRESH.includes(message.payload.action)) {
          console.log('Command might cause page refresh, saving state');
          
          // Set last event before saving state
          stateManager.addLog('Preparing for possible page reload');
          
          // Save state to session storage
          stateManager.saveStateToStorage();
          
          // For navigate actions, we'll send an immediate acknowledgment
          if (message.payload.action === 'navigate') {
            this.messenger.sendMessage({
              fullDomain: this.fullDomain,
              type: 'status',
              actionId: message.actionId,
              timestamp: new Date().toISOString(),
              correlationId: message.correlationId,
              payload: {
                status: "in-progress",
                details: {
                  message: "Navigation started, page reload expected"
                },
              }
            });
          }
        }
        
        const actionContext: ActionContext = {
          isCurrentActionRestored: false,
          messenger: this.messenger,
          actionId: message.actionId,
          ...this.contentPageContext,
        };
        
        // Execute the command using the helper function
        this.executeCommandAndHandleResult(this.messenger, this.actionExecutor, actionContext, message)
          .catch(() => {
            // Error already handled in the helper function
          });
        
        sendResponse({ status: 'processing' });
        return true;
      }
      return false;
    };
  }

  private announceContentScriptReady(): void {
    this.messenger.sendMessage({
      actionId: "-1",
      type: 'contentScriptReady',
      fullDomain: this.fullDomain,
      timestamp: new Date().toISOString()
    });
  }

  private setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      // Save state to sessionStorage using StateManager
      stateManager.saveStateToStorage();
      
      // Get current state for the notification
      const state = stateManager.getState();
      
      // Notify service worker about the unload
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