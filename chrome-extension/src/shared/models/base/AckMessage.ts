import { BaseMessage } from './BaseMessage';

export interface AckPayload {
  received: string;
}

export interface AckMessage<T extends AckPayload = AckPayload> extends BaseMessage {
  type: 'ack';
  payload: T;
}