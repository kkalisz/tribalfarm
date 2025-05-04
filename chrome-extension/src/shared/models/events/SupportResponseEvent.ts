import { EventPayload } from '../base/EventMessage';
import { Coordinates } from '../actions/SendAttackAction';

export interface SupportResponseDetails {
  success: boolean;
  source?: Coordinates;
  target: Coordinates;
  troops: Record<string, number>;
  arrivalTime?: string; // ISO date string
  error?: {
    message: string;
    code?: string;
    reason?: 'insufficient_troops' | 'invalid_target' | 'not_ally' | 'other';
  };
}

export interface SupportResponseEventPayload extends EventPayload {
  eventType: 'supportResponse';
  details: SupportResponseDetails;
}