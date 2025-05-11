import {BaseAction, BaseResponse} from "@src/shared/actions/pageStatus/PageStatusAction";
import {ActionContext} from "@src/shared/actions/core/ActionContext";
import {GenericStatusPayload} from "@src/shared/actions/core/types";

export interface ActionHandler<
  ACTION extends BaseAction<RESPONSE> = BaseAction<any>,
  RESPONSE extends BaseResponse = BaseResponse
> {
  execute(action: ACTION, context: ActionContext): Promise<GenericStatusPayload<RESPONSE>>;
}
