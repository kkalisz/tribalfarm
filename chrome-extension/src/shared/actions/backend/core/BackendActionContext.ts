import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";
import {WorldConfig} from "@src/shared/models/game/WorldConfig";

export interface BackendActionContext {
  messenger: MessengerWrapper;
  playerSettings: PlayerSettings;
  worldConfig: WorldConfig
}