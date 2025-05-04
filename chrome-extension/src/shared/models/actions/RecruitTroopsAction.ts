import { CommandPayload } from '../base/CommandMessage';
import { TroopCounts } from './SendAttackAction';
import { BuildingType } from './BuildBuildingAction';

export interface RecruitmentBuilding {
  type: BuildingType.BARRACKS | BuildingType.STABLE | BuildingType.WORKSHOP;
  queuePosition?: number;
}

export interface RecruitTroopsActionParameters {
  troops: TroopCounts;
  building?: RecruitmentBuilding; // If not provided, auto-select appropriate building
  optimizeQueue?: boolean;
}

export interface RecruitTroopsActionPayload extends CommandPayload {
  action: 'recruitTroops';
  parameters: RecruitTroopsActionParameters;
}