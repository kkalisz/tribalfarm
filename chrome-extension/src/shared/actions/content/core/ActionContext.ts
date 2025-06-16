import {PlayerUiContextState} from "@src/shared/contexts/PlayerContext";
import {ContentMessengerWrapper} from "@pages/content/execute/ContentMessenger";

export interface ActionContext extends PlayerUiContextState{
    messenger: ContentMessengerWrapper
    isCurrentActionRestored: boolean;
    actionId: string;
}