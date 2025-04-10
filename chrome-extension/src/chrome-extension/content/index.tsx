/**
 * Content script for the Chrome extension.
 * This script runs in the context of web pages and can interact with the DOM.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

const Content = () => {
  console.log("Content script loaded");

  // Example: Add a message listener to communicate with the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    sender.tab;
    console.log("Message received in content script:", message);
    sendResponse({ status: "received in content script" });
    return true;
  });

  // Example: Send a message to the background script
  chrome.runtime.sendMessage({ from: "content", action: "init" }, (response) => {
    console.log("Response from background:", response);
  });

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg z-50">
      <div>Chrome Extension Content Script</div>
    </div>
  );
};

// Initialize the content script
const init = () => {
  // Create a container for the React component
  const container = document.createElement("div");
  container.id = "chrome-extension-content-root";
  document.body.appendChild(container);

  // Render the React component
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(Content));
};

// Run the initialization
init();
