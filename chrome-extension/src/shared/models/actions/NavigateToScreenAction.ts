import { CommandPayload } from '../base/CommandMessage';
import { Coordinates } from './SendAttackAction';
import {BuildingType} from "@src/shared/models/BuildingType";
import {BaseVillageAction} from "@src/shared/models/base/BaseAction";

export interface NavigateToScreenActionParameters extends BaseVillageAction{
  screen: string;
  parameters?: Record<string, string>
}

export interface NavigateToScreenActionPayload extends CommandPayload {
  action: 'navigateToScreenAction';
  parameters: NavigateToScreenActionParameters;
}