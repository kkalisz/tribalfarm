// This is a simple test script to verify that the changes to the MessageRouter class work as expected.
// Note: This is a simplified version for testing purposes and doesn't include the full Chrome API.

// Mock Chrome API
const chrome = {
  runtime: {
    onMessage: {
      addListener: (callback) => {
        console.log('Added message listener');
        // Store the callback for testing
        chrome.runtime.messageCallback = callback;
      },
      messageCallback: null
    }
  }
};

// Mock BaseMessage
class BaseMessage {
  constructor(type, subType) {
    this.type = type;
    this.subType = subType;
  }
}

// Mock MessageHandler interface
class MessageHandler {
  call(message, sender, sendResponse) {
    console.log('MessageHandler.call called');
    return false;
  }
}

// Simplified MessageRouter implementation
class MessageRouter {
  constructor(propertyName = 'type') {
    this.handlers = new Map();
    this.propertyName = propertyName;
    
    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        console.log(`Received message with ${this.propertyName}: ${message[this.propertyName]}`);
        
        if (!message || typeof message[this.propertyName] !== 'string') {
          console.warn(`Invalid message format. Expected message.${this.propertyName} to be a string.`);
          return false;
        }
        
        let handler = this.handlers.get(message[this.propertyName]);
        
        if (!handler) {
          console.warn(`No handler registered for ${this.propertyName} "${message[this.propertyName]}"`);
          return false;
        }
        
        try {
          return handler.call(message, sender, sendResponse);
        } catch (err) {
          console.error(`Exception in handler for ${this.propertyName} "${message[this.propertyName]}":`, err);
          sendResponse({ error: err?.message ?? 'Unknown error' });
          return false;
        }
      }
    );
  }
  
  addListener(value, handler) {
    if (this.handlers.has(value)) {
      console.warn(`Overwriting existing handler for ${this.propertyName} "${value}"`);
    }
    this.handlers.set(value, handler);
  }
  
  removeListener(value) {
    this.handlers.delete(value);
  }
  
  call(message, sender, sendResponse) {
    const messageRaw = message;
    
    if (!message || typeof messageRaw[this.propertyName] !== 'string') {
      console.warn(`Invalid message format in nested handler. Expected message.${this.propertyName} to be a string.`);
      return false;
    }
    
    const keyValue = messageRaw[this.propertyName];
    
    let handler = this.handlers.get(keyValue);
    
    if (!handler) {
      console.warn(`No handler registered in nested handler for ${this.propertyName} "${keyValue}"`);
      return false;
    }
    
    try {
      return handler.call(message, sender, sendResponse);
    } catch (err) {
      console.error(`Exception in nested handler for ${this.propertyName} "${keyValue}":`, err);
      sendResponse({ error: err?.message ?? 'Unknown error' });
      return false;
    }
  }
  
  createNestedRouter(propertyValue, propertyType) {
    const nestedRouter = new MessageRouter(propertyType);
    
    // Create an inline handler that directly calls the nested router's call method
    this.addListener(propertyValue, {
      call: (message, sender, sendResponse) => {
        return nestedRouter.call(message, sender, sendResponse);
      }
    });
    
    return nestedRouter;
  }
}

// Test the MessageRouter
console.log('Testing MessageRouter...');

// Create a root router
const rootRouter = new MessageRouter();

// Create a nested router for 'command' messages
const commandRouter = rootRouter.createNestedRouter('command', 'subType');

// Create a handler for 'navigate' commands
const navigateHandler = {
  call: (message, sender, sendResponse) => {
    console.log('Navigate handler called with message:', message);
    sendResponse({ success: true, message: 'Navigation successful' });
    return true;
  }
};

// Register the handler
commandRouter.addListener('navigate', navigateHandler);

// Test sending a message
console.log('Sending a command message...');
const message = new BaseMessage('command', 'navigate');
const sender = { id: 'test-sender' };
const sendResponse = (response) => {
  console.log('Response received:', response);
};

// Simulate receiving a message
const result = chrome.runtime.messageCallback(message, sender, sendResponse);
console.log('Message handling result:', result);

console.log('Test completed.');