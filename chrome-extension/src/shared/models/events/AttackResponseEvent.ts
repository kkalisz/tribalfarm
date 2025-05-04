import { EventPayload } from '../base/EventMessage';
import { Coordinates } from '@src/shared/models/actions';

export interface AttackResponseDetails {
  success: boolean;
  source?: Coordinates;
  target: Coordinates;
  troops: Record<string, number>;
  arrivalTime?: string; // ISO date string
  error?: {
    message: string;
    code?: string;
    reason?: 'insufficient_troops' | 'invalid_target' | 'cooldown' | 'other';
  };
}

export interface AttackResponseEventPayload extends EventPayload {
  eventType: 'attackResponse';
  details: AttackResponseDetails;
}