import { chrome } from 'jest-chrome';

describe('StateManager', () => {
  let stateManager;
  
  beforeEach(() => {
    // Clear chrome storage before each test
    chrome.storage.local.clear();
    // Reset chrome storage mock
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
    
    // Import fresh instance of StateManager
    jest.isolateModules(() => {
      stateManager = require('../src/background/background.ts').stateManager;
    });
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = stateManager.getState();
      expect(state.websocket.connected).toBe(false);
      expect(state.websocket.lastConnected).toBeNull();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.settings.websocketUrl).toBe('ws://localhost:8080');
    });

    it('should load state from storage on initialization', async () => {
      const savedState = {
        websocket: { connected: true, lastConnected: 123456789 },
        auth: { isAuthenticated: true, token: 'test-token', userId: 'user-1' },
        settings: { websocketUrl: 'ws://test.com', autoReconnect: false, notificationsEnabled: false },
        activeOperations: {}
      };

      chrome.storage.local.get.mockImplementation(() => Promise.resolve({ extensionState: savedState }));
      
      // Create new instance to trigger state loading
      jest.isolateModules(() => {
        stateManager = require('../src/background/background.ts').stateManager;
      });

      // Wait for async state loading
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = stateManager.getState();
      expect(state).toEqual(savedState);
    });
  });

  describe('State Updates', () => {
    it('should update WebSocket state', () => {
      stateManager.updateWebSocketState(true);
      const state = stateManager.getWebSocketState();
      expect(state.connected).toBe(true);
      expect(state.lastConnected).toBeTruthy();
    });

    it('should update auth state', () => {
      stateManager.updateAuthState(true, 'test-token', 'user-1');
      const state = stateManager.getAuthState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('test-token');
      expect(state.userId).toBe('user-1');
    });

    it('should update settings', () => {
      const newSettings = {
        websocketUrl: 'ws://new-url.com',
        autoReconnect: false
      };
      stateManager.updateSettings(newSettings);
      const state = stateManager.getSettings();
      expect(state.websocketUrl).toBe('ws://new-url.com');
      expect(state.autoReconnect).toBe(false);
      expect(state.notificationsEnabled).toBe(true); // Should keep default value
    });

    it('should update tab operations', () => {
      const tabId = 123;
      stateManager.updateTabOperation(tabId, 'running', 'test-operation');
      const operation = stateManager.getTabOperation(tabId);
      expect(operation.status).toBe('running');
      expect(operation.lastOperation).toBe('test-operation');
    });
  });

  describe('State Persistence', () => {
    it('should save state to storage after updates', () => {
      stateManager.updateWebSocketState(true);
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
  });

  describe('State Subscriptions', () => {
    it('should notify listeners of state changes', () => {
      const listener = jest.fn();
      stateManager.subscribe(listener);
      
      stateManager.updateWebSocketState(true);
      expect(listener).toHaveBeenCalled();
      
      const lastCall = listener.mock.calls[listener.mock.calls.length - 1][0];
      expect(lastCall.websocket.connected).toBe(true);
    });

    it('should allow unsubscribing from state changes', () => {
      const listener = jest.fn();
      const unsubscribe = stateManager.subscribe(listener);
      
      unsubscribe();
      stateManager.updateWebSocketState(true);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});