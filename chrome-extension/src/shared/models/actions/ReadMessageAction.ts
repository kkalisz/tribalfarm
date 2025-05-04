import { CommandPayload } from '../base/CommandMessage';

export enum MessageType {
  INBOX = 'inbox',
  OUTBOX = 'outbox',
  SYSTEM = 'system',
  TRIBE = 'tribe'
}

export interface MessageFilter {
  type?: MessageType;
  read?: boolean;
  sender?: string;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  limit?: number;
}

export interface ReadMessageActionParameters {
  messageId?: string;  // If provided, read specific message
  filter?: MessageFilter; // If messageId not provided, use filter to find messages
  markAsRead?: boolean;
}

export interface ReadMessageActionPayload extends CommandPayload {
  action: 'readMessage';
  parameters: ReadMessageActionParameters;
}