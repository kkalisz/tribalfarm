export interface DBSyncRequest {
  type: 'db_sync';
  fullDomain: string;
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

export interface DBSyncResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  error?: string;
}

export class GameDatabaseClientSync {
  constructor(private fullDomain: string) {

  }

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'db_init',
        fullDomain: this.fullDomain,
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message+ " db_init"));
        } else if (!response?.success) {
          reject(new Error(response?.error ?? 'Unknown error during db_init'));
        } else {
          resolve();
        }
      });
    });
  }



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendMessage<T = any>(payload: DBSyncRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload, (response: DBSyncResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message + ` ${payload.operation} -> ${payload.store}`));
        } else if (!response?.success) {
          reject(new Error(response?.error ?? `Unknown error during ${payload.operation} -> ${payload.store}`));
        } else {
          resolve(response.value as T);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T = any>(store: string, key: IDBValidKey): Promise<T> {
    return this.sendMessage<T>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      operation: 'get',
      store,
      key,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put(store: string, key: IDBValidKey | undefined, value: any): Promise<void> {
    return this.sendMessage<void>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      operation: 'put',
      store,
      key,
      value,
    });
  }

  delete(store: string, key: IDBValidKey): Promise<void> {
    return this.sendMessage<void>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      operation: 'delete',
      store,
      key,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll<T = any>(store: string, key?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]> {
    return this.sendMessage<T[]>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      operation: 'getAll',
      store,
      count
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add(store: string, value: any, key?: IDBValidKey): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'add', store, value, key
    });
  }

  clear(store: string): Promise<void> {
    return this.sendMessage<void>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'clear', store
    });
  }

  count(store: string, key?: IDBValidKey | IDBKeyRange): Promise<number> {
    return this.sendMessage<number>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'count', store, key
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getKey(store: string, key: IDBValidKey | IDBKeyRange): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'getKey', store, key
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFromIndex(store: string, index: string, key: IDBValidKey | IDBKeyRange): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'getFromIndex', store, index, key
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllFromIndex(store: string, index: string, key?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.sendMessage<any[]>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'getAllFromIndex', store, index, key, count
    });
  }
}

