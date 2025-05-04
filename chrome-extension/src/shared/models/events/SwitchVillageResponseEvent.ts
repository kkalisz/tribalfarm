import { EventPayload } from '../base/EventMessage';
import { Coordinates } from '../actions/SendAttackAction';
import { ResourceCost } from './BuildResponseEvent';

export interface VillageDetails {
  villageId: string;
  name: string;
  coordinates: Coordinates;
  points: number;
  resources: ResourceCost & { population: number; };
  buildingLevels?: Record<string, number>;
  troopCounts?: Record<string, number>;
}

export interface SwitchVillageResponseDetails {
  success: boolean;
  previousVillage?: {
    villageId: string;
    name: string;
  };
  currentVillage: VillageDetails;
  error?: {
    message: string;
    code?: string;
    reason?: 'village_not_found' | 'not_owned' | 'other';
  };
}

export interface SwitchVillageResponseEventPayload extends EventPayload {
  eventType: 'switchVillageResponse';
  details: SwitchVillageResponseDetails;
}