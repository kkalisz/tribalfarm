import type {
  IDBPDatabase,
  StoreNames,
  StoreKey,
  StoreValue, IndexNames, IndexKey
} from 'idb';
import {GameDatabaseClientSync} from "@src/shared/db/GameDatabaseClientSync";

export class ProxyIDBPDatabase<DBTypes> implements IDBPDatabase<DBTypes> {
  readonly name = 'proxy-database';
  readonly version = 1;

  constructor(private client: GameDatabaseClientSync) {}

  get<N extends StoreNames<DBTypes>>(s: N, k: StoreKey<DBTypes,N>) { return this.client.get(s as string, k); }
  put<N extends StoreNames<DBTypes>>(s: N, v: StoreValue<DBTypes,N>, k?: StoreKey<DBTypes,N>) {
    return this.client.put(s as string, k, v).then(() => k!);
  }
  delete<N extends StoreNames<DBTypes>>(s: N, k: StoreKey<DBTypes,N>) { return this.client.delete(s as string, k); }
  getAll<N extends StoreNames<DBTypes>>(s: N, q?: StoreKey<DBTypes,N>, c?: number) {
    return this.client.getAll(s as string, q!, c);
  }

  add<N extends StoreNames<DBTypes>>(s: N, v: StoreValue<DBTypes,N>, k?: StoreKey<DBTypes,N>) {
    return this.client.add(s as string, v, k);
  }

  clear<N extends StoreNames<DBTypes>>(s: N) { return this.client.clear(s as string); }
  count<N extends StoreNames<DBTypes>>(s: N, k?: StoreKey<DBTypes,N>) {
    return this.client.count(s as string, k!);
  }
  getKey<N extends StoreNames<DBTypes>>(s: N, k: StoreKey<DBTypes,N>) {
    return this.client.getKey(s as string, k);
  }
  getFromIndex<N extends StoreNames<DBTypes>, I extends IndexNames<DBTypes,N>>(s: N, i: I, k: IndexKey<DBTypes,N,I>) {
    return this.client.getFromIndex(s as string, i as string, k);
  }
  getAllFromIndex<N extends StoreNames<DBTypes>, I extends IndexNames<DBTypes,N>>(s: N, i: I, k?: IndexKey<DBTypes,N,I>, c?: number) {
    return this.client.getAllFromIndex(s as string, i as string, k!, c);
  }

  // No-op or unsupported schema methods
  countFromIndex = this.getAllFromIndex as any;
  clearStore = this.clear as any;

  transaction(): never { throw new Error('transact not implemented'); }
  createObjectStore(): never { throw new Error('createObjectStore not supported'); }
  deleteObjectStore(): never { throw new Error('deleteObjectStore not supported'); }
  close(): void { /* no action */ }
}
