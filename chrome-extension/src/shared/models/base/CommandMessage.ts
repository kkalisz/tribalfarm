import { BaseMessage } from './BaseMessage';
import {EventPayload} from "@src/shared/models/base/EventMessage";

export interface CommandPayload<T extends EventPayload = EventPayload>  {
  action: string;
  parameters: Record<string, any>;
}

export interface CommandMessage<T extends CommandPayload = CommandPayload> extends BaseMessage {
  type: 'command';
  payload: T;
}

