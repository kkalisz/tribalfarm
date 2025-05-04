import { EventPayload } from '../base/EventMessage';
import { DefenseStrategy } from '../actions/RespondToAttackAction';
import { IncomingAttack } from './IncomingAttackDetectedEvent';

export interface DefenseAction {
  type: 'evacuate' | 'reinforce' | 'counter_attack' | 'ignore';
  success: boolean;
  details?: Record<string, any>;
}

export interface AttackResponseOutcomeDetails {
  attack: IncomingAttack;
  strategy: DefenseStrategy;
  actions: DefenseAction[];
  outcome: 'successful' | 'partial' | 'failed';
  error?: {
    message: string;
    code?: string;
  };
}

export interface AttackResponseOutcomeEventPayload extends EventPayload {
  eventType: 'attackResponseOutcome';
  details: AttackResponseOutcomeDetails;
}