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

let attachExecutor: ExecutorAttacher | null = null;



function onBotCheck(botCheck: boolean) {
  if(!attachExecutor){
    return
  }
}

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
