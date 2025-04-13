import { useEffect, useState } from 'react';

// Define types for settings
export interface Settings {
  [key: string]: any;
}

// Define types for listeners
type SettingsListener = (settings: Settings) => void;

// Class to manage settings storage
class SettingsStorageService {
  private listeners: Map<string, SettingsListener[]> = new Map();

  constructor() {
    // Add listener for Chrome storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      // Notify listeners for each changed key
      Object.keys(changes).forEach(key => {
        const newValue = changes[key].newValue;
        this.notifyListeners(key, { [key]: newValue });
      });
    });
  }

  // Save a setting
  async saveSetting<T>(key: string, value: T): Promise<void> {
    try {
      // Create an object with the key-value pair
      const data = { [key]: value };

      // Save to Chrome storage
      await chrome.storage.sync.set(data);

      // Notify listeners is now handled by the onChanged listener
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  }

  // Get a setting
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
      // Get from Chrome storage
      const result = await chrome.storage.sync.get(key);

      // Return the value or default if not found
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }

  // Register a listener for a specific setting
  addListener(key: string, listener: SettingsListener): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key)?.push(listener);
  }

  // Remove a listener
  removeListener(key: string, listener: SettingsListener): void {
    if (!this.listeners.has(key)) return;

    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      const index = keyListeners.indexOf(listener);
      if (index !== -1) {
        keyListeners.splice(index, 1);
      }
    }
  }

  // Notify all listeners for a specific key
  private notifyListeners(key: string, settings: Settings): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(settings));
    }
  }
}

// Create a singleton instance
export const settingsStorage = new SettingsStorageService();

// React hook for using settings
export function useSetting<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);

  // Load the setting on mount
  useEffect(() => {
    let isMounted = true;

    const loadSetting = async () => {
      const storedValue = await settingsStorage.getSetting<T>(key, defaultValue);
      if (isMounted) {
        setValue(storedValue);
      }
    };

    loadSetting();

    // Add listener for changes
    const handleSettingChange = (settings: Settings) => {
      if (settings[key] !== undefined && isMounted) {
        setValue(settings[key]);
      }
    };

    settingsStorage.addListener(key, handleSettingChange);

    // Clean up
    return () => {
      isMounted = false;
      settingsStorage.removeListener(key, handleSettingChange);
    };
  }, [key, defaultValue]);

  // Function to update the setting
  const updateSetting = async (newValue: T) => {
    await settingsStorage.saveSetting(key, newValue);
    // setValue is now handled by the onChanged listener
  };

  return [value, updateSetting];
}
