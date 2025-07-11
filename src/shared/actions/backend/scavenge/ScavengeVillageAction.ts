import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {BackendAction} from "@src/shared/actions/backend/core/BackendAction";
import {scavengeVillage, StartScavengeActionInput, StartScavengeActionOutput} from "@src/shared/actions/backend/scavenge/scavengeVillage";

export const SCAVENGE_VILLAGE_ACTION = 'scavengeVillageAction';

export class ScavengeVillageAction implements BackendAction<StartScavengeActionInput, StartScavengeActionOutput>{
    async execute(context: BackendActionContext, action: StartScavengeActionInput,): Promise<StartScavengeActionOutput> {
      return scavengeVillage(context, action);
    }
}
