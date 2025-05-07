
export interface BaseResponse{
  url: string
}

export interface BaseAction<RESPONSE extends BaseResponse = BaseResponse> {
  url: string
}

export interface PageStatusResponse extends BaseResponse{
  pageContent?: string;
}

export interface PageStatusAction extends BaseAction<PageStatusResponse> {
  extractContent?: boolean;
}
