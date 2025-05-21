import {BasePageAction, BasePageResponse} from "@src/shared/actions/content/core/types";

export const FILL_INPUT_ACTION = 'fillInputAction';

export interface InputParam {
  selector: string;
  value: string;
}

export interface FillInputActionResponse extends BasePageResponse{
  allInputsFilledCorrectly: boolean;

}

export interface FillInputAction extends BasePageAction<FillInputActionResponse> {
  inputs: InputParam[];
}
