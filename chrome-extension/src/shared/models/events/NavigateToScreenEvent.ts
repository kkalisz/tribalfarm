import { EventPayload } from '../base/EventMessage';
import { Coordinates } from '@src/shared/models/actions';

export interface AttackResponseDetails {
  success: boolean;
  url: string;
}

export interface AttackResponseEventPayload extends EventPayload {
  eventType: 'navigateToScreenResponse';
  details: AttackResponseDetails;
}