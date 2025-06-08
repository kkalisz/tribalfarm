import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";

export interface BackendAction<
  ACTION,
  RESPONSE
> {
  execute(context: BackendActionContext, action: ACTION): Promise<RESPONSE>;
}
