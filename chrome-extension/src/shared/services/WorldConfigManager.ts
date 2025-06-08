import { WorldConfig } from "@src/shared/models/game/WorldConfig";
import { fetchWorldConfig } from "@src/shared/helpers/fetchWorldConfig";
import {hasValidPlayerSettings, PlayerSettingsManager} from "@src/shared/services/PlayerSettingsManager";
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
import {PLAYER_SETTINGS_STORAGE_KEY, PlayerSettings} from "@src/shared/hooks/usePlayerSettings";

type ServerUrl = string;

class WorldConfigManager {
  private settingsStorage: SettingsStorageService;
  private serverUrl: string;
  private worldConfig: WorldConfig | null = null;

  constructor(settingsStorage: SettingsStorageService, serverUrl: string) {
    this.settingsStorage = settingsStorage;
    this.serverUrl = serverUrl;
    this.getWorldConfig(false)
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

  /**
   * Get the singleton instance of WorldConfigManager
   */
  public static getInstance(): WorldConfigManager {
    if (!this.instance) {
      this.instance = new WorldConfigManager();
    }
    return this.instance;
  }

  /**
   * Get world configuration for a specific server.
   * If the server URL is not provided, use the default from user settings.
   * @param serverUrl Optional custom server URL to fetch the configuration for.
   * @param refetch Force refetch the configuration.
   * @returns A promise resolving to the WorldConfig object.
   */
  public async getWorldConfig(refetch: boolean = false): Promise<WorldConfig> {
    // If no serverUrl is provided, use user's default server from settings.
    if (!serverUrl) {
      const userSettings = await PlayerSettingsManager.getInstance().getPlayerSettings();
      serverUrl = userSettings.server;
    }

    // Check if the configuration is cached and refetch is not requested.
    if (this.cache.has(serverUrl) && !refetch) {
      console.log(`Cache hit for server: ${serverUrl}`);
      return this.cache.get(serverUrl)!;
    }

    // If not cached or refetch is true, fetch the configuration.
    console.log(`Fetching world config for server: ${serverUrl}`);
    const config = await fetchWorldConfig(serverUrl);

    // Store the fetched configuration in the cache.
    this.cache.set(serverUrl, config);

    return config;
  }

  /**
   * Clear the cached world configurations.
   * @param serverUrl Optional server URL to clear the cache for a specific server.
   *                  If not provided, all cached configurations will be cleared.
   */
  public clearCache(serverUrl?: string): void {
    if (serverUrl) {
      this.cache.delete(serverUrl);
      console.log(`Cache cleared for server: ${serverUrl}`);
    } else {
      this.cache.clear();
      console.log("Cache cleared for all servers.");
    }
  }
}

export default WorldConfigManager;