import {BasePageAction, BasePageResponse} from "@src/shared/actions/content/core/types";

export const NAVIGATE_TO_PAGE_ACTION = 'navigateToPageAction';

export interface NavigateToPageActionResponse extends BasePageResponse{
  wasReloaded: boolean;
}

export interface NavigateToPageAction extends BasePageAction<NavigateToPageActionResponse> {
  url: string;
  reload?: boolean;
}
