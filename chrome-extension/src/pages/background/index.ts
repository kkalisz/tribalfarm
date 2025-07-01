import {logError, logInfo} from "@src/shared/helpers/sendLog";
import {hasValidPlayerSettings} from "@src/shared/services/hasValidPlayerSettings";
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
import {TabMessenger} from "@src/shared/actions/content/core/TabMessenger";
import {PlayerService} from './PlayerService';
import {ActionScheduler} from "@src/shared/actions/backend/core/ActionScheduler";
import {SCAVENGE_VILLAGE_ACTION, ScavengeVillageAction} from "@src/shared/actions/backend/scavenge/ScavengeVillageAction";
import {DatabaseSchema, GameDataBase} from "@src/shared/db/GameDataBase";
import {fetchWorldConfig} from "@src/shared/helpers/fetchWorldConfig";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {GameDatabaseBackgroundSync} from "@src/shared/db/GameDatabaseBackgroundSync";
import {fetchTroopInfo} from "@src/shared/helpers/fetchTroopInfo";
import {fetchBuildingInfo} from "@src/shared/helpers/fetchBuildings";
import {ServerConfig} from "@pages/background/serverConfig";

interface DatabaseHolder {
  dbSync: GameDatabaseBackgroundSync<DatabaseSchema>;
  database: GameDataBase;
  databaseAccess: GameDataBaseAccess;
}

// Connection state
// let socket: WebSocket | null = null;
// let reconnectAttempts = 0;
// let isConnecting = false;
// const maxReconnectDelay = 30000; // 30 seconds

// Command state
// let currentCommand: CommandMessage | null = null;
// const commandQueue: CommandMessage[] = [];
// let activeTabId: number | null = null;
// let activeTabMessenger: TabMessenger | null = null;
const playerServiceCache = new Map<string, PlayerService>();
const databaseCache = new Map<string, DatabaseHolder>();


// Connect to WebSocket server
// function connectWebSocket() {
//   //TODO
//   return;
//   if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
//     logInfo('WebSocket already connected or connecting');
//     return;
//   }
//
//   if (isConnecting) {
//     logInfo('Connection already in progress');
//     return;
//   }
//
//   isConnecting = true;
//   const backendUrl = 'ws://localhost:8080/ws'; // Configure as needed
//
//   logInfo(`Connecting to WebSocket at ${backendUrl}`);
//   socket = new WebSocket(backendUrl);
//
//   socket.onopen = () => {
//     logInfo('WebSocket connection established');
//     isConnecting = false;
//     reconnectAttempts = 0;
//
//     // Process any queued commands
//     processCommandQueue();
//   };
//
//   socket.onmessage = (event) => {
//     try {
//       const message = JSON.parse(event.data) as Message;
//       handleIncomingMessage(message);
//     } catch (error) {
//       console.error('Error parsing WebSocket message:', error);
//     }
//   };
//
//   socket.onclose = (event) => {
//     logInfo(`WebSocket connection closed: ${event.code} ${event.reason}`);
//     socket = null;
//     isConnecting = false;
//
//     // Schedule reconnection with exponential backoff
//     const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
//     reconnectAttempts++;
//
//     logInfo(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
//     setTimeout(connectWebSocket, delay);
//   };
//
//   socket.onerror = (error) => {
//     console.error('WebSocket error:', error);
//     // The onclose handler will be called after this
//   };
// }
//
// // Handle incoming messages from the WebSocket
// function handleIncomingMessage(message: Message) {
//   logInfo('Received message:', message);
//
//   switch (message.type) {
//     case 'command':
//       // Store the command and forward to content script
//       currentCommand = message;
//       forwardCommandToContentScript(message);
//       break;
//
//     case 'ack':
//       // Handle acknowledgment
//       logInfo('Command acknowledged:', message.actionId);
//       break;
//
//     default:
//       logInfo('Unhandled message type:', message.type);
//   }
// }
//
// // Forward command to the active content script
// async function forwardCommandToContentScript(command: CommandMessage) {
//   if (!activeTabId) {
//     logInfo('No active tab, queuing command');
//     commandQueue.push(command);
//     return;
//   }
//
//   // Create or reuse TabMessenger for the active tab
//   if (!activeTabMessenger || activeTabMessenger.getTabId() !== activeTabId) {
//     if (activeTabMessenger) {
//       activeTabMessenger.dispose();
//     }
//     activeTabMessenger = new TabMessenger(activeTabId);
//   }
//
//   try {
//     // Use orchestrateOnTab for complex operations that might involve page reloads
//     if (command.payload.action === 'navigate' || command.payload.action === 'click') {
//       orchestrateOnTab(activeTabId, async (messenger) => {
//         logInfo(`Orchestrating ${command.payload.action} command on tab ${activeTabId}`);
//
//         // Send the command
//         const result = await messenger.sendCommand(
//           command.payload.action,
//           command.payload.parameters
//         );
//
//         // If this is a navigation command, wait for the page to load
//         if (command.payload.action === 'navigate') {
//           await messenger.waitFor('event',
//             (msg) => msg.type === 'event' &&
//                     msg.payload.eventType === 'stateChange' &&
//                     msg.payload.details.type === 'contentScriptReady',
//             30000
//           );
//         }
//
//         return result;
//       }).then(result => {
//         logInfo(`Command ${command.payload.action} orchestrated successfully:`, result);
//
//         // Forward the result to the WebSocket if connected
//         if (socket && socket.readyState === WebSocket.OPEN) {
//           const statusMessage = {
//             type: 'status',
//             actionId: command.actionId,
//             timestamp: new Date().toISOString(),
//             correlationId: command.correlationId,
//             payload: {
//               status: 'done',
//               details: result
//             }
//           };
//           socket.send(JSON.stringify(statusMessage));
//         }
//       }).catch(error => {
//         console.error(`Error orchestrating ${command.payload.action} command:`, error);
//
//         // Forward the error to the WebSocket if connected
//         if (socket && socket.readyState === WebSocket.OPEN) {
//           const errorMessage = {
//             type: 'error',
//             actionId: command.actionId,
//             timestamp: new Date().toISOString(),
//             correlationId: command.correlationId,
//             payload: {
//               message: error.message || 'Unknown error',
//               details: error
//             }
//           };
//           socket.send(JSON.stringify(errorMessage));
//         }
//       });
//     } else {
//       // For simpler commands, just use the TabMessenger directly
//       activeTabMessenger.send(
//         command.payload.action,
//         command.payload.parameters
//       ).then(result => {
//         logInfo(`Command ${command.payload.action} executed successfully:`, result);
//       }).catch(error => {
//         console.error(`Error executing ${command.payload.action} command:`, error);
//         commandQueue.push(command);
//       });
//     }
//   } catch (error) {
//     console.error('Error forwarding command to content script:', error);
//     commandQueue.push(command);
//   }
// }
//
// // Process the command queue
// function processCommandQueue() {
//   if (commandQueue.length === 0 || !activeTabId || !socket || socket.readyState !== WebSocket.OPEN) {
//     return;
//   }
//
//   while (commandQueue.length > 0) {
//     const command = commandQueue.shift();
//     if (command) {
//       forwardCommandToContentScript(command);
//     }
//   }
// }

async function ensureDatabase(fullDomain: string): Promise<DatabaseHolder> {
  if (!databaseCache.has(fullDomain)) {
    const database = new GameDataBase(fullDomain);
    await database.init();
    const gameDatabaseAccess = new GameDataBaseAccess(database.db)
    const gameDatabaseSync = new GameDatabaseBackgroundSync(database.db, fullDomain)

    databaseCache.set(fullDomain, {
      dbSync: gameDatabaseSync,
      database: database,
      databaseAccess: gameDatabaseAccess
    })
  }
  return databaseCache.get(fullDomain)!
}

async function ensureServerConfig(gameDatabaseAccess: GameDataBaseAccess, fullDomain: string): Promise<ServerConfig | undefined> {
  const basicWorldConfig = await gameDatabaseAccess.settingDb.getWorldConfig();
  const basicTroopsConfig = await gameDatabaseAccess.settingDb.getTroopConfigs();
  const basicBuildingsConfig = await gameDatabaseAccess.settingDb.getBuildingConfigs();

  try {
    if (!basicWorldConfig) {
      const worldConfig = await fetchWorldConfig(fullDomain)
      await gameDatabaseAccess.settingDb.saveWorldConfig(worldConfig)
    }
    if (!basicTroopsConfig || !basicTroopsConfig.length) {
      const troopsConfig = await fetchTroopInfo(fullDomain);
      console.log(`troops ${JSON.stringify(troopsConfig)}`);
      await gameDatabaseAccess.settingDb.saveTroopsConfig(troopsConfig)
    }
    if (!basicBuildingsConfig || !basicBuildingsConfig.length) {
      const buildingConfig = await fetchBuildingInfo(fullDomain)
      console.log(`basicBuildingsConfig ${JSON.stringify(buildingConfig)}`);
      await gameDatabaseAccess.settingDb.saveBuildingConfig(buildingConfig)
    }
  } catch (e) {
    logError("can't fetch config", e)
    return undefined

  }
  return {
    worldConfig: (await gameDatabaseAccess.settingDb.getWorldConfig())!,
    troopsConfig: await gameDatabaseAccess.settingDb.getTroopConfigs(),
    buildingConfig: await gameDatabaseAccess.settingDb.getBuildingConfigs(),
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logInfo('Message from content script:', JSON.stringify(message), 'Sender:', sender);
  logInfo(Object.keys(message));
  const fullDomain = message.fullDomain;
  const messageType = message.type;
  if (!fullDomain) {
    logInfo('No full domain in message, skipping');
    return;
  }

  if (messageType === "db_init") {
    logInfo("db_init")
    await ensureDatabase(fullDomain)
    return false;
  }

  if (messageType === "contentScriptReady") {
    if (!(sender.tab && sender.tab.id)) {
      logInfo('No sender return');
      return;
    }
    const tabId = sender.tab.id;
    if (!playerServiceCache.has(fullDomain)) {
      logInfo('Creating new PlayserService for ', fullDomain, ' tab ', tabId, '');

      const settings = new SettingsStorageService(message.fullDomain);

      const database = await ensureDatabase(fullDomain)
      const gameDatabaseAccess = database.databaseAccess;
      const playerSettings = await gameDatabaseAccess.settingDb.getPlayerSettings();
      if (playerSettings == null || !hasValidPlayerSettings(playerSettings)) {
        console.log('No valid player settings found, skipping initialization');
        return;
      }

      const serverConfig = await ensureServerConfig(gameDatabaseAccess, fullDomain);
      if (!serverConfig) {
        return false
      }

      const activeTabMessenger = new TabMessenger(tabId)
      const scheduler: ActionScheduler = new ActionScheduler()

      const playerService = new PlayerService(settings, playerSettings, serverConfig, activeTabMessenger, scheduler, database.databaseAccess, tabId);
      playerServiceCache.set(fullDomain, playerService);
      playerService.registerHandler(SCAVENGE_VILLAGE_ACTION, new ScavengeVillageAction())
    }
  }
  logInfo(`on message player Service ${fullDomain} ${!!playerServiceCache.get(fullDomain)}`);
  playerServiceCache.get(fullDomain)?.onMessage(message, sender, sendResponse);
  return true


  // // Handle different message types
  // if(message.type === 'test') {
  //   logInfo('Received command from content script:');
  //   if(message.content === 'test1') {
  //     logInfo('start test 1:', message);
  //     orchestrateOnTab(sender.tab!.id!, async (messenger) => {
  //
  //       logInfo('before send');
  //       const context: BackendActionContext = {
  //         messenger: messenger,
  //         playerSettings: playerSettings,
  //         worldConfig: await WorldConfigManager.getInstance().getWorldConfig()
  //       }
  //
  //       await scavengeVillage(context, {})
  //     });
  //     return
  //   }
  //   if(message.content === 'test1') {
  //     return
  //   }
  //   return true;
  // }
  // if (message.type === 'contentScriptReady') {
  //   logInfo('Content script ready in tab', activeTabId);
  //
  //   // If there's a current command, send it to the newly ready content script
  //   if (currentCommand) {
  //     forwardCommandToContentScript(currentCommand);
  //   } else {
  //     processCommandQueue();
  //   }
  //
  //   sendResponse({ status: 'acknowledged' });
  //   return true;
  // }

  // // Forward status updates to the WebSocket
  // if (message.type === 'status' || message.type === 'event' || message.type === 'error') {
  //   if (socket && socket.readyState === WebSocket.OPEN) {
  //     socket.send(JSON.stringify(message));
  //   } else {
  //     logInfo('WebSocket not connected, reconnecting...');
  //     connectWebSocket();
  //   }
  //
  //   sendResponse({ status: 'forwarded' });
  //   return true;
  // }

  return false;
});

//connectWebSocket();

logInfo('Service worker initialized');

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// settingsStorage.addListener(PLAYER_SETTINGS_STORAGE_KEY, (_settings) => {
//   getWorldConfig(true);
// });