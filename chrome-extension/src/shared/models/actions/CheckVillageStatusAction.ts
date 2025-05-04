import { CommandPayload } from '../base/CommandMessage';

export enum VillageDataType {
  BUILDINGS = 'buildings',
  TROOPS = 'troops',
  RESOURCES = 'resources',
  QUEUE = 'queue',
  ALL = 'all'
}

export interface CheckVillageStatusActionParameters {
  dataTypes?: VillageDataType[]; // If not provided, defaults to ALL
}

export interface CheckVillageStatusActionPayload extends CommandPayload {
  action: 'checkVillageStatus';
  parameters: CheckVillageStatusActionParameters;
}