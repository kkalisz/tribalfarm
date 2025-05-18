import {
  BasePageAction,
  BasePageResponse,
  GenericStatusPayload,
  Messenger
} from "@src/shared/actions/content/core/types";
import {
  PAGE_STATUS_ACTION,
  PageStatusAction,
  PageStatusResponse
} from "@src/shared/actions/content/pageStatus/PageStatusAction";
import {
  NAVIGATE_TO_PAGE_ACTION,
  NavigateToPageAction,
  NavigateToPageActionResponse
} from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";

export class MessengerWrapper implements Messenger{
  private messenger: Messenger;

  constructor(messenger: Messenger) {
    this.messenger = messenger;
  }

  sendCommand<RESPONSE extends BasePageResponse, BA extends BasePageAction<RESPONSE>>(actionName: string, action: BA): Promise<GenericStatusPayload<RESPONSE>> {
    return this.messenger.sendCommand(actionName, action);
  }

  dispose(): any {
    this.messenger.dispose();
  }

  async executePageStatusAction(parameters: PageStatusAction): Promise<GenericStatusPayload<PageStatusResponse>> {
    return await this.sendCommand<PageStatusResponse, PageStatusAction>(PAGE_STATUS_ACTION, parameters);
  }

  async executeNavigateToPageAction(parameters: NavigateToPageAction): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {
    return await this.sendCommand<NavigateToPageActionResponse, NavigateToPageAction>(NAVIGATE_TO_PAGE_ACTION, parameters);
  }
}