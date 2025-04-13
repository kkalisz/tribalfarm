import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import { Message, CommandMessage, StatusMessage, EventMessage } from '../../shared/types';
import {isValidDomain} from "@src/shared/helpers/isValidDomain";
import {SidebarContainer} from "@pages/content/ui/SidebarContainer";
//import '@assets/styles/tailwind.css';


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
    const shadowRoot = container.attachShadow({mode: 'open'});
    document.body.appendChild(container);

    console.log('Shadow root created and attached to container');

    // Load Tailwind CSS into the shadow DOM
    const loadTailwindCSS = async () => {
      try {
        // First try to load the compiled Tailwind CSS from assets directory
        const tailwindCssUrl = chrome.runtime.getURL('assets/tailwind-rkQ3FTm7.css');
        const response = await fetch(tailwindCssUrl);

        if (response.ok) {
          const cssText = await response.text();
          const styleElement = document.createElement('style');
          styleElement.textContent = cssText;
          shadowRoot.appendChild(styleElement);
          console.log('Tailwind CSS loaded from compiled file into shadow root');
        } else {
          // Fallback to style.css if the compiled file is not found
          const styleUrl = chrome.runtime.getURL('style.css');
          const styleResponse = await fetch(styleUrl);

          if (styleResponse.ok) {
            const cssText = await styleResponse.text();
            const styleElement = document.createElement('style');
            styleElement.textContent = cssText;
            shadowRoot.appendChild(styleElement);
            console.log('Tailwind CSS loaded from style.css into shadow root');
          } else {
            console.error('Failed to load Tailwind CSS');
          }
        }
      } catch (error) {
        console.error('Error loading Tailwind CSS:', error);
      }
    };

    // Start loading the CSS
    loadTailwindCSS();

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
    root.render(<SidebarContainer/>);

    console.log('React app successfully rendered with Tailwind in Shadow DOM');
  } catch (err) {
    console.error('Error initializing content script:', err);
  }
}
