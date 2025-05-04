export interface BaseMessage {
  type: 'command' | 'status' | 'event' | 'error' | 'ack';
  actionId: string;
  timestamp: string;
  correlationId?: string;
}