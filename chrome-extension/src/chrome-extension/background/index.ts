/**
 * Background script for the Chrome extension.
 * This script runs in the background and can listen for events from the browser or from content scripts.
 */

// Example: Listen for installation event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
});

// Example: Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender);
  
  // Example: Send a response back
  sendResponse({ status: 'received' });
  
  // Return true to indicate that the response will be sent asynchronously
  return true;
});

// Example: Set up an alarm to run periodically
chrome.alarms.create('example-alarm', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm);
});

// Keep the service worker alive
export {};