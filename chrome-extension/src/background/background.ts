// Background script for Tribal Farm Chrome Extension
import { notificationHandler } from './notificationHandler';
import { notificationManager } from '../components/notifications/NotificationManager';

console.log('Background script loaded');

export interface ExtensionState {
  websocket: {
    connected: boolean;
    lastConnected: number | null;
  };
  auth: {
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;
  };
  settings: {
    websocketUrl: string;
    autoReconnect: boolean;
    notificationsEnabled: boolean;
  };
  activeOperations: {
    [tabId: number]: {
      status: 'idle' | 'running' | 'error';
      lastOperation: string | null;
      error?: string;
    };
  };
}

export class StateManager {
  private state: ExtensionState;
  private listeners: ((state: ExtensionState) => void)[] = [];

  constructor() {
    // Initialize default state
    this.state = {
      websocket: {
        connected: false,
        lastConnected: null,
      },
      auth: {
        isAuthenticated: false,
        token: null,
        userId: null,
      },
      settings: {
        websocketUrl: 'ws://localhost:8080',
        autoReconnect: true,
        notificationsEnabled: true,
      },
      activeOperations: {},
    };

    // Load saved state from storage
    this.loadState();
  }

  private async loadState() {
    try {
      const savedState = await chrome.storage.local.get('extensionState');
      if (savedState.extensionState) {
        // Deep merge saved state with default state, preserving default values
        this.state = {
          websocket: {
            ...this.state.websocket,
            ...savedState.extensionState.websocket,
          },
          auth: {
            ...this.state.auth,
            ...savedState.extensionState.auth,
          },
          settings: {
            ...this.state.settings,  // Keep default settings
            ...(savedState.extensionState.settings || {}),  // Override with saved settings
          },
          activeOperations: {
            ...this.state.activeOperations,
            ...savedState.extensionState.activeOperations,
          },
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  private async saveState() {
    try {
      await chrome.storage.local.set({ extensionState: this.state });
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  // Subscribe to state changes
  subscribe(listener: (state: ExtensionState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // State update methods
  updateWebSocketState(connected: boolean) {
    this.state.websocket.connected = connected;
    this.state.websocket.lastConnected = connected ? Date.now() : this.state.websocket.lastConnected;
    this.saveState();
    this.notifyListeners();
  }

  updateAuthState(isAuthenticated: boolean, token?: string, userId?: string) {
    this.state.auth = {
      isAuthenticated,
      token: token || null,
      userId: userId || null,
    };
    this.saveState();
    this.notifyListeners();
  }

  updateSettings(settings: Partial<ExtensionState['settings']>) {
    // Keep all existing settings and override only those specified in the update
    const existingSettings = this.state.settings;
    this.state.settings = {
      websocketUrl: existingSettings.websocketUrl,
      autoReconnect: existingSettings.autoReconnect,
      notificationsEnabled: existingSettings.notificationsEnabled,
      ...settings  // Override only specified settings
    };
    this.saveState();
    this.notifyListeners();
  }

  updateTabOperation(tabId: number, status: 'idle' | 'running' | 'error', operation?: string, error?: string) {
    this.state.activeOperations[tabId] = {
      status,
      lastOperation: operation || null,
      ...(error && { error }),
    };
    this.saveState();
    this.notifyListeners();
  }

  // State getters
  getState(): ExtensionState {
    return { ...this.state };
  }

  getWebSocketState() {
    return { ...this.state.websocket };
  }

  getAuthState() {
    return { ...this.state.auth };
  }

  getSettings() {
    return { ...this.state.settings };
  }

  getTabOperation(tabId: number) {
    return this.state.activeOperations[tabId] || { status: 'idle', lastOperation: null };
  }
}

// Create state manager instance
export const stateManager = new StateManager();

// Example usage of state manager
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');

  // Subscribe to state changes
  stateManager.subscribe((state) => {
    console.log('State updated:', state);
  });
});
