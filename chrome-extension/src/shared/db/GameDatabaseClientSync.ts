export interface DBSyncRequest {
  type: 'db_sync';
  fullDomain: string;
  operation:
    | 'get' | 'put' | 'delete' | 'getAll'
    | 'add' | 'clear' | 'count' | 'getKey'
    | 'getFromIndex' | 'getAllFromIndex';
  store: string;
  key?: IDBValidKey | IDBKeyRange;
  index?: string;
  value?: any;
  count?: number;
}

export interface DBSyncResponse {
  success: boolean;
  value?: any;
  error?: string;
}

export class GameDatabaseClientSync {
  constructor(private fullDomain: string) {
  }

  private sendMessage<T = any>(payload: DBSyncRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload, (response: DBSyncResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response || !response.success) {
          reject(new Error(response?.error || 'Unknown error'));
        } else {
          resolve(response.value as T);
        }
      });
    });
  }

  get<T = any>(store: string, key: IDBValidKey): Promise<T> {
    return this.sendMessage<T>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      operation: 'get',
      store,
      key,
    });
  }

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
  getAll<T = any>(store: string, key?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]> {
    return this.sendMessage<T[]>({
      type: 'db_sync',
      fullDomain: this.fullDomain,
      operation: 'getAll',
      store,
      count
    });
  }

  add(store: string, value: any, key?: IDBValidKey): Promise<any> {
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

  getKey(store: string, key: IDBValidKey | IDBKeyRange): Promise<any> {
    return this.sendMessage<any>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'getKey', store, key
    });
  }

  getFromIndex(store: string, index: string, key: IDBValidKey | IDBKeyRange): Promise<any> {
    return this.sendMessage<any>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'getFromIndex', store, index, key
    });
  }

  getAllFromIndex(store: string, index: string, key?: IDBValidKey | IDBKeyRange, count?: number): Promise<any[]> {
    return this.sendMessage<any[]>({
      type: 'db_sync',
      fullDomain: this.fullDomain, operation: 'getAllFromIndex', store, index, key, count
    });
  }
}
