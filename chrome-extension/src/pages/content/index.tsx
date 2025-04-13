import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import { Message, CommandMessage, StatusMessage, EventMessage } from '../../shared/types';


/** React Component for the Sidebar Views */
export const SidebarContainer = () => {
  const [currentCommand, setCurrentCommand] = useState<CommandMessage | null>(null);
  const [commandStatus, setCommandStatus] = useState<string>('idle');
  const [lastEvent, setLastEvent] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Set up message listener for commands from service worker
    const messageListener = (message: any, sender: any, sendResponse: any) => {
      if (message.type === 'command') {
        console.log('Received command:', message);
        setCurrentCommand(message);
        setCommandStatus('in-progress');
        addLog(`Received command: ${message.payload.action}`);

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

    // Set up DOM observer
    setupDOMObserver();

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: 99999 }}
    >
      {/* Left Sidebar - Status */}
      <div
        className="fixed top-0 left-0 h-full w-1/4 bg-blue-500 bg-opacity-80 text-white overflow-auto"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg">Tribal Farm Status</h2>
          <div className="mt-2">
            <p><strong>Status:</strong> {commandStatus}</p>
            {currentCommand && (
              <div className="mt-2">
                <p><strong>Current Command:</strong></p>
                <p>Action: {currentCommand.payload.action}</p>
                <p>ID: {currentCommand.actionId}</p>
              </div>
            )}
            {lastEvent && (
              <p className="mt-2"><strong>Last Event:</strong> {lastEvent}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Logs */}
      <div
        className="fixed top-0 right-0 h-full w-1/4 bg-green-500 bg-opacity-80 text-white overflow-auto"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg">Logs</h2>
          <div className="mt-2 text-sm">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Execute a command on the page
export async function executeCommand(command: CommandMessage): Promise<{ status: string, details?: any }> {
  console.log(`Executing command: ${command.payload.action}`);

  // Implement different actions based on the command
  switch (command.payload.action) {
    case 'click':
      return await executeClickAction(command.payload.parameters);
    case 'input':
      return await executeInputAction(command.payload.parameters);
    case 'navigate':
      return await executeNavigateAction(command.payload.parameters);
    case 'extract':
      return await executeExtractAction(command.payload.parameters);
    default:
      // Simulate command execution for testing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.2) { // 80% success rate for testing
            resolve({ status: 'done', details: { result: 'success' } });
          } else {
            reject({ message: 'Command failed', details: { reason: 'random failure' } });
          }
        }, 2000);
      });
  }
}

// Execute a click action
async function executeClickAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
  const { selector } = parameters;

  if (!selector) {
    throw { message: 'Missing selector parameter', details: { parameters } };
  }

  const element = document.querySelector(selector);
  if (!element) {
    throw { message: 'Element not found', details: { selector } };
  }

  try {
    (element as HTMLElement).click();
    return { status: 'done', details: { action: 'click', selector } };
  } catch (error) {
    throw { message: 'Click action failed', details: { error, selector } };
  }
}

// Execute an input action
async function executeInputAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
  const { selector, value } = parameters;

  if (!selector || value === undefined) {
    throw { message: 'Missing required parameters', details: { parameters } };
  }

  const element = document.querySelector(selector) as HTMLInputElement;
  if (!element) {
    throw { message: 'Element not found', details: { selector } };
  }

  try {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return { status: 'done', details: { action: 'input', selector, value } };
  } catch (error) {
    throw { message: 'Input action failed', details: { error, selector, value } };
  }
}

// Execute a navigate action
async function executeNavigateAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
  const { url } = parameters;

  if (!url) {
    throw { message: 'Missing url parameter', details: { parameters } };
  }

  try {
    window.location.href = url;
    return { status: 'in-progress', details: { action: 'navigate', url } };
  } catch (error) {
    throw { message: 'Navigation action failed', details: { error, url } };
  }
}

// Execute an extract action
async function executeExtractAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
  const { selector } = parameters;

  if (!selector) {
    throw { message: 'Missing selector parameter', details: { parameters } };
  }

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    throw { message: 'Elements not found', details: { selector } };
  }

  try {
    const extractedData = Array.from(elements).map(el => ({
      text: el.textContent?.trim(),
      html: el.innerHTML,
      attributes: Array.from((el as Element).attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>)
    }));

    return { 
      status: 'done', 
      details: { 
        action: 'extract', 
        selector, 
        count: extractedData.length,
        data: extractedData
      } 
    };
  } catch (error) {
    throw { message: 'Extract action failed', details: { error, selector } };
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

// Function to check if the current domain matches our pattern
export function isValidDomain(): boolean {
  const hostname = window.location.hostname;

  // Check if it's a plemiona.pl domain
  if (!hostname.endsWith('.plemiona.pl')) {
    return false;
  }

  // Extract the subdomain (everything before .plemiona.pl)
  const subdomain = hostname.substring(0, hostname.length - '.plemiona.pl'.length);

  // Check if subdomain starts with 'pl' and ends with a number
  return /^pl.*\d$/.test(subdomain);
}

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, checking domain before initializing');
  if (isValidDomain()) {
    console.log('Valid domain detected, initializing content script');
    initializeContentScript();
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
});

// If DOMContentLoaded already fired, initialize immediately if domain is valid
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, checking domain before initializing');
  if (isValidDomain()) {
    console.log('Valid domain detected, initializing content script immediately');
    initializeContentScript();
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
}

export function initializeContentScript() {
  try {
    console.log('Initializing content script with local Tailwind CSS and Shadow DOM');

    // Create a container and attach a shadow DOM
    const container = document.createElement('div');
    container.id = '__root-extension-container';
    const shadowRoot = container.attachShadow({ mode: 'open' });
    document.body.appendChild(container);

    console.log('Shadow root created and attached to container');

    // Load the local tailwind-content.css file instead of CDN
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute(
      'href',
      chrome.runtime.getURL('tailwind-content.css')
    );
    shadowRoot.appendChild(linkElement);

    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '100vw'; // Fullscreen width
    container.style.height = '100vh';
    container.style.zIndex = '999999'; // Very high z-index to ensure visibility
    container.style.pointerEvents = 'none';

    console.log('Tailwind CSS loaded from local file into shadow root');

    // Create a div inside the shadowRoot to serve as the React root container
    const shadowRootContent = document.createElement('div');
    shadowRootContent.id = '__shadow-content';
    shadowRootContent.className = 'my-extension'; // Add the namespace class for Tailwind styles

    // Set positioning and dimensions
    shadowRootContent.style.position = 'fixed';
    shadowRootContent.style.bottom = '0';
    shadowRootContent.style.left = '0';
    shadowRootContent.style.width = '100vw'; // Fullscreen width
    shadowRootContent.style.height = '100vh';
    shadowRootContent.style.zIndex = '999999'; // Very high z-index to ensure visibility
    shadowRootContent.style.pointerEvents = 'none';

    shadowRoot.appendChild(shadowRootContent);

    console.log('React container created inside shadow root');

    // Mount the React app inside the shadowRoot container
    const root = createRoot(shadowRootContent);
    console.log(`React app created ${!!root}`);
    root.render(<SidebarContainer />);

    console.log('React app successfully rendered with Tailwind in Shadow DOM');
  } catch (err) {
    console.error('Error initializing content script:', err);
  }
}
