import {PlayerUiContext} from "@src/shared/contexts/PlayerContext";
import {MessageSender} from "@src/shared/services/MessageSender";

export interface ActionContext extends PlayerUiContext{
    messenger: MessageSender
    isCurrentActionRestored: boolean;
    actionId: string;
}