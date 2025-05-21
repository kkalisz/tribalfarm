import {
  BasePageAction,
  BasePageResponse,
  GenericStatusPayload,
  Message,
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
import {FILL_INPUT_ACTION, FillInputAction, FillInputActionResponse} from "@src/shared/actions/content/fillInput/FillInputAction";
import {CLICK_ACTION, ClickAction, ClickActionResponse} from "@src/shared/actions/content/click/ClickAction";

export class MessengerWrapper implements Messenger {
  private messenger: Messenger;

  constructor(messenger: Messenger) {
    this.messenger = messenger;
  }

  waitFor(type: "status" | "event" | "error", predicate: (message: Message) => boolean, timeoutMs: number, actionId?: string): Promise<Record<string, unknown>> {
    return this.messenger.waitFor(type, predicate, timeoutMs, actionId);
  }

  sendCommand<RESPONSE extends BasePageResponse, BA extends BasePageAction<RESPONSE>>(actionName: string, action: BA): Promise<GenericStatusPayload<RESPONSE>> {
    return this.messenger.sendCommand(actionName, action);
  }

  dispose(): void {
    this.messenger.dispose();
  }

  async executePageStatusAction(parameters: PageStatusAction): Promise<GenericStatusPayload<PageStatusResponse>> {
    return await this.sendCommand<PageStatusResponse, PageStatusAction>(PAGE_STATUS_ACTION, parameters);
  }

  async executeFillInputAction(parameters: FillInputAction): Promise<GenericStatusPayload<FillInputActionResponse>> {
    return await this.sendCommand<FillInputActionResponse, FillInputAction>(FILL_INPUT_ACTION, parameters);
  }

  async executeClickAction(parameters: ClickAction): Promise<GenericStatusPayload<ClickActionResponse>> {
    return await this.sendCommand<ClickActionResponse, ClickAction>(CLICK_ACTION, parameters);
  }

  async executeNavigateToPageAction(parameters: NavigateToPageAction): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {
    return await this.sendCommand<NavigateToPageActionResponse, NavigateToPageAction>(NAVIGATE_TO_PAGE_ACTION, parameters);
  }
}