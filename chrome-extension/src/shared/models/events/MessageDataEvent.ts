import { EventPayload } from '../base/EventMessage';
import { MessageType } from '../actions/ReadMessageAction';

export interface MessageDataDetails {
  messageId: string;
  type: MessageType;
  subject: string;
  date: string; // ISO date string
  sender?: string;
  senderTribe?: string;
  recipient?: string;
  recipientTribe?: string;
  read: boolean;
  content: string;
  hasAttachments: boolean;
  attachments?: {
    type: 'report' | 'coordinates' | 'other';
    id?: string;
    data?: Record<string, any>;
  }[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface MessageDataEventPayload extends EventPayload {
  eventType: 'messageData';
  details: MessageDataDetails;
}