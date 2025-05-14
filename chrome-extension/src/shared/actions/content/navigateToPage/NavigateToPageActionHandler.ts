
import {doneResponse, GenericStatusPayload, inProgressResponse} from "@src/shared/actions/content/core/types";
import {ActionHandler} from "@src/shared/actions/content/core/ActionHandler";
import { ActionContext } from "@src/shared/actions/content/core/ActionContext";
import {
  NavigateToPageAction,
  NavigateToPageActionResponse
} from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";

export class NavigateToPageActionHandler implements ActionHandler<NavigateToPageAction, NavigateToPageActionResponse> {

  async execute(action: NavigateToPageAction, context: ActionContext): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {

    const isTheSameUrl = window.location.href === action.url;
    if(isTheSameUrl && context.isCurrentActionRestored){
      return doneResponse<NavigateToPageActionResponse>({
        wasReloaded: true
      })
    }

    if(isTheSameUrl && !!action.reload){
      return doneResponse({
        wasReloaded: false
      })
    }

    window.location.href = action.url;
    return inProgressResponse();
  }
}

