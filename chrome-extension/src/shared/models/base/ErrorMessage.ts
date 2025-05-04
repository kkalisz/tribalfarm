import { BaseMessage } from './BaseMessage';

export interface ErrorPayload {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ErrorMessage<T extends ErrorPayload = ErrorPayload> extends BaseMessage {
  type: 'error';
  payload: T;
}