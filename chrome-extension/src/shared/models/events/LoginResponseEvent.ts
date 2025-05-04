import { EventPayload } from '../base/EventMessage';

export interface LoginResponseDetails {
  success: boolean;
  sessionToken?: string;
  accountDetails?: {
    username: string;
    worldId: string;
    playerId?: string;
    premium?: boolean;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface LoginResponseEventPayload extends EventPayload {
  eventType: 'loginResponse';
  details: LoginResponseDetails;
}