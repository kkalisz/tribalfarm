import { CommandPayload } from '../base/CommandMessage';
import { Coordinates } from './SendAttackAction';

export enum DefenseStrategy {
  EVACUATE = 'evacuate',
  REINFORCE = 'reinforce',
  COUNTER_ATTACK = 'counter_attack',
  IGNORE = 'ignore'
}

export interface AttackInfo {
  attackId: string;
  source?: Coordinates;
  arrivalTime: string; // ISO date string
  attackerName?: string;
  attackerTribe?: string;
}

export interface RespondToAttackActionParameters {
  attack: AttackInfo;
  strategy: DefenseStrategy;
  options?: {
    evacuateTarget?: Coordinates;
    reinforcementSource?: Coordinates[];
    counterAttackTroops?: Record<string, number>;
  };
}

export interface RespondToAttackActionPayload extends CommandPayload {
  action: 'respondToAttack';
  parameters: RespondToAttackActionParameters;
}