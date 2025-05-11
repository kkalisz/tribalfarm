import {BaseAction, BaseResponse} from "@src/shared/actions/pageStatus/PageStatusAction";

export interface NavigateToPageActionResponse extends BaseResponse{
  wasReloaded: boolean;
}

export interface NavigateToPageAction extends BaseAction<NavigateToPageActionResponse> {
  url: string;
  reload?: boolean;
}
