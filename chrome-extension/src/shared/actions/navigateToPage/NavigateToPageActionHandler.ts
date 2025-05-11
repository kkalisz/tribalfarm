
import {doneResponse, GenericStatusPayload} from "@src/shared/actions/core/types";
import {ActionHandler} from "@src/shared/actions/core/ActionHandler";
import { ActionContext } from "../core/ActionContext";
import {
  NavigateToPageAction,
  NavigateToPageActionResponse
} from "@src/shared/actions/navigateToPage/NavigateToPageAction";

export class NavigateToPageActionHandler implements ActionHandler<NavigateToPageAction, NavigateToPageActionResponse> {

  const isUrl
  execute(action: NavigateToPageAction, context: ActionContext): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {
    return Promise.resolve(
      doneResponse({
        url: window.location.href,
        pageContent: window.document.body.innerHTML,
      })
    );
  }
}

