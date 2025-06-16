
export interface BasePageResponse {

}

export interface BasePageAction<RESPONSE extends BasePageResponse = BasePageResponse> {

}

export interface Messenger {
  sendCommand<RESPONSE extends BasePageResponse, BA extends BasePageAction<RESPONSE>>(
    actionName: string,
    action: BA
  ): Promise<GenericStatusPayload<RESPONSE>>

  dispose(): void;

  waitFor(
    type: 'status' | 'event' | 'error',
    predicate: (message: Message) => boolean,
    timeoutMs: number,
    actionId?: string
  ): Promise<Record<string, unknown>>
}


export interface BaseMessage {
  type: 'command' | 'commandResponse' | 'status' | 'event' | 'error' | 'ack' | 'contentScriptReady';
  fullDomain: string
  actionId: string;
  timestamp: string;
  correlationId?: string;
}

export interface ContentScriptReadyMessage extends BaseMessage {
  type: 'contentScriptReady';
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

export interface GenericStatusPayload<RESPONSE extends BasePageResponse>  {
  status: 'in-progress' | 'done' | 'error';
  details?: RESPONSE | undefined;
  statusMessage?: string;
}

export function doneResponse<RESPONSE extends BasePageResponse>(response: RESPONSE): GenericStatusPayload<RESPONSE> {
  return {
    status: "done",
    details: response
  }
}

export function inProgressResponse<RESPONSE extends BasePageResponse>(): GenericStatusPayload<RESPONSE> {
  return {
    status: "in-progress",
    details: undefined
  }
}

export interface EventMessage extends BaseMessage {
  type: 'event';
  payload: {
    eventType: 'popup' | 'modal' | 'validation' | 'stateChange';

    details: Record<string, string>;
  };
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: {
    message: string;
    code?: string;
    details?: Record<string, never>;
  };
}

export interface AckMessage extends BaseMessage {
  type: 'ack';
  payload: {
    received: string;
  };
}

export type Message = CommandMessage | StatusMessage | EventMessage | ErrorMessage | AckMessage | ContentScriptReadyMessage;