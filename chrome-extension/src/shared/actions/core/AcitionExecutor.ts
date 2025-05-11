import {ActionHandler} from "@src/shared/actions/core/ActionHandler";
import {BaseAction, BaseResponse} from "@src/shared/actions/pageStatus/PageStatusAction";
import {GenericStatusPayload} from "@src/shared/actions/core/types";

export class ActionExecutor {
  private handlers: Record<string, ActionHandler<BaseAction, BaseResponse>> = {};

  // Register a handler for a specific action name
  register<
    ACTION extends BaseAction<RESPONSE>,
    RESPONSE extends BaseResponse
  >(actionName: string, handler: ActionHandler<ACTION, RESPONSE>): void {
    this.handlers[actionName] = handler as ActionHandler<BaseAction, BaseResponse>;
  }

  // Execute a handler by action name, enforcing type safety for action and response
  async execute<
    ACTION extends BaseAction<RESPONSE>,
    RESPONSE extends BaseResponse
  >(actionName: string, action: ACTION): Promise<GenericStatusPayload<RESPONSE>> {
    const handler = this.handlers[actionName] as ActionHandler<ACTION, RESPONSE>;
    if (!handler) {
      throw new Error(`No handler registered for action: "${actionName}"`);
    }
    const context = {
      context: "aa",
    };
    return handler.execute(action, context);
  }

  canHandleAction(action: string) {
    return !!this.handlers[action];
  }
}
