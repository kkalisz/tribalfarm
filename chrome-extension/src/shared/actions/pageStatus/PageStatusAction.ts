
export interface BaseResponse{

}

export interface BaseAction<RESPONSE extends BaseResponse = BaseResponse> {

}

export interface BaseVillageAction<RESPONSE extends BaseResponse = BaseResponse> extends BaseAction<RESPONSE> {
  villageId: string;
}

export interface PageStatusResponse extends BaseResponse{
  url: string
  pageContent?: string;
}

export interface PageStatusAction extends BaseAction<PageStatusResponse> {
  extractContent?: boolean;
}
