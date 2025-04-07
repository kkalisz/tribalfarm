const { chrome } = require('jest-chrome');

// Initialize chrome API mocks
global.chrome = chrome;

// Setup storage mock
chrome.storage = {
  local: {
    get: jest.fn().mockImplementation(() => Promise.resolve({})),
    set: jest.fn().mockImplementation(() => Promise.resolve()),
    clear: jest.fn().mockImplementation(() => Promise.resolve()),
  },
};

// Setup runtime mock
chrome.runtime = {
  ...chrome.runtime,
  onInstalled: {
    addListener: jest.fn(),
  },
};

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Setup and cleanup for each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear document body
  document.body.innerHTML = '';

  // Setup error handling for DOM operations
  jest.spyOn(document, 'querySelector');
  jest.spyOn(document, 'querySelectorAll');
});

afterEach(() => {
  // Cleanup document body
  document.body.innerHTML = '';

  // Restore DOM operation spies
  jest.restoreAllMocks();
});
