import { Message, CommandMessage, StatusMessage } from '../../shared/types';

// Connection state
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
let isConnecting = false;
const maxReconnectDelay = 30000; // 30 seconds

// Command state
let currentCommand: CommandMessage | null = null;
let commandQueue: CommandMessage[] = [];
let activeTabId: number | null = null;

// Connect to WebSocket server
function connectWebSocket() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket already connected or connecting');
    return;
  }

  if (isConnecting) {
    console.log('Connection already in progress');
    return;
  }

  isConnecting = true;
  const backendUrl = 'ws://localhost:8080/ws'; // Configure as needed

  console.log(`Connecting to WebSocket at ${backendUrl}`);
  socket = new WebSocket(backendUrl);

  socket.onopen = () => {
    console.log('WebSocket connection established');
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
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    socket = null;
    isConnecting = false;

    // Schedule reconnection with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
    reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
    setTimeout(connectWebSocket, delay);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    // The onclose handler will be called after this
  };
}

// Handle incoming messages from the WebSocket
function handleIncomingMessage(message: Message) {
  console.log('Received message:', message);

  switch (message.type) {
    case 'command':
      // Store the command and forward to content script
      currentCommand = message;
      forwardCommandToContentScript(message);
      break;

    case 'ack':
      // Handle acknowledgment
      console.log('Command acknowledged:', message.actionId);
      break;

    default:
      console.log('Unhandled message type:', message.type);
  }
}

// Forward command to the active content script
function forwardCommandToContentScript(command: CommandMessage) {
  if (!activeTabId) {
    console.log('No active tab, queuing command');
    commandQueue.push(command);
    return;
  }

  chrome.tabs.sendMessage(activeTabId, command)
    .then(response => {
      console.log('Command forwarded to content script, response:', response);
    })
    .catch(error => {
      console.error('Error forwarding command to content script:', error);
      commandQueue.push(command);
    });
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message from content script:', message, 'Sender:', sender);

  // Track the active tab
  if (sender.tab && sender.tab.id) {
    activeTabId = sender.tab.id;
  }

  // Handle different message types
  if (message.type === 'contentScriptReady') {
    console.log('Content script ready in tab', activeTabId);

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
      console.log('WebSocket not connected, reconnecting...');
      connectWebSocket();
    }

    sendResponse({ status: 'forwarded' });
    return true;
  }

  return false;
});

// Initialize connection when the service worker starts
connectWebSocket();

console.log('Service worker initialized');
