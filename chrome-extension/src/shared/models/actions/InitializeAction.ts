import { CommandPayload } from '../base/CommandMessage';

export interface InitializeActionParameters {
  clientId?: string;
  capabilities?: string[];
  config?: {
    delayMin?: number; // Minimum delay in ms for human-like behavior
    delayMax?: number; // Maximum delay in ms for human-like behavior
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    autoReconnect?: boolean;
  };
}

export interface InitializeActionPayload extends CommandPayload {
  action: 'initialize';
  parameters: InitializeActionParameters;
}