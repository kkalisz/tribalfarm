import { BaseMessage } from './BaseMessage';

export interface StatusPayload {
  status: 'in-progress' | 'done' | 'error' | 'interrupted';
  details?: Record<string, any>;
}

export interface StatusMessage<T extends StatusPayload = StatusPayload> extends BaseMessage {
  type: 'status';
  payload: T;
}