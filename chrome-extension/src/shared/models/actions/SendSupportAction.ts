import { CommandPayload } from '../base/CommandMessage';
import { TroopCounts, Coordinates } from './SendAttackAction';

export interface SendSupportActionParameters {
  troops: TroopCounts;
  target: Coordinates;
  timing?: {
    arrivalTime?: string; // ISO date string
    sendTime?: string;    // ISO date string
  };
}

export interface SendSupportActionPayload extends CommandPayload {
  action: 'sendSupport';
  parameters: SendSupportActionParameters;
}