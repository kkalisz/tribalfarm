
import {PageStatusAction, PageStatusResponse} from "@src/shared/actions/content/pageStatus/PageStatusAction";
import {doneResponse, GenericStatusPayload} from "@src/shared/actions/content/core/types";
import {ActionHandler} from "@src/shared/actions/content/core/ActionHandler";
import { ActionContext } from "@src/shared/actions/content/core/ActionContext";

export class PageStatusActionHandler implements ActionHandler<PageStatusAction, PageStatusResponse> {

  execute(action: PageStatusAction, context: ActionContext): Promise<GenericStatusPayload<PageStatusResponse>> {
    return Promise.resolve(
      doneResponse({
        url: window.location.href,
        pageContent: window.document.body.innerHTML,
      })
    );
  }
}

