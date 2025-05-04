import { CommandPayload } from '../base/CommandMessage';

export interface ShutdownActionParameters {
  reason?: string;
  saveState?: boolean;
  force?: boolean;
}

export interface ShutdownActionPayload extends CommandPayload {
  action: 'shutdown';
  parameters: ShutdownActionParameters;
}