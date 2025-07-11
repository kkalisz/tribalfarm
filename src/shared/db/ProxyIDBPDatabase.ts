import type {
  IDBPDatabase,
  StoreNames,
  StoreKey,
  StoreValue, IndexNames, IndexKey
} from 'idb';
import {GameDatabaseClientSync} from "@src/shared/db/GameDatabaseClientSync";

export class ProxyIDBPDatabase<DBTypes> implements IDBPDatabase<DBTypes> {
  readonly name = 'proxy-database';

  // @ts-expect-error any
  readonly objectStoreNames: DOMStringList = {
    contains: () => false,
    item: () => null,
    length: 0,
    // @ts-expect-error any
    [Symbol.iterator]: function* () {},
  };
  readonly version = 1;

  constructor(private client: GameDatabaseClientSync) {}

  get<N extends StoreNames<DBTypes>>(s: N, k: StoreKey<DBTypes,N>) {
    // @ts-expect-error any
    return this.client.get(s as string, k);
  }
  put<N extends StoreNames<DBTypes>>(s: N, v: StoreValue<DBTypes,N>, k?: StoreKey<DBTypes,N>) {
    // @ts-expect-error any
    return this.client.put(s as string, k, v).then(() => k!);
  }
  delete<N extends StoreNames<DBTypes>>(s: N, k: StoreKey<DBTypes,N>) {
    // @ts-expect-error any
    return this.client.delete(s as string, k);
  }
  getAll<N extends StoreNames<DBTypes>>(s: N, q?: StoreKey<DBTypes,N>, c?: number) {
    return this.client.getAll(s as string, q!, c);
  }

  add<N extends StoreNames<DBTypes>>(s: N, v: StoreValue<DBTypes,N>, k?: StoreKey<DBTypes,N>) {
    // @ts-expect-error any
    return this.client.add(s as string, v, k);
  }

  clear<N extends StoreNames<DBTypes>>(s: N) { return this.client.clear(s as string); }
  count<N extends StoreNames<DBTypes>>(s: N, k?: StoreKey<DBTypes,N>) {
    return this.client.count(s as string, k!);
  }

  getKey<N extends StoreNames<DBTypes>>(s: N, k: StoreKey<DBTypes, N>) {
    // @ts-expect-error any
    return this.client.getKey(s as string, k);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAllKeys<N extends StoreNames<DBTypes>>(s: N, q?: StoreKey<DBTypes, N>, c?: number) {
    return Promise.resolve([]);
  }


  getAllKeysFromIndex<N extends StoreNames<DBTypes>, I extends IndexNames<DBTypes, N>>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    s: N,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    i: I,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    q?: IndexKey<DBTypes, N, I>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    c?: number,
  ) {
    return Promise.resolve([]);
  }

  getKeyFromIndex<N extends StoreNames<DBTypes>, I extends IndexNames<DBTypes, N>>(
    s: N,
    i: I,
    k: IndexKey<DBTypes, N, I>,
  ) {
    // @ts-expect-error any
    return this.client.getKey(s as string, k);
  }
  getFromIndex<N extends StoreNames<DBTypes>, I extends IndexNames<DBTypes,N>>(s: N, i: I, k: IndexKey<DBTypes,N,I>) {
    // @ts-expect-error any
    return this.client.getFromIndex(s as string, i as string, k);
  }
  getAllFromIndex<N extends StoreNames<DBTypes>, I extends IndexNames<DBTypes,N>>(s: N, i: I, k?: IndexKey<DBTypes,N,I>, c?: number) {
    return this.client.getAllFromIndex(s as string, i as string, k!, c);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countFromIndex = this.getAllFromIndex as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clearStore = this.clear as any;

  transaction(): never { throw new Error('transact not implemented'); }
  createObjectStore(): never { throw new Error('createObjectStore not supported'); }
  deleteObjectStore(): never { throw new Error('deleteObjectStore not supported'); }
  close(): void { /* no action */ }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onabort: ((ev: Event) => any) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((ev: Event) => any) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onclose: ((ev: Event) => any) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onversionchange: ((ev: Event) => any) | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addEventListener<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {
    // This is a proxy implementation, so we don't have a real IDBDatabase instance to add listeners to
    // In a real implementation, this would delegate to the underlying IDBDatabase instance
    console.warn('addEventListener called on ProxyIDBPDatabase, but no real IDBDatabase instance exists');
  }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
  //   // This is a proxy implementation, so we don't have a real IDBDatabase instance to add listeners to
  //   // In a real implementation, this would delegate to the underlying IDBDatabase instance
  //   console.warn('addEventListener called on ProxyIDBPDatabase, but no real IDBDatabase instance exists');
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeEventListener<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, options?: boolean | EventListenerOptions): void {
    // This is a proxy implementation, so we don't have a real IDBDatabase instance to remove listeners from
    // In a real implementation, this would delegate to the underlying IDBDatabase instance
    console.warn('removeEventListener called on ProxyIDBPDatabase, but no real IDBDatabase instance exists');
  }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
  //   // This is a proxy implementation, so we don't have a real IDBDatabase instance to remove listeners from
  //   // In a real implementation, this would delegate to the underlying IDBDatabase instance
  //   console.warn('removeEventListener called on ProxyIDBPDatabase, but no real IDBDatabase instance exists');
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchEvent(event: Event): boolean{
    return true;
  }

}
