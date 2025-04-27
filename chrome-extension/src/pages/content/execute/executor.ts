import {executeCommand} from "@pages/content";
import { CommandMessage } from "@src/shared/types";

const ACTIONS_WITH_PAGE_REFRESH = ['navigate, click'];

// State management outside of React
let currentCommand: CommandMessage | null = null;
let commandStatus: string = 'idle';
let lastEvent: string = '';
let logs: string[] = [];

// Subscribers for state changes
type StateSubscriber = () => void;
const subscribers: StateSubscriber[] = [];

// State setters
export function setCurrentCommand(command: CommandMessage | null) {
  currentCommand = command;
  notifySubscribers();
}

export function setCommandStatus(status: string) {
  commandStatus = status;
  notifySubscribers();
}

export function setLastEvent(event: string) {
  lastEvent = event;
  notifySubscribers();
}

export function setLogs(newLogs: string[]) {
  logs = newLogs;
  notifySubscribers();
}

export function addLog(message: string) {
  logs = [...logs, `${new Date().toLocaleTimeString()}: ${message}`];
  notifySubscribers();
}

// Notify all subscribers when state changes
function notifySubscribers() {
  subscribers.forEach(subscriber => subscriber());
}

// Subscribe to state changes
export function subscribeToState(callback: StateSubscriber) {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
}

// Get current state
export function getState() {
  return {
    currentCommand,
    commandStatus,
    lastEvent,
    logs
  };
}

// Attach executor to handle commands
export function attachExecutor() {
  // Check for saved state on load
  const savedState = sessionStorage.getItem('tribalFarmState');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      setCurrentCommand(parsed.currentCommand);
      setCommandStatus(parsed.commandStatus);
      setLastEvent(parsed.lastEvent);
      setLogs(parsed.logs || []);
      addLog('Restored state after page reload');
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }

  const messageListener = (message: any, sender: any, sendResponse: any) => {
    if (message.type === 'command') {
      console.log('Received command:', message);
      setCurrentCommand(message);
      setCommandStatus('in-progress');
      addLog(`Received command: ${message.payload.action}`);

      if(currentCommand?.actionId == message.actionId == ACTIONS_WITH_PAGE_REFRESH.includes(message?.payload.action ?? "unknown")){
        chrome.runtime.sendMessage({
          type: 'status',
          actionId: message.actionId,
          timestamp: new Date().toISOString(),
          correlationId: message.correlationId,
          payload: {
            status: "done",
            details: "",
          }
        });
      }

      // Execute the command
      executeCommand(message)
        .then(result => {
          console.log(`Command executed: ${result.status}`);
          setCommandStatus(result.status);
          addLog(`Command executed: ${result.status}`);

          // Send status update to service worker
          chrome.runtime.sendMessage({
            type: 'status',
            actionId: message.actionId,
            timestamp: new Date().toISOString(),
            correlationId: message.correlationId,
            payload: {
              status: result.status,
              details: result.details
            }
          });
        })
        .catch(error => {
          console.error(`Command failed: ${error.message}`);
          setCommandStatus('error');
          addLog(`Command failed: ${error.message}`);

          // Send error to service worker
          chrome.runtime.sendMessage({
            type: 'error',
            actionId: message.actionId,
            timestamp: new Date().toISOString(),
            correlationId: message.correlationId,
            payload: {
              message: error.message,
              details: error.details
            }
          });
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
    // Save state to sessionStorage
    sessionStorage.setItem('tribalFarmState', JSON.stringify({
      currentCommand,
      commandStatus,
      lastEvent,
      logs
    }));

    // Notify service worker about the unload
    chrome.runtime.sendMessage({
      type: 'event',
      actionId: currentCommand?.actionId || 'none',
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
