import {TabMessenger} from "@src/shared/actions/content/core/TabMessenger";
import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";

export interface BackendActionContext {
  messenger: TabMessenger;
  playerSettings: PlayerSettings;
}