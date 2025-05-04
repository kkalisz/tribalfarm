import { CommandPayload } from '../base/CommandMessage';

export interface TroopCounts {
  [troopType: string]: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface SendAttackActionParameters {
  troops: TroopCounts;
  target: Coordinates;
  timing?: {
    arrivalTime?: string; // ISO date string
    sendTime?: string;    // ISO date string
  };
}

export interface SendAttackActionPayload extends CommandPayload {
  action: 'sendAttack';
  parameters: SendAttackActionParameters;
}