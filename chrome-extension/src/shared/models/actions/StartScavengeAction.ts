import { CommandPayload } from '../base/CommandMessage';
import { TroopCounts } from './SendAttackAction';

export interface ScavengeOption {
  id: number;
  name?: string;
  duration?: number; // in seconds
}

export interface StartScavengeActionParameters {
  option?: ScavengeOption;
  troops?: TroopCounts;
  autoOptimize?: boolean;
}

export interface StartScavengeActionPayload extends CommandPayload {
  action: 'startScavenge';
  parameters: StartScavengeActionParameters;
}