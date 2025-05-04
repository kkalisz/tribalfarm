import { BaseMessage } from './BaseMessage';

export interface EventPayload {
  eventType: 'popup' | 'modal' | 'validation' | 'stateChange' | string;
  details: Record<string, any>;
}

export interface EventMessage<T extends EventPayload = EventPayload> extends BaseMessage {
  type: 'event';
  payload: T;
}