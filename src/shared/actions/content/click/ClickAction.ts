import {BasePageAction, BasePageResponse} from "@src/shared/actions/content/core/types";

export const CLICK_ACTION = 'clickAction';

export interface ClickParam {
  selector: string;
}

export interface ClickActionResponse extends BasePageResponse{
  allClicksDone: boolean;
}

export interface ClickAction extends BasePageAction<ClickActionResponse> {
  inputs: ClickParam[];
}

export function singleClick(selector: string): ClickAction{
  return {
    inputs: [{
      selector: selector,
    }]
  }
}