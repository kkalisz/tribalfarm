import { EventPayload } from '../base/EventMessage';
import { ResourceCost } from './BuildResponseEvent';
import { RecruitmentBuilding } from '../actions/RecruitTroopsAction';

export interface RecruitmentItem {
  troopType: string;
  count: number;
  completionTime: string; // ISO date string
  duration: number; // in seconds
  queuePosition: number;
}

export interface RecruitResponseDetails {
  success: boolean;
  building: RecruitmentBuilding;
  recruitments: RecruitmentItem[];
  totalCost: ResourceCost;
  error?: {
    message: string;
    code?: string;
    reason?: 'insufficient_resources' | 'insufficient_capacity' | 'queue_full' | 'other';
  };
}

export interface RecruitResponseEventPayload extends EventPayload {
  eventType: 'recruitResponse';
  details: RecruitResponseDetails;
}