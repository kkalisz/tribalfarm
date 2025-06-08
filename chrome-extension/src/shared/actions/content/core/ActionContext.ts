import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {ContentPageContext} from "@pages/content";

export interface ActionContext extends ContentPageContext{
    isCurrentActionRestored: boolean;
    actionId: string;
}