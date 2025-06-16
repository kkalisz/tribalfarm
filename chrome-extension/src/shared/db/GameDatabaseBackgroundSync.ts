import { IDBPDatabase } from 'idb';
import {DBSyncRequest, DBSyncResponse} from "@src/shared/db/GameDatabaseClientSync";

export class GameDatabaseBackgroundSync {

  constructor(
    private database: IDBPDatabase,
    private fullDomain: string,
  ) {
    // Listener is synchronous but calls async handler internally
    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        this.onMessage(message, sender, sendResponse);
        return true; // important: keep message channel open for async response
      }
    );
  }

  private async onMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (resp: DBSyncResponse) => void
  ) {
    const msg = message as DBSyncRequest;
    if (msg.type !== 'db_sync' || msg.fullDomain !== this.fullDomain) return false;

    try {
      let value: any;
      const s = msg.store;
      switch (msg.operation) {
        case 'get':
          value = await this.database.get(s, msg.key!); break;
        case 'put':
          value = await this.database.put(s, msg.value, msg.key); break;
        case 'delete':
          await this.database.delete(s, msg.key!); value = undefined; break;
        case 'getAll':
          value = await this.database.getAll(s, msg.key!, msg.count); break;
        case 'add':
          value = await this.database.add(s, msg.value, msg.key); break;
        case 'clear':
          await this.database.clear(s); value = undefined; break;
        case 'count':
          value = await this.database.count(s, msg.key!); break;
        case 'getKey':
          value = await this.database.getKey(s, msg.key!); break;
        case 'getFromIndex':
          value = await this.database.getFromIndex(s, msg.index!, msg.key!); break;
        case 'getAllFromIndex':
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
