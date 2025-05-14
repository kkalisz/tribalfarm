import {ActionHandler} from "@src/shared/actions/content/core/ActionHandler";
import {BasePageAction, BasePageResponse, GenericStatusPayload} from "@src/shared/actions/content/core/types";
import {ActionContext} from "@src/shared/actions/content/core/ActionContext";

export class ActionExecutor {
  private handlers: Record<string, ActionHandler<BasePageAction, BasePageResponse>> = {};

  // Register a handler for a specific action name
  register<
    ACTION extends BasePageAction<RESPONSE>,
    RESPONSE extends BasePageResponse
  >(actionName: string, handler: ActionHandler<ACTION, RESPONSE>): void {
    this.handlers[actionName] = handler as ActionHandler<BasePageAction, BasePageResponse>;
  }

  canHandleAction(action: string) {
    return !!this.handlers[action];
  }
  // Execute a handler by action name, enforcing type safety for action and response
  async execute<
    ACTION extends BasePageAction<RESPONSE>,
    RESPONSE extends BasePageResponse
  >(actionContext: ActionContext, actionName: string, action: ACTION): Promise<GenericStatusPayload<RESPONSE>> {

    if(!this.canHandleAction(actionName)){
      console.log(`Action ${action} is not supported`);
      return {status: 'error', statusMessage: 'action not supported'};
    }

    const handler = this.handlers[actionName] as ActionHandler<ACTION, RESPONSE>;
    if (!handler) {
      throw new Error(`No handler registered for action: "${actionName}"`);
    }
    return handler.execute(action, actionContext);
  }
}
