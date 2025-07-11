import {ActionContext} from "@src/shared/actions/content/core/ActionContext";
import {BasePageAction, BasePageResponse, GenericStatusPayload} from "@src/shared/actions/content/core/types";

export interface ActionHandler<
  ACTION extends BasePageAction<RESPONSE> = BasePageAction<never>,
  RESPONSE extends BasePageResponse = BasePageResponse
> {
  execute(action: ACTION, context: ActionContext): Promise<GenericStatusPayload<RESPONSE>>;
}
