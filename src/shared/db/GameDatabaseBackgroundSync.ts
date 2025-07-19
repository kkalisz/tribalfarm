import { IDBPDatabase } from 'idb';
import {DBSyncRequest, DBSyncResponse} from "@src/shared/db/GameDatabaseClientSync";

export class GameDatabaseBackgroundSync<T> {
  private messageListener: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    sender: chrome.runtime.MessageSender,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendResponse: (response: any) => void
  ) => boolean;


  constructor(
    private database: IDBPDatabase<T>,
    private fullDomain: string,
  ) {
    this.messageListener = (message, sender, sendResponse) => {
      this.onMessage(message, sender, sendResponse);
      const messageResponse = !(message.type !== 'db_sync' || message.fullDomain !== this.fullDomain);
      console.log(`messageResponse ${messageResponse} ${message.type} -> ${JSON.stringify(message)}`, );
      return messageResponse;


    };

    this.attachListener();
  }

  /**
   * Attaches the message listener to chrome.runtime.onMessage
   */
  public attachListener(): void {
    chrome.runtime.onMessage.addListener(this.messageListener);
  }

  /**
   * Detaches the message listener from chrome.runtime.onMessage
   */
  public detachListener(): void {
    chrome.runtime.onMessage.removeListener(this.messageListener);
  }

  private async onMessage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (resp: DBSyncResponse) => void
  ) {
    const msg = message as DBSyncRequest;
    if (msg.type !== 'db_sync' || msg.fullDomain !== this.fullDomain) return false;

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
          value = await this.database.getAll(s, msg.key!, msg.count); break;
        case 'add':
          // @ts-expect-error types
          value = await this.database.add(s, msg.value, msg.key); break;
        case 'clear':
          // @ts-expect-error types
          await this.database.clear(s); value = undefined; break;
        case 'count':
          // @ts-expect-error types
          value = await this.database.count(s, msg.key!); break;
        case 'getKey':
          // @ts-expect-error types
          value = await this.database.getKey(s, msg.key!); break;
        case 'getFromIndex':
          // @ts-expect-error types
          value = await this.database.getFromIndex(s, msg.index!, msg.key!); break;
        case 'getAllFromIndex':
          // @ts-expect-error types
          value = await this.database.getAllFromIndex(s, msg.index!, msg.key!, msg.count); break;
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
