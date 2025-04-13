export interface BaseMessage {
  type: 'command' | 'status' | 'event' | 'error' | 'ack';
  actionId: string;
  timestamp: string;
  correlationId?: string;
}

export interface CommandMessage extends BaseMessage {
  type: 'command';
  payload: {
    action: string;
    parameters: Record<string, any>;
  };
}

export interface StatusMessage extends BaseMessage {
  type: 'status';
  payload: {
    status: 'in-progress' | 'done' | 'error' | 'interrupted';
    details?: Record<string, any>;
  };
}

export interface EventMessage extends BaseMessage {
  type: 'event';
  payload: {
    eventType: 'popup' | 'modal' | 'validation' | 'stateChange';
    details: Record<string, any>;
  };
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: {
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
}

export interface AckMessage extends BaseMessage {
  type: 'ack';
  payload: {
    received: string;
  };
}

export type Message = CommandMessage | StatusMessage | EventMessage | ErrorMessage | AckMessage;