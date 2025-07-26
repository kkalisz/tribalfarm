import {BaseMessage} from '@src/shared/actions/content/core/types';

export type MessageHandler<T> = (
  message: T,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => boolean;
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
export class MessageRouter {
  private readonly handlers = new Map<string, MessageHandler<any>>();
  private readonly propertyName: string;
  private readonly onMissingHandler?: (router: MessageRouter, value: string) => MessageHandler<any> | undefined;

  /**
   * Creates a new MessageRouter instance.
   * 
   * @param propertyName The name of the property to filter messages by (default: 'type')
   * @param onMissingHandler Optional callback that will be invoked when a handler is missing.
   *                         If it returns a handler, that handler will be added to the handlers map
   *                         and the invocation will continue.
   */
  constructor(
    propertyName: string = 'type', 
    onMissingHandler?: (router: MessageRouter, value: string) => MessageHandler<any> | undefined,
    isNested?: boolean
  ) {
    this.onMissingHandler = onMissingHandler;
    this.propertyName = propertyName;
    if(isNested){
      return
    }
    console.log(`root register`)
    chrome.runtime.onMessage.addListener(
      (message: any, sender, sendResponse) => {

        console.log(`root message received with ${message.fullDomain} ${message.type}`)
        if (!message || typeof message[this.propertyName] !== 'string') {
          console.warn(`Invalid message format. Expected message.${this.propertyName} to be a string.`, message);
          return false;
        }

        let handler = this.handlers.get(message[this.propertyName]);
        
        // Cast the message to BaseMessage since we know it has the required property
        const typedMessage = message as BaseMessage;
        
        if (!handler && this.onMissingHandler) {
          // Try to create a handler using onMissingHandler
          const newHandler = this.onMissingHandler(this,message[this.propertyName]);
          if (newHandler) {
            // Add the new handler to the map
            this.handlers.set(message[this.propertyName], newHandler);
            handler = newHandler;
          }
        }
        
        if (!handler) {
          console.warn(`No handler registered for ${this.propertyName} "${message[this.propertyName]}"`);
          return false;
        }

        try {
          // Handle both async and sync handlers
          return handler(typedMessage, sender, sendResponse)
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
   * Processes messages received by this router.
   * This method follows the MessageHandler.call signature to maintain compatibility.
   * It is called by the inline handler created in createNestedRouter.
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

    let handler = this.handlers.get(keyValue);

    if (!handler && this.onMissingHandler) {
      // Try to create a handler using onMissingHandler
      const newHandler = this.onMissingHandler(this,keyValue);
      if (newHandler) {
        // Add the new handler to the map
        this.handlers.set(keyValue, newHandler);
        handler = newHandler;
      }
    }

    if (!handler) {
      console.warn(`No handler registered in nested handler for ${this.propertyName} "${keyValue}"`);
      return false;
    }

    try {
      return handler(message, sender, sendResponse);
    } catch (err: any) {
      sendResponse({ error: err?.message ?? 'Unknown error' });
      return false;
    }
  }

  /**
   * Creates a nested router for handling messages with a specific property value.
   * The nested router inherits the onMissingHandler from the parent router.
   * 
   * @param propertyValue The value of the property to filter messages by
   * @param propertyType The name of the property to filter messages by in the nested router
   * @returns A new MessageRouter instance
   */
  createNestedRouter(propertyValue: string, propertyType: string): MessageRouter {
    const nestedRouter = new MessageRouter(propertyType, undefined, true);
    
    // Create an inline handler that directly calls the nested router's call method
    const listener =(message: BaseMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean => {
      return nestedRouter.call(message, sender, sendResponse);
    }
    this.addListener(propertyValue, listener)

    return nestedRouter;
  }
}
