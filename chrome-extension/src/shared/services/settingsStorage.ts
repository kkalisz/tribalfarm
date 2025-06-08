import { useEffect, useState } from 'react';

// Define types for settings
export interface Settings {
  [key: string]: any;
}

type SettingsListener = (settings: Settings) => void;

export class SettingsStorageService {
  private prefix: string;
  private listeners: Map<string, SettingsListener[]> = new Map();

  constructor(prefix: string) {
    this.prefix = prefix;

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      Object.entries(changes).forEach(([fullKey, { newValue }]) => {
        if (!fullKey.startsWith(this.prefix + ':')) return;

        const key = this.stripPrefix(fullKey);
        this.notifyListeners(key, { [key]: newValue });
      });
    });
  }

  private addPrefix(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private stripPrefix(fullKey: string): string {
    return fullKey.slice(this.prefix.length + 1); // +1 for colon
  }

  async saveSetting<T>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.addPrefix(key);
      await chrome.storage.sync.set({ [fullKey]: value });
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  }

  async getSetting<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.addPrefix(key);
      const result = await chrome.storage.sync.get(fullKey);
      return result[fullKey];
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  }

  async getSettingOrDefault<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const result = await this.getSetting<T>(key)
      return result ?? defaultValue;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }

  addListener(key: string, listener: SettingsListener): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)?.push(listener);
  }

  removeListener(key: string, listener: SettingsListener): void {
    const keyListeners = this.listeners.get(key);
    if (!keyListeners) return;

    const index = keyListeners.indexOf(listener);
    if (index !== -1) {
      keyListeners.splice(index, 1);
    }
  }

  private notifyListeners(key: string, settings: Settings): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(settings));
    }
  }
}

// React hook for using settings
export function useSetting<T>(settingsStorage: SettingsStorageService, key: string, defaultValue: T): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);

  // Load the setting on mount
  useEffect(() => {
    let isMounted = true;

    const loadSetting = async () => {
      const storedValue = await settingsStorage.getSettingOrDefault<T>(key, defaultValue);
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

