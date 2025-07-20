import {BaseMessage} from '@src/shared/actions/content/core/types';

/**
 * An interface for a handler that processes messages received by a MessageRouter.
 * 
 * @template T The type of message to handle (must extend BaseMessage)
 */
export interface MessageHandler<T extends BaseMessage = BaseMessage> {
  /**
   * Process a message and optionally send a response.
   * 
   * @param message The message to handle
   * @param sender Information about the sender of the message
   * @param sendResponse A function to call with the response to the message
   * @returns A boolean indicating whether the response will be sent asynchronously,
   *          or a Promise that resolves to the response, or void if no response is needed
   */
  call(message: T, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean;
}

/**
 * MessageRouter is a class that routes messages to handlers based on a property value.
 * It can be used to create a tree-like structure of message routers, where each router
 * handles a specific type of message and can delegate to child routers for more specific handling.
 * 
 * Example usage:
 * ```typescript
 * // Create a root router that filters by 'type'
 * const rootRouter = new MessageRouter();
 * 
 * // Create a nested router for 'command' messages
 * const commandRouter = rootRouter.createNestedRouter('command');
 * 
 * // Register handlers for different command types
 * commandRouter.addListener('navigate', navigateHandler);
 * commandRouter.addListener('click', clickHandler);
 * ```
 */
export class MessageRouter implements MessageHandler<BaseMessage> {
  private readonly handlers = new Map<string, MessageHandler<any>>();
  private readonly propertyName: string;

  /**
   * Creates a new MessageRouter instance.
   * 
   * @param propertyName The name of the property to filter messages by (default: 'type')
   */
  constructor(propertyName: string = 'type') {
    this.propertyName = propertyName;
    chrome.runtime.onMessage.addListener(
      (message: any, sender, sendResponse) => {
        if (!message || typeof message[this.propertyName] !== 'string') {
          console.warn(`Invalid message format. Expected message.${this.propertyName} to be a string.`, message);
          return false;
        }

        const handler = this.handlers.get(message[this.propertyName]);
        if (!handler) {
          console.warn(`No handler registered for ${this.propertyName} "${message[this.propertyName]}"`);
          return false;
        }

        try {
          // Cast the message to BaseMessage since we know it has the required property
          const typedMessage = message as BaseMessage;
          // Handle both async and sync handlers
          return handler.call(typedMessage, sender, sendResponse)
        } catch (err: any) {
          console.error(`Exception in handler for ${this.propertyName} "${message[this.propertyName]}":`, err);
          sendResponse({ error: err?.message ?? 'Unknown error' });
          return false;
        }
      }
    );
  }

  /**
   * Registers a handler for messages with a specific property value.
   * 
   * @param value The value of the property to filter messages by
   * @param handler The handler function to call when a matching message is received
   */
  addListener<T extends BaseMessage>(value: string, handler: MessageHandler<T>): void {
    if (this.handlers.has(value)) {
      console.warn(`Overwriting existing handler for ${this.propertyName} "${value}"`);
    }
    this.handlers.set(value, handler);
  }

  /**
   * Removes a handler for messages with a specific property value.
   * 
   * @param value The value of the property that the handler was registered for
   */
  removeListener(value: string): void {
    this.handlers.delete(value);
  }

  /**
   * Implements the MessageHandler interface to allow MessageRouter to be used as a handler.
   * This method is called when a message is received by a parent router and routed to this router.
   * 
   * @param message The message to handle
   * @param sender Information about the sender of the message
   * @param sendResponse A function to call with the response to the message
   * @returns A boolean indicating whether the response will be sent asynchronously,
   *          or a Promise that resolves to the response, or void if no response is needed
   */
  call(message: BaseMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean {

    const messageRaw = message as Record<string, any>;

    if (!message || typeof messageRaw[this.propertyName] !== 'string') {
      console.warn(`Invalid message format in nested handler. Expected message.${this.propertyName} to be a string.`, message);
      return false;
    }

    const keyValue = messageRaw[this.propertyName];

    const handler = this.handlers.get(keyValue);
    if (!handler) {
      console.warn(`No handler registered in nested handler for ${this.propertyName} "${keyValue}"`);
      return false;
    }

    try {
      return handler.call(message, sender, sendResponse);
    } catch (err: any) {
      console.error(`Exception in nested handler for ${this.propertyName} "${keyValue}":`, err);
      sendResponse({ error: err?.message ?? 'Unknown error' });
      return false;
    }
  }

  createNestedRouter(propertyValue: string): MessageRouter {
    const nestedRouter = new MessageRouter(this.propertyName);
    this.addListener(propertyValue, nestedRouter);
    return nestedRouter;
  }
}
