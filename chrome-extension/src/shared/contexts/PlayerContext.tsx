import {GameUrlInfo } from '@src/shared/helpers/getGameUrlInfo';
import {WorldConfig} from "@src/shared/models/game/WorldConfig";
import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";

export interface PlayerUiContext {
  settings: SettingsStorageService;
  gameUrlInfo: GameUrlInfo;
  playerSettings: PlayerSettings;
  worldConfig: WorldConfig;
  gameDatabase: GameDataBaseAccess;
}
