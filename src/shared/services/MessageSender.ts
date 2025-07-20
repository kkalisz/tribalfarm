import {BaseMessage, Message} from "@src/shared/actions/content/core/types";

/**
 * Interface for sending messages with generic response type
 */
export interface MessageSender {
  /**
   * Sends a message and returns a Promise with the response
   * @param message The message to send
   * @returns A Promise that resolves with the response
   */
  send<T = any>(message: BaseMessage | Message): Promise<T>;

  sendMessage(message: Message): void;

}

/**
 * Response interface for message operations
 */
export interface MessageResponse {
  success: boolean;
  value?: any;
  error?: string;
}

/**
 * Implementation of MessageSender for Chrome runtime messaging
 */
export class ChromeRuntimeMessageSender implements MessageSender {
  sendMessage(message: BaseMessage): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    chrome.runtime.sendMessage(message);
  }
  /**
   * Sends a message using chrome.runtime.sendMessage and returns a Promise with the response
   * @param message The message to send
   * @returns A Promise that resolves with the response
   */
  send<T = any>(message: BaseMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response: MessageResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response?.success) {
          reject(new Error(response?.error ?? 'Unknown error during message sending'));
        } else {
          resolve(response.value as T);
        }
      });
    });
  }
}