import {TabMessenger} from "@src/shared/actions/content/core/TabMessenger";
import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {Messenger} from "@src/shared/actions/content/core/types";
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";

export interface BackendActionContext {
  messenger: MessengerWrapper;
  playerSettings: PlayerSettings;
}