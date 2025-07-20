import {MessageSender, ChromeRuntimeMessageSender, MessageResponse} from "@src/shared/services/MessageSender";

export interface DBSyncPayload {
  operation:
    | 'get' | 'put' | 'delete' | 'getAll'
    | 'add' | 'clear' | 'count' | 'getKey'
    | 'getFromIndex' | 'getAllFromIndex' ;
  store: string;
  key?: IDBValidKey | IDBKeyRange;
  index?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  count?: number;
}

// Using MessageResponse from MessageSender.ts
export type DBSyncResponse = MessageResponse;

export class GameDatabaseClientSync {
  private readonly messageSender: MessageSender;

  constructor(
    private readonly fullDomain: string,
    messageSender?: MessageSender
  ) {
    this.messageSender = messageSender || new ChromeRuntimeMessageSender();
  }

  public init(): Promise<void> {
    return this.messageSender.send({
      type: 'db_init',
      fullDomain: this.fullDomain,
      actionId: "",
      timestamp: Date()
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendMessage<T = any>(payload: DBSyncPayload): Promise<T> {
    return this.messageSender.send<T>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      payload: payload,
      actionId: "",
      timestamp: Date()
    });
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T = any>(store: string, key: IDBValidKey): Promise<T> {
    return this.sendMessage<T>({
      operation: 'get',
      store,
      key,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put(store: string, key: IDBValidKey | undefined, value: any): Promise<void> {
    return this.sendMessage<void>({
      operation: 'put',
      store,
      key,
      value,
    });
  }

  delete(store: string, key: IDBValidKey): Promise<void> {
    return this.sendMessage<void>({
      operation: 'delete',
      store,
      key,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll<T = any>(store: string, key?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]> {
    return this.sendMessage<T[]>({
      operation: 'getAll',
      store,
      count
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add(store: string, value: any, key?: IDBValidKey): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any>({
      operation: 'add', store, value, key
    });
  }

  clear(store: string): Promise<void> {
    return this.sendMessage<void>({
      operation: 'clear', store
    });
  }

  count(store: string, key?: IDBValidKey | IDBKeyRange): Promise<number> {
    return this.sendMessage<number>({
      operation: 'count', store, key
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getKey(store: string, key: IDBValidKey | IDBKeyRange): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any>({
      operation: 'getKey', store, key
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFromIndex(store: string, index: string, key: IDBValidKey | IDBKeyRange): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any>({
      operation: 'getFromIndex', store, index, key
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllFromIndex(store: string, index: string, key?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any[]>({
      operation: 'getAllFromIndex', store, index, key, count
    });
  }
}
