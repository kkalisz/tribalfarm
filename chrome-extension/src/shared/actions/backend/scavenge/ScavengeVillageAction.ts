import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {BackendAction} from "@src/shared/actions/backend/core/BackendAction";
import {scavengeVillage, StartScavengeActionInput} from "@src/shared/actions/backend/scavenge/scavengeVillage";

class ScavengeVillageAction implements BackendAction<StartScavengeActionInput, boolean>{
    async execute(context: BackendActionContext, action: StartScavengeActionInput,): Promise<boolean> {
      return scavengeVillage(context, action);
    }
}
