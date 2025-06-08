import { PLAYER_SETTINGS_STORAGE_KEY, PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import {SettingsStorageService} from "@src/shared/services/settingsStorage";

export function hasValidPlayerSettings(playerSettings: PlayerSettings): boolean {
  return !!playerSettings.login && !!playerSettings.password && !!playerSettings.world && !!playerSettings.server;
}

export class PlayerSettingsManager {
  private settingsStorage: SettingsStorageService;
  private playerSettings: PlayerSettings | null = null;

  constructor(settingsStorage: SettingsStorageService) {
    // Add a listener to update playerSettings on changes
    this.settingsStorage = settingsStorage;
    this.getPlayerSettings()
    settingsStorage.addListener(PLAYER_SETTINGS_STORAGE_KEY, (settings) => {
      this.playerSettings = settings[PLAYER_SETTINGS_STORAGE_KEY];
    });
  }

  // Method to load and return the player settings
  public async getPlayerSettings(): Promise<PlayerSettings | null> {
    if (!this.playerSettings) {
      this.playerSettings = await this.settingsStorage.getSetting<PlayerSettings>(
        PLAYER_SETTINGS_STORAGE_KEY,
      );
    }
    return this.playerSettings;
  }

  public async hasValidSettings(): Promise<boolean> {
    const settings = await this.getPlayerSettings();
    if(!settings) return false;
    return hasValidPlayerSettings(settings);
  }
}

