import { CommandMessage } from "@src/shared/actions/core/types";
import { stateManager } from "./StateManager";
import {executeCommand} from "@src/shared/actions/executeCommand";
import {ActionExecutor} from "@src/shared/actions/core/AcitionExecutor";
import {PageStatusActionHandler} from "@src/shared/actions/pageStatus/PageStatusActionHandler";

// Helper function to execute a command and handle its result
function executeCommandAndHandleResult(
  actionExecutor: ActionExecutor,
  command: CommandMessage, 
  successLogPrefix: string = "Command executed"
) {
  return executeCommand(actionExecutor, command)
    .then(result => {
      console.log(`${successLogPrefix}: ${result.status}`);
      setCommandStatus(result.status);
      addLog(`${successLogPrefix}: ${result.status}`);

      // Send status update to service worker
      chrome.runtime.sendMessage({
        type: 'status',
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
      setCommandStatus('error');
      addLog(`Command failed: ${error.message}`);

      // Send error to service worker
      chrome.runtime.sendMessage({
        type: 'error',
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

// Actions that might cause page refresh
const ACTIONS_WITH_PAGE_REFRESH = ['navigate', 'click'];

// Re-export state management functions from StateManager for backward compatibility
export const setCurrentCommand = stateManager.setCurrentCommand.bind(stateManager);
export const setCommandStatus = stateManager.setCommandStatus.bind(stateManager);
export const setLogs = stateManager.setLogs.bind(stateManager);
export const addLog = stateManager.addLog.bind(stateManager);
export const subscribeToState = stateManager.subscribeToState.bind(stateManager);
export const getState = stateManager.getState.bind(stateManager);

export const actionExecutor = new ActionExecutor();

// Attach executor to handle commands
export function attachExecutor() {
  actionExecutor.register("pageStatusAction", new PageStatusActionHandler());
  // Check for saved state on load
  if (stateManager.loadStateFromStorage()) {
    addLog('Restored state after page reload');

    // Clear the saved state to prevent reprocessing on future reloads
    stateManager.clearStateFromStorage();

    // Get the current state
    const state = stateManager.getState();

    // If we have a command that was in progress during reload, continue processing it
    if (state.currentCommand && state.commandStatus === 'in-progress') {
      const restoredCommand = state.currentCommand;
      addLog(`Continuing command after reload: ${restoredCommand.payload.action}`);

      // For navigate commands, we're already at the destination, so mark as complete
      if (restoredCommand.payload.action === 'navigate' || restoredCommand.payload.action == 'navigateToScreenAction') {
        addLog('Navigation completed after reload');

        // Send completion status to background
        chrome.runtime.sendMessage({
          type: 'status',
          actionId: restoredCommand.actionId,
          timestamp: new Date().toISOString(),
          correlationId: restoredCommand.correlationId,
          payload: {
            status: 'done',
            details: {
              url: window.location.href,
              title: document.title
            }
          }
        });

        // // Also send a contentScriptReady event for orchestration
        // chrome.runtime.sendMessage({
        //   type: 'event',
        //   actionId: restoredCommand.actionId,
        //   timestamp: new Date().toISOString(),
        //   correlationId: restoredCommand.correlationId,
        //   payload: {
        //     eventType: 'stateChange',
        //     details: {
        //       type: 'contentScriptReady',
        //       url: window.location.href
        //     }
        //   }
        // });
        //
        // setCommandStatus('done');
      } 
      // For other commands that were interrupted by reload, try to continue them
      else if (restoredCommand.payload.action === 'click') {
        // For click commands that caused a reload, we'll consider them done
        // since the click already happened and caused the reload
        addLog('Click action completed (caused page reload)');

        chrome.runtime.sendMessage({
          type: 'status',
          actionId: restoredCommand.actionId,
          timestamp: new Date().toISOString(),
          correlationId: restoredCommand.correlationId,
          payload: {
            status: 'done',
            details: {
              reloadedAfterClick: true
            }
          }
        });

        setCommandStatus('done');
      }
      // For other commands, we might need to re-execute them
      else {
        addLog(`Re-executing command after reload: ${restoredCommand.payload.action}`);

        // Re-execute the command using the helper function
        executeCommandAndHandleResult(actionExecutor, restoredCommand, "Re-executed command completed")
          .catch(() => {
            // Error already handled in the helper function
          });
      }
    }
  }

  const messageListener = (
    message: CommandMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response?: Record<string, unknown>) => void
  ) => {
    console.log('Received message:', message);
    if (message.type === 'command') {
      console.log('Received command:', message);
      setCurrentCommand(message);
      setCommandStatus('in-progress');
      addLog(`Received command: ${message.payload.action}`);

      // If this is an action that might cause a page refresh, save state immediately
      if (ACTIONS_WITH_PAGE_REFRESH.includes(message.payload.action)) {
        console.log('Command might cause page refresh, saving state');

        // Set last event before saving state
        addLog('Preparing for possible page reload');

        // Save state to session storage
        stateManager.saveStateToStorage();

        // For navigate actions, we'll send an immediate acknowledgment
        // The actual result will be sent after the page reloads and the command completes
        if (message.payload.action === 'navigate') {
          chrome.runtime.sendMessage({
            type: 'status',
            actionId: message.actionId,
            timestamp: new Date().toISOString(),
            correlationId: message.correlationId,
            payload: {
              status: "in-progress",
              details: "Navigation started, page reload expected",
            }
          });
        }
      }

      // Execute the command using the helper function
      executeCommandAndHandleResult(actionExecutor, message)
        .catch(() => {
          // Error already handled in the helper function
        });

      sendResponse({ status: 'processing' });
      return true;
    }
    return false;
  };

  chrome.runtime.onMessage.addListener(messageListener);

  // Announce that the content script is ready
  chrome.runtime.sendMessage({
    type: 'contentScriptReady',
    timestamp: new Date().toISOString()
  });

  // Set up beforeunload handler for page reloads
  window.addEventListener('beforeunload', () => {
    // Save state to sessionStorage using StateManager
    stateManager.saveStateToStorage();

    // Get current state for the notification
    const state = stateManager.getState();

    // Notify service worker about the unload
    chrome.runtime.sendMessage({
      type: 'event',
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

  return () => {
    chrome.runtime.onMessage.removeListener(messageListener);
  };
}
