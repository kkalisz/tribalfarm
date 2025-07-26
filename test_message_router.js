// Test script for MessageRouter with onMissingHandler

// Mock chrome.runtime.onMessage.addListener
chrome = {
  runtime: {
    onMessage: {
      addListener: (callback) => {
        // Store the callback for later use
        chrome.runtime.messageCallback = callback;
      }
    },
    // Function to simulate sending a message
    sendMessage: (message, sender, sendResponse) => {
      if (chrome.runtime.messageCallback) {
        return chrome.runtime.messageCallback(message, sender, sendResponse);
      }
    }
  }
};

// Import the MessageRouter class
const { MessageRouter } = require('./src/shared/services/MessageRouter');

// Create a simple message handler
class TestHandler {
  constructor(name) {
    this.name = name;
  }

  call(message, sender, sendResponse) {
    console.log(`Handler ${this.name} called with message:`, message);
    sendResponse({ success: true, handlerName: this.name });
    return true;
  }
}

// Create a MessageRouter with onMissingHandler
const router = new MessageRouter('action', (value, message, sender, sendResponse) => {
  console.log(`Creating handler for action "${value}"`);
  return new TestHandler(`Dynamic_${value}`);
});

// Register a static handler
router.addListener('staticAction', new TestHandler('Static'));

// Function to simulate sending a message and receiving a response
function testMessage(message) {
  console.log(`\nTesting message:`, message);
  
  chrome.runtime.sendMessage(message, { id: 'test-sender' }, (response) => {
    console.log('Response:', response);
  });
}

// Test with a registered handler
testMessage({ action: 'staticAction', data: 'test data' });

// Test with a missing handler (should create one dynamically)
testMessage({ action: 'dynamicAction', data: 'dynamic test data' });

// Test with the same dynamic action again (should use the previously created handler)
testMessage({ action: 'dynamicAction', data: 'second call' });

// Test with another missing handler
testMessage({ action: 'anotherDynamicAction', data: 'another test' });

console.log('\nTest nested router:');
// Create a nested router
const nestedRouter = router.createNestedRouter('nestedActions');

// Test with a nested action (should create a handler dynamically)
testMessage({ action: 'nestedActions', nestedAction: 'dynamicNestedAction', data: 'nested test data' });

console.log('\nAll tests completed.');