import {CommandMessage, Message} from '@src/shared/actions/content/core/types';
import {logInfo} from "@src/shared/helpers/sendLog";
import {IDBPDatabase, openDB} from "idb";
import {PlayerSettingsManager} from "@src/shared/services/PlayerSettingsManager";
import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {settingsStorage} from "@src/shared/services/settingsStorage";
import {PLAYER_SETTINGS_STORAGE_KEY} from "@src/shared/hooks/usePlayerSettings";
import {orchestrateOnTab, TabMessenger} from "@src/shared/actions/content/core/TabMessenger";
import WorldConfigManager from "@src/shared/services/WorldConfigManager";
import {scavengeVillage} from "@src/shared/actions/backend/scavenge/scavengeVillage";

// Connection state
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
let isConnecting = false;
const maxReconnectDelay = 30000; // 30 seconds

// Command state
let currentCommand: CommandMessage | null = null;
const commandQueue: CommandMessage[] = [];
let activeTabId: number | null = null;
let activeTabMessenger: TabMessenger | null = null;

// Declare a variable to hold the singleton instance
let dbInstance: IDBPDatabase | null = null;

// Function to get or initialize the singleton database
export async function getDB(): Promise<IDBPDatabase> {
  if (!dbInstance) {
    // Only initialize the database if it hasn't been initialized yet
    dbInstance = await openDB('tribal', 1, {
      upgrade(db) {
        // if (!db.objectStoreNames.contains('keyval')) {
        //   db.createObjectStore('keyval');
        // }
      },
    });
  }
  return dbInstance;
}

// Connect to WebSocket server
function connectWebSocket() {
  //TODO
  return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    logInfo('WebSocket already connected or connecting');
    return;
  }

  if (isConnecting) {
    logInfo('Connection already in progress');
    return;
  }

  isConnecting = true;
  const backendUrl = 'ws://localhost:8080/ws'; // Configure as needed

  logInfo(`Connecting to WebSocket at ${backendUrl}`);
  socket = new WebSocket(backendUrl);

  socket.onopen = () => {
    logInfo('WebSocket connection established');
    isConnecting = false;
    reconnectAttempts = 0;

    // Process any queued commands
    processCommandQueue();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data) as Message;
      handleIncomingMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onclose = (event) => {
    logInfo(`WebSocket connection closed: ${event.code} ${event.reason}`);
    socket = null;
    isConnecting = false;

    // Schedule reconnection with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
    reconnectAttempts++;

    logInfo(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
    setTimeout(connectWebSocket, delay);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    // The onclose handler will be called after this
  };
}

// Handle incoming messages from the WebSocket
function handleIncomingMessage(message: Message) {
  logInfo('Received message:', message);

  switch (message.type) {
    case 'command':
      // Store the command and forward to content script
      currentCommand = message;
      forwardCommandToContentScript(message);
      break;

    case 'ack':
      // Handle acknowledgment
      logInfo('Command acknowledged:', message.actionId);
      break;

    default:
      logInfo('Unhandled message type:', message.type);
  }
}

// Forward command to the active content script
async function forwardCommandToContentScript(command: CommandMessage) {
  if (!activeTabId) {
    logInfo('No active tab, queuing command');
    commandQueue.push(command);
    return;
  }

  // Create or reuse TabMessenger for the active tab
  if (!activeTabMessenger || activeTabMessenger.getTabId() !== activeTabId) {
    if (activeTabMessenger) {
      activeTabMessenger.dispose();
    }
    activeTabMessenger = new TabMessenger(activeTabId);
  }

  try {
    // Use orchestrateOnTab for complex operations that might involve page reloads
    if (command.payload.action === 'navigate' || command.payload.action === 'click') {
      orchestrateOnTab(activeTabId, async (messenger) => {
        logInfo(`Orchestrating ${command.payload.action} command on tab ${activeTabId}`);

        // Send the command
        const result = await messenger.sendCommand(
          command.payload.action, 
          command.payload.parameters
        );

        // If this is a navigation command, wait for the page to load
        if (command.payload.action === 'navigate') {
          await messenger.waitFor('event',
            (msg) => msg.type === 'event' && 
                    msg.payload.eventType === 'stateChange' && 
                    msg.payload.details.type === 'contentScriptReady',
            30000
          );
        }

        return result;
      }).then(result => {
        logInfo(`Command ${command.payload.action} orchestrated successfully:`, result);

        // Forward the result to the WebSocket if connected
        if (socket && socket.readyState === WebSocket.OPEN) {
          const statusMessage = {
            type: 'status',
            actionId: command.actionId,
            timestamp: new Date().toISOString(),
            correlationId: command.correlationId,
            payload: {
              status: 'done',
              details: result
            }
          };
          socket.send(JSON.stringify(statusMessage));
        }
      }).catch(error => {
        console.error(`Error orchestrating ${command.payload.action} command:`, error);

        // Forward the error to the WebSocket if connected
        if (socket && socket.readyState === WebSocket.OPEN) {
          const errorMessage = {
            type: 'error',
            actionId: command.actionId,
            timestamp: new Date().toISOString(),
            correlationId: command.correlationId,
            payload: {
              message: error.message || 'Unknown error',
              details: error
            }
          };
          socket.send(JSON.stringify(errorMessage));
        }
      });
    } else {
      // For simpler commands, just use the TabMessenger directly
      activeTabMessenger.send(
        command.payload.action, 
        command.payload.parameters
      ).then(result => {
        logInfo(`Command ${command.payload.action} executed successfully:`, result);
      }).catch(error => {
        console.error(`Error executing ${command.payload.action} command:`, error);
        commandQueue.push(command);
      });
    }
  } catch (error) {
    console.error('Error forwarding command to content script:', error);
    commandQueue.push(command);
  }
}

// Process the command queue
function processCommandQueue() {
  if (commandQueue.length === 0 || !activeTabId || !socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  while (commandQueue.length > 0) {
    const command = commandQueue.shift();
    if (command) {
      forwardCommandToContentScript(command);
    }
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logInfo('Message from content script:', message, 'Sender:', sender);
  if(message.world) {
    return;
  }

  // Track the active tab
  // TODO handle main tabs and worker tabs
  if (sender.tab && sender.tab.id) {
    activeTabId = sender.tab.id;
  }

  const hasValidPlayerSettings = await PlayerSettingsManager.getInstance().hasValidSettings();

  if(!hasValidPlayerSettings){
    // return TODO
    return true;
  }


  // Handle different message types
  if(message.type === 'test') {
    logInfo('Received command from content script:');
    if(message.content === 'test1') {
      logInfo('start test 1:', message);
      orchestrateOnTab(sender.tab!.id!, async (messenger) => {

        logInfo('before send');
        const context: BackendActionContext = {
          messenger: messenger,
          playerSettings: await PlayerSettingsManager.getInstance().getPlayerSettings(),
          worldConfig: await WorldConfigManager.getInstance().getWorldConfig()
        }

        await scavengeVillage(context, {})
      });
      return
    }
    if(message.content === 'test1') {
      return
    }
    return true;
  }
  if (message.type === 'contentScriptReady') {
    logInfo('Content script ready in tab', activeTabId);

    // If there's a current command, send it to the newly ready content script
    if (currentCommand) {
      forwardCommandToContentScript(currentCommand);
    } else {
      processCommandQueue();
    }

    sendResponse({ status: 'acknowledged' });
    return true;
  }

  // Forward status updates to the WebSocket
  if (message.type === 'status' || message.type === 'event' || message.type === 'error') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      logInfo('WebSocket not connected, reconnecting...');
      connectWebSocket();
    }

    sendResponse({ status: 'forwarded' });
    return true;
  }

  return false;
});

// // Function to check autoScavenge setting and start/stop interval
// async function checkAutoScavengeSetting() {
//   try {
//     const autoScavengeEnabled = await settingsStorage.getSetting<boolean>('autoScavenge', false);
//     logInfo(`Auto scavenge setting checked: ${autoScavengeEnabled}`);
//
//     if (autoScavengeEnabled) {
//       startAutoScavengeInterval();
//     } else {
//       stopAutoScavengeInterval();
//     }
//   } catch (error) {
//     console.error('Error checking auto scavenge setting:', error);
//   }
// }

// // Function to start auto scavenge interval
// function startAutoScavengeInterval() {
//   if (autoScavengeInterval !== null) {
//     logInfo('Auto scavenge interval already running');
//     return;
//   }
//
//   logInfo('Starting auto scavenge interval');
//   executeAutoScavengeAction(); // Execute immediately on start
//
//   // Set interval to execute every 5 minutes
//   // autoScavengeInterval = window.setInterval(() => {
//   //   executeAutoScavengeAction();
//   // }, AUTO_SCAVENGE_CHECK_INTERVAL);
// }
//
// // Function to stop auto scavenge interval
// function stopAutoScavengeInterval() {
//   if (autoScavengeInterval === null) {
//     logInfo('No auto scavenge interval running');
//     return;
//   }
//
//   logInfo('Stopping auto scavenge interval');
//   clearInterval(autoScavengeInterval);
//   autoScavengeInterval = null;
// }
//
// // Function to execute auto scavenge action
// function executeAutoScavengeAction() {
//   logInfo('Executing auto scavenge action');
//
//   if (!activeTabId) {
//     logInfo('No active tab, cannot execute auto scavenge action');
//     return;
//   }
//
//   // Use orchestrateOnTab for reliable execution across page reloads
//   orchestrateOnTab(activeTabId, async (messenger) => {
//     logInfo('Starting auto scavenge orchestration');
//
//     // Navigate to scavenge page
//     logInfo('Navigating to scavenge page');
//     await messenger.send('navigate', {
//       url: SCAVENGE_PAGE_URL
//     });
//
//     // Wait for page to load and content script to be ready
//     logInfo('Waiting for page to load after navigation');
//     await messenger.waitFor('event',
//       (msg) => msg.type === 'event' &&
//               msg.payload.eventType === 'stateChange' &&
//               msg.payload.details.type === 'contentScriptReady',
//       30000
//     );
//
//     // Wait a bit more for the page to fully render
//     await new Promise(resolve => setTimeout(resolve, 2000));
//
//     // Click the scavenge button
//     logInfo('Clicking scavenge button');
//     const result = await messenger.send('click', {
//       selector: SCAVENGE_BUTTON_SELECTOR
//     });
//
//     logInfo('Auto scavenge completed successfully', result);
//     return result;
//   }).catch(error => {
//     console.error('Error during auto scavenge orchestration:', error);
//   });
// }
//
// // Listen for changes to the autoScavenge setting
// settingsStorage.addListener('autoScavenge', (settings) => {
//   const autoScavengeEnabled = settings['autoScavenge'];
//   logInfo(`Auto scavenge setting changed: ${autoScavengeEnabled}`);
//
//   if (autoScavengeEnabled) {
//     startAutoScavengeInterval();
//   } else {
//     stopAutoScavengeInterval();
//   }
// });

// Initialize connection when the service worker starts
connectWebSocket();

logInfo('Service worker initialized');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
settingsStorage.addListener(PLAYER_SETTINGS_STORAGE_KEY, (_settings) => {
  getWorldConfig(true);
});