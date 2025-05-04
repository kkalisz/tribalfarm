import { EventPayload } from '../base/EventMessage';
import { ScavengeOption } from '@src/shared/models/actions';

export interface ResourceYield {
  wood?: number;
  clay?: number;
  iron?: number;
  total?: number;
}

export interface ScavengeResponseDetails {
  success: boolean;
  option?: ScavengeOption;
  troops: Record<string, number>;
  duration: number; // in seconds
  completionTime: string; // ISO date string
  expectedYield?: ResourceYield;
  error?: {
    message: string;
    code?: string;
    reason?: 'insufficient_troops' | 'option_locked' | 'already_running' | 'other';
  };
}

export interface ScavengeResponseEventPayload extends EventPayload {
  eventType: 'scavengeResponse';
  details: ScavengeResponseDetails;
}