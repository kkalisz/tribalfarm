import { CommandPayload } from '../base/CommandMessage';
import { Coordinates } from './SendAttackAction';

export interface SwitchVillageActionParameters {
  villageId?: string;
  coordinates?: Coordinates;
  villageName?: string;
}

export interface SwitchVillageActionPayload extends CommandPayload {
  action: 'switchVillage';
  parameters: SwitchVillageActionParameters;
}