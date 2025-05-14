import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";

export interface ActionContext {
    isCurrentActionRestored: boolean;
    actionId: string;
    playerSettings: PlayerSettings;
}