import {SettingsStorageService, useSetting} from '@src/shared/services/settingsStorage';

export const PLAYER_SETTINGS_STORAGE_KEY = 'playerSettings';

export interface PlayerSettings {
  login: string;
  password: string;
  world: string;
  server: string;
}

export const defaultPlayerSettings: PlayerSettings = {
  login: '',
  password: '',
  world: '',
  server: ''
};

export function usePlayerSettings(settings: SettingsStorageService) {
  const [playerSettings, setPlayerSettings] = useSetting<PlayerSettings>(settings,PLAYER_SETTINGS_STORAGE_KEY, defaultPlayerSettings);
  return {
    playerSettings,
    setPlayerSettings
  }
}
