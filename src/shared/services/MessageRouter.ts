type MessageHandler = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void | boolean | Promise<void | any>;

export class MessageRouter {
  private handlers = new Map<string, MessageHandler>();

  constructor() {
    chrome.runtime.onMessage.addListener(
      (message: any, sender, sendResponse) => {
        if (!message || typeof message.type !== 'string') {
          console.warn('Invalid message format. Expected message.type to be a string.', message);
          return false;
        }

        const handler = this.handlers.get(message.type);
        if (!handler) {
          console.warn(`No handler registered for action "${message.type}"`);
          return false;
        }

        try {
          const result = handler(message, sender, sendResponse);
          // Handle both async and sync handlers
          if (result instanceof Promise) {
            result.then((resolved) => {
              if (resolved !== undefined) {
                sendResponse(resolved);
              }
            }).catch((err) => {
              console.error(`Error in handler for type "${message.type}":`, err);
              sendResponse({ error: err?.message ?? 'Unknown error' });
            });
            return true; // Indicates async response
          }
          return result === true; // Allow returning true manually for async
        } catch (err: any) {
          console.error(`Exception in handler for type "${message.type}":`, err);
          sendResponse({ error: err?.message ?? 'Unknown error' });
          return false;
        }
      }
    );
  }

  addListener(type: string, handler: MessageHandler): void {
    if (this.handlers.has(type)) {
      console.warn(`Overwriting existing handler for type "${type}"`);
    }
    this.handlers.set(type, handler);
  }

  removeListener(type: string): void {
    this.handlers.delete(type);
  }
}
