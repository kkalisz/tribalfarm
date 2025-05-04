import { EventPayload } from '../base/EventMessage';
import {BuildingType} from "@src/shared/models/BuildingType";

export interface ResourceCost {
  wood: number;
  clay: number;
  iron: number;
}

export interface BuildResponseDetails {
  success: boolean;
  buildingType: BuildingType;
  level: number;
  queuePosition: number;
  completionTime: string; // ISO date string
  duration: number; // in seconds
  cost: ResourceCost;
  error?: {
    message: string;
    code?: string;
    reason?: 'insufficient_resources' | 'prerequisites_not_met' | 'queue_full' | 'other';
  };
}

export interface BuildResponseEventPayload extends EventPayload {
  eventType: 'buildResponse';
  details: BuildResponseDetails;
}