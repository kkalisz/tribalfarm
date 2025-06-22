import  { createContext, useContext } from 'react';
import {GameUrlInfo } from '@src/shared/helpers/getGameUrlInfo';
import {WorldConfig} from "@src/shared/models/game/WorldConfig";
import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
import {GameDataBase} from "@src/shared/db/GameDataBase";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";

export interface PlayerUiContextState {
  settings: SettingsStorageService;
  gameUrlInfo: GameUrlInfo;
  playerSettings: PlayerSettings;
  worldConfig: WorldConfig;
  gameDatabase: GameDataBaseAccess;
}

// Create the context with a default undefined value
export const PlayerUiContext = createContext<PlayerUiContextState | undefined>(undefined);

export const usePlayerContext = (): PlayerUiContextState => {
  const context = useContext(PlayerUiContext);
  
  if (context === undefined) {
    throw new Error('useSettingsStorage must be used within a PlayerProvider');
  }
  
  return context;
};