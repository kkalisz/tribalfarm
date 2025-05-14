import { settingsStorage } from '@src/shared/services/settingsStorage';
import { defaultPlayerSettings, PLAYER_SETTINGS_STORAGE_KEY, PlayerSettings } from '@src/shared/hooks/usePlayerSettings';

export function hasValidPlayerSettings(playerSettings: PlayerSettings): boolean {
  return !!playerSettings.login && !!playerSettings.password && !!playerSettings.world && !!playerSettings.server;
}

export class PlayerSettingsManager {
  private static instance: PlayerSettingsManager; // Singleton instance
  private playerSettings: PlayerSettings | null = null;

  private constructor() {
    // Add a listener to update playerSettings on changes
    settingsStorage.addListener(PLAYER_SETTINGS_STORAGE_KEY, (settings) => {
      this.playerSettings = settings[PLAYER_SETTINGS_STORAGE_KEY];
    });
  }

  // Public method to get the singleton instance
  public static getInstance(): PlayerSettingsManager {
    if (!PlayerSettingsManager.instance) {
      PlayerSettingsManager.instance = new PlayerSettingsManager();
    }
    return PlayerSettingsManager.instance;
  }

  // Method to load and return the player settings
  public async getPlayerSettings(): Promise<PlayerSettings> {
    if (!this.playerSettings) {
      this.playerSettings = await settingsStorage.getSetting<PlayerSettings>(
        PLAYER_SETTINGS_STORAGE_KEY,
        defaultPlayerSettings
      );
    }
    return this.playerSettings;
  }

  public async hasValidSettings(): Promise<boolean> {
    return hasValidPlayerSettings(await this.getPlayerSettings());
  }
}

