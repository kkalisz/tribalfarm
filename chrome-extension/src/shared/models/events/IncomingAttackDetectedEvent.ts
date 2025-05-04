import { EventPayload } from '../base/EventMessage';
import { Coordinates } from '../actions/SendAttackAction';

export interface IncomingAttack {
  attackId: string;
  source?: Coordinates;
  sourceVillageName?: string;
  sourcePlayerName?: string;
  sourceTribe?: string;
  target: Coordinates;
  targetVillageName?: string;
  arrivalTime: string; // ISO date string
  attackType?: 'attack' | 'raid' | 'noble' | 'unknown';
  troopEstimate?: 'small' | 'medium' | 'large' | 'unknown';
}

export interface IncomingAttackDetectedDetails {
  attacks: IncomingAttack[];
  targetVillageId?: string;
  detectionTime: string; // ISO date string
}

export interface IncomingAttackDetectedEventPayload extends EventPayload {
  eventType: 'incomingAttackDetected';
  details: IncomingAttackDetectedDetails;
}