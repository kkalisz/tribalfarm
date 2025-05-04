import { CommandPayload } from '../base/CommandMessage';

export interface LoginActionParameters {
  username: string;
  password: string;
  worldId: string;
}

export interface LoginActionPayload extends CommandPayload {
  action: 'login';
  parameters: LoginActionParameters;
}