import { IDBPDatabase } from 'idb';
import { MessageResponse } from "@src/shared/services/MessageSender";
import {DbSyncMessage} from "@src/shared/actions/content/core/types";

export class GameDatabaseBackgroundSync<T> {
  public onDatabaseMessage: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: DbSyncMessage,
    sender: chrome.runtime.MessageSender,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendResponse: (response: any) => void
  ) => void;


  constructor(
    private readonly database: IDBPDatabase<T>,
    private readonly fullDomain: string
  ) {
    this.onDatabaseMessage = (message, sender, sendResponse) => {
      this.onMessage(message, sendResponse);
      const messageResponse = !(message.type !== 'db_sync' || message.fullDomain !== this.fullDomain);
      console.log(`messageResponse ${messageResponse} ${message.type} -> ${JSON.stringify(message)}`, );
      return messageResponse;
    };
  }

  private async onMessage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: DbSyncMessage,
    sendResponse: (resp: MessageResponse) => void
  ) {
    if (message.type !== 'db_sync' || message.fullDomain !== this.fullDomain) return false;

    const msg = message.payload

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any;
      const s = msg.store;
      switch (msg.operation) {
        case 'get':
          // @ts-expect-error types
          value = await this.database.get(s, msg.key!); break;
        case 'put':
          // @ts-expect-error types
          value = await this.database.put(s, msg.value, msg.key); break;
        case 'delete':
          // @ts-expect-error types
          await this.database.delete(s, msg.key!); value = undefined; break;
        case 'getAll':
          // @ts-expect-error types
          value = await this.database.getAll(s, msg.key, msg.count); break;
        case 'add':
          // @ts-expect-error types
          value = await this.database.add(s, msg.value, msg.key); break;
        case 'clear':
          // @ts-expect-error types
          await this.database.clear(s); value = undefined; break;
        case 'count':
          // @ts-expect-error types
          value = await this.database.count(s, msg.key); break;
        case 'getKey':
          // @ts-expect-error types
          value = await this.database.getKey(s, msg.key!); break;
        case 'getFromIndex':
          // @ts-expect-error types
          value = await this.database.getFromIndex(s, msg.index!, msg.key!); break;
        case 'getAllFromIndex':
          // @ts-expect-error types
          value = await this.database.getAllFromIndex(s, msg.index!, msg.key, msg.count); break;
        default:
          throw new Error(`Unsupported operation: ${msg.operation}`);
      }
      sendResponse({ success: true, value });
    } catch (err) {
      sendResponse({ success: false, error: (err as Error).message });
    }
    return true;
  }
}
