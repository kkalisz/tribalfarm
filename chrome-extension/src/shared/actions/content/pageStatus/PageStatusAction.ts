import {BasePageAction, BasePageResponse} from "@src/shared/actions/content/core/types";

export const PAGE_STATUS_ACTION = 'pageStatusAction';

export interface BaseVillageAction<RESPONSE extends BasePageResponse = BasePageResponse> extends BasePageAction<RESPONSE> {
  villageId: string;
}

export interface PageStatusResponse extends BasePageResponse{
  url: string
  pageContent?: string;
}

export interface PageStatusAction extends BasePageAction<PageStatusResponse> {
  extractContent?: boolean;
}
