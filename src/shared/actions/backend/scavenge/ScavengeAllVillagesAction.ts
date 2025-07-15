import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {BackendAction} from "@src/shared/actions/backend/core/BackendAction";
import {scavengeAllVillages} from "@src/shared/actions/backend/scavenge/scavengeAllVillages";

export const SCAVENGE_ALL_VILLAGES_ACTION = 'scavengeAllVillagesAction';

export class ScavengeAllVillagesAction implements BackendAction<void, boolean>{
    async execute(context: BackendActionContext, action: void): Promise<boolean> {
      return scavengeAllVillages(context);
    }
}
