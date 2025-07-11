import {PlayerUiContext} from "@src/shared/contexts/PlayerContext";
import {ContentMessengerWrapper} from "@pages/content/execute/ContentMessenger";

export interface ActionContext extends PlayerUiContext{
    messenger: ContentMessengerWrapper
    isCurrentActionRestored: boolean;
    actionId: string;
}