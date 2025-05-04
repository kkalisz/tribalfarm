export * from './BaseMessage';
export * from './CommandMessage';
export * from './StatusMessage';
export * from './EventMessage';
export * from './ErrorMessage';
export * from './AckMessage';

export type Message = 
  | import('./CommandMessage').CommandMessage
  | import('./StatusMessage').StatusMessage
  | import('./EventMessage').EventMessage
  | import('./ErrorMessage').ErrorMessage
  | import('./AckMessage').AckMessage;