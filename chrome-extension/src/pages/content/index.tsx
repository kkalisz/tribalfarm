import {createRoot} from 'react-dom/client';
import React from 'react';
import {SidebarContainer} from "@pages/content/ui/SidebarContainer";
import {ChakraProvider} from '@chakra-ui/react';
import theme from '@src/shared/theme';
import {CacheProvider} from '@emotion/react';
import createCache from '@emotion/cache';
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
import {hasValidPlayerSettings,} from "@src/shared/services/hasValidPlayerSettings";
import {GameUrlInfo, getGameUrlInfo} from "@src/shared/helpers/getGameUrlInfo";
import {GameDatabaseContext, StorageContext} from "@src/shared/contexts/StorageContext";
import {PlayerUiContext, PlayerUiContextState} from '@src/shared/contexts/PlayerContext';
import {fetchWorldConfig} from "@src/shared/helpers/fetchWorldConfig";
import {DatabaseSchema} from "@src/shared/db/GameDataBase";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {GameDatabaseClientSync} from "@src/shared/db/GameDatabaseClientSync";
import {ProxyIDBPDatabase} from "@src/shared/db/ProxyIDBPDatabase";
import {ExecutorAttacher} from "@pages/content/execute/ExecutorAttacher";
import {playSound} from "@pages/content/helpers/playSound";

let attachExecutor: ExecutorAttacher | null = null;



function onBotCheck(botCheck: boolean) {
  playSound()
  if(!attachExecutor){
    return
  }
}

function observeQuestLog() {
  // Create a MutationObserver to monitor the entire body for changes
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Only process element nodes
            const element = node as HTMLElement;

            // Check if the added element has a class of "questlog" or contains a relevant quest
            if (element.classList.contains('questlog')) {
              console.log('Detected new questlog:', element);

              // Observe this questlog for nested changes
              setupQuestLogObserver(element);
            }

            // Recursively check for `.questlog` elements in new subtree
            const nestedQuestLogs = element.querySelectorAll('.questlog');
            nestedQuestLogs.forEach((nestedQuestLog) => {
              console.log('Detected nested questlog:', nestedQuestLog);
              setupQuestLogObserver(nestedQuestLog as HTMLElement);
            });
          }
        });
      }
    }
  });

  // Start observing the document body to detect dynamically-added `questlog` containers
  observer.observe(document.body, {
    childList: true,  // Watch for added or removed nodes
    subtree: true,    // Monitor changes throughout the entire DOM subtree
  });

  console.log('Started observing the document body for questlog containers.');
}

// Function to observe a specific questlog container for changes
function setupQuestLogObserver(questLog: HTMLElement) {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Only process element nodes
            const element = node as HTMLElement;

            // Check if it contains a quest or "bot" reference
            const botCheck = element.textContent?.toLowerCase().includes('bot');
            if (element.id === 'botprotection_quest' || botCheck) {
              onBotCheck(true)
              console.log('Detected bot-related change:', element);
            }

            if (element.classList.contains('quest')) {
              console.log('New quest detected:', element);
            }
          }
        });
      }

      if (mutation.type === 'attributes') {
        const target = mutation.target as HTMLElement;
        const botCheck = target.textContent?.toLowerCase().includes('bot');
        if (botCheck || target.id === 'botprotection_quest') {
          onBotCheck(true)
          console.log(`Detected attribute change related to bot protection or quests on:`, target);
        }
      }
    }
  });

  // Start observing the specific `questlog` container
  observer.observe(questLog, {
    childList: true,      // Watch for added or removed child nodes
    subtree: true,        // Observe all nested elements in questlog
    attributes: true,     // Watch for changes to attributes
  });

  console.log('Started observing questlog container changes:', questLog);
}

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  observeQuestLog();
});

// DOM Observer to detect modals and popups
export function setupDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check for modals or popups
        const modals = document.querySelectorAll('.modal, .popup, .dialog');
        if (modals.length > 0) {
          // Send event to service worker
          chrome.runtime.sendMessage({
            type: 'event',
            actionId: 'none', // No specific action
            timestamp: new Date().toISOString(),
            payload: {
              eventType: 'popup',
              details: {
                count: modals.length,
                text: Array.from(modals).map(m => m.textContent).join(' ')
              }
            }
          });
        }
      }
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, checking domain before initializing');
  const gameUrlInfo = getGameUrlInfo(window.location.href);
  if (gameUrlInfo.isValid) {
    console.log('Valid domain detected, initializing content script');
    initializeContentScript(gameUrlInfo);
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
});

// If DOMContentLoaded already fired, initialize immediately if domain is valid
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, checking domain before initializing');
  const gameUrlInfo = getGameUrlInfo(window.location.href);
  if (gameUrlInfo.isValid) {
    console.log('Valid domain detected, initializing content script immediately');
    initializeContentScript(gameUrlInfo);
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
}

export async function initializeContentScript(gameUrlInfo: GameUrlInfo) {
  if(attachExecutor != null){
    return;
  }
  if (!gameUrlInfo.isValid || !gameUrlInfo.fullDomain) {
    console.log('Invalid domain detected, skipping initialization');
    return
  }
  const settings = new SettingsStorageService(gameUrlInfo.fullDomain);

  //const database = new GameDataBase(gameUrlInfo.fullDomain);
  //await database.init();
  const gameDatabase = new GameDataBaseAccess(new ProxyIDBPDatabase<DatabaseSchema>(new GameDatabaseClientSync(gameUrlInfo.fullDomain)));
  const playerSettings = await gameDatabase.settingDb.getPlayerSettings();
  if (playerSettings == null || !hasValidPlayerSettings(playerSettings)) {
    console.log('No valid player settings found, skipping initialization');
    return;
  }

  let worldConfig = await gameDatabase.settingDb.getWorldConfig();
  if(worldConfig == null) {
    worldConfig = await fetchWorldConfig(gameUrlInfo.fullDomain)
    await gameDatabase.settingDb.saveWorldConfig(worldConfig)
  }

  const context: PlayerUiContextState = {
    settings: settings,
    gameUrlInfo: gameUrlInfo,
    playerSettings: playerSettings,
    worldConfig: worldConfig,
    gameDatabase: gameDatabase
  }

  try {
    attachExecutor = new ExecutorAttacher(context);
    attachExecutor.attach();
    setupDOMObserver();

    console.log('Initializing content script with Chakra UI and Shadow DOM');

    // Create a container and attach a shadow DOM
    const container = document.createElement('div');
    container.id = '__root-extension-container';
    const shadowRoot = container.attachShadow({mode: 'open'});
    document.body.appendChild(container);

    console.log('Shadow root created and attached to container');

    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '100vw'; // Fullscreen width
    container.style.height = '100vh';
    container.style.zIndex = '999999'; // Very high z-index to ensure visibility
    container.style.pointerEvents = 'none';

    // Create a div inside the shadowRoot to serve as the React root container
    const shadowRootContent = document.createElement('div');
    shadowRootContent.id = '__shadow-content';

    // Set positioning and dimensions
    shadowRootContent.style.position = 'fixed';
    shadowRootContent.style.bottom = '0';
    shadowRootContent.style.left = '0';
    shadowRootContent.style.width = '100vw'; // Fullscreen width
    shadowRootContent.style.height = '100vh';
    shadowRootContent.style.zIndex = '999999'; // Very high z-index to ensure visibility
    shadowRootContent.style.pointerEvents = 'none';

    shadowRoot.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        e.stopPropagation();
      }
    }, true); // Use capture phase to intercept early

    shadowRoot.appendChild(shadowRootContent);

    const shadowCache = createCache({
      key: 'chakra-shadow',
      container: shadowRoot,
    });

    console.log('React container created inside shadow root');

    // Mount the React app inside the shadowRoot container
    const root = createRoot(shadowRoot);
    console.log(`React app created ${!!root}`);
    root.render(
      <CacheProvider value={shadowCache}>
        <ChakraProvider theme={theme} resetCSS={false}>
          <PlayerUiContext.Provider value={context}>
            <StorageContext.Provider value={context.settings}>
              <GameDatabaseContext.Provider value={context.gameDatabase}>
                <SidebarContainer/>
              </GameDatabaseContext.Provider>
            </StorageContext.Provider>
          </PlayerUiContext.Provider>
        </ChakraProvider>
      </CacheProvider>
    );

    console.log('React app successfully rendered with Chakra UI in Shadow DOM');
  } catch (err) {
    console.error('Error initializing content script:', err);
  }
}
