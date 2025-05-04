import { CommandPayload } from '../base/CommandMessage';
import {BuildingType} from "@src/shared/models/BuildingType";
import {BuildResponseEventPayload} from "@src/shared/models/events/BuildResponseEvent";

export interface BuildBuildingActionParameters {
  buildingType: BuildingType;
  level?: number; // If not provided, build to next level
  queuePosition?: number; // Position in the build queue, default is next available
}

export interface BuildBuildingActionPayload extends CommandPayload<BuildResponseEventPayload> {
  action: 'buildBuilding';
  parameters: BuildBuildingActionParameters;
}