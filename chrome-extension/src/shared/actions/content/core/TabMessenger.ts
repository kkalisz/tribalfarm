import {v4 as uuidv4} from 'uuid';
import {BasePageAction, BasePageResponse, CommandMessage, GenericStatusPayload, Message} from '@src/shared/actions/content/core/types';
import {logInfo} from "@src/shared/helpers/sendLog";
import {PAGE_STATUS_ACTION, PageStatusAction, PageStatusResponse} from "@src/shared/actions/content/pageStatus/PageStatusAction";
import {NAVIGATE_TO_PAGE_ACTION, NavigateToPageAction, NavigateToPageActionResponse} from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";

interface PendingRequest {
  resolve: (value: Record<string, unknown>) => void;
  reject: (reason: Error | Record<string, unknown>) => void;
  actionId: string;
  timeout: ReturnType<typeof setTimeout>;
}

interface WaitCondition {
  type: 'status' | 'event' | 'error';
  actionId?: string;
  predicate: (message: Message) => boolean;
  resolve: (value: Record<string, unknown>) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
}



/**
 * TabMessenger provides a reliable way to communicate with a specific tab,
 * even across page reloads.
 */
export class TabMessenger {
  private tabId: number;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private waitConditions: WaitCondition[] = [];
  // @ts-expect-error we are defining it in setupMessageListener
  private messageListener: (message: Message, sender: chrome.runtime.MessageSender) => void;
  private isListening: boolean = false;

  /**
   * Creates a new TabMessenger for a specific tab
   * @param tabId The ID of the tab to communicate with
   */
  constructor(tabId: number) {
    this.tabId = tabId;
    this.setupMessageListener();
  }

  /**
   * Returns the ID of the tab this messenger is communicating with
   */
  getTabId(): number {
    return this.tabId;
  }

  /**
   * Sets up the message listener for this tab
   */
  private setupMessageListener() {

    if (this.isListening) return;

    this.messageListener = (message: Message, sender: chrome.runtime.MessageSender) => {
      // Only process messages from our tab
      if (sender.tab?.id !== this.tabId) return;

      logInfo(`TabMessenger received message from tab ${this.tabId}:`, JSON.stringify(message));

      // Handle responses to pending requests
      if ((message.type === 'status' || message.type === 'error') && message.actionId) {
        const pendingRequest = this.pendingRequests.get(message.actionId);
        if (pendingRequest) {
          if (message.type === 'status' && message.payload.status === 'done') {
            pendingRequest.resolve(message.payload);
            this.pendingRequests.delete(message.actionId);
            clearTimeout(pendingRequest.timeout);
          } else if (message.type === 'error') {
            pendingRequest.reject(message.payload);
            this.pendingRequests.delete(message.actionId);
            clearTimeout(pendingRequest.timeout);
          }
        }
      }

      // Check wait conditions
      for (let i = this.waitConditions.length - 1; i >= 0; i--) {
        const condition = this.waitConditions[i];

        //const a: EventMessage = message;
        //a.payload.

        // Skip if message type doesn't match what we're waiting for
        if (message.type !== condition.type) continue;

        // Skip if we're waiting for a specific actionId and it doesn't match
        if (condition.actionId && message.actionId !== condition.actionId) continue;

        // Check if the predicate is satisfied
        if (condition.predicate(message)) {
          condition.resolve(message.payload);
          clearTimeout(condition.timeout);
          this.waitConditions.splice(i, 1);
        }
      }
    };

    chrome.runtime.onMessage.addListener(this.messageListener);
    this.isListening = true;
  }

  /**
   * Sends a command to the tab and returns a promise that resolves when the command completes
   * @param action The action to perform
   * @param parameters The parameters for the action
   * @param timeoutMs Timeout in milliseconds
   * @returns A promise that resolves with the command result
   */
  async send(action: string, parameters: Record<string, unknown>, timeoutMs: number = 30000): Promise<Record<string, unknown>> {
    const actionId = uuidv4();
    const command: CommandMessage = {
      type: 'command',
      actionId,
      timestamp: new Date().toISOString(),
      payload: {
        action,
        parameters
      }
    };

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(actionId);
        reject(new Error(`Command timed out after ${timeoutMs}ms: ${action}`));
      }, timeoutMs);

      // Store the pending request
      this.pendingRequests.set(actionId, {
        resolve,
        reject,
        actionId,
        timeout: timeout,
      });

      // Send the command
      logInfo(`TabMessenger sending command to tab ${this.tabId}:`, command);
      chrome.tabs.sendMessage(this.tabId, command)
        .catch(error => {
          this.pendingRequests.delete(actionId);
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  async sendCommand<RESPONSE extends BasePageResponse, BA extends BasePageAction<RESPONSE>>(
    actionName: string,
    action: BA
  ): Promise<GenericStatusPayload<RESPONSE>> {
    const result = await this.send(actionName, action as Record<string, any>);
    console.log(`send command result: ${JSON.stringify(result)}`)
    return result as unknown as GenericStatusPayload<RESPONSE>;
  }

  async executePageStatusAction(parameters: PageStatusAction): Promise<GenericStatusPayload<PageStatusResponse>> {
    return await this.sendCommand<PageStatusResponse, PageStatusAction>(PAGE_STATUS_ACTION, parameters);
  }

  async executeNavigateToPageAction(parameters: NavigateToPageAction): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {
    return await this.sendCommand<NavigateToPageActionResponse, NavigateToPageAction>(NAVIGATE_TO_PAGE_ACTION, parameters);
  }

  // async sendCommand<T extends CommandPayload>(command: T): Promise<ExtractEventPayload<T>>
  // {
  //   const result = await this.send(command.action, command.parameters);
  //   return result as unknown as ExtractEventPayload<T>;
  // }
  //
  //
  //
  // async sendCommand2<T extends CommandPayload>(command: T): Promise<ExtractEventPayload<T>>
  // {
  //   const result = await this.send(command.action, command.parameters);
  //   return result as unknown as ExtractEventPayload<T>;
  // }
  //
  // async sendAction<T extends BaseAction>(actionName: string, command: T): Promise<ExtractBaseActionPayload<T>>
  // {
  //   const result = await this.send(actionName, command as unknown as Record<string, unknown>);
  //   return result as unknown as ExtractBaseActionPayload<T>;
  // }
  //
  // async sendAction2<T extends BaseAction>(actionName: string, action: T): Promise<ExtractBaseActionPayload<T>>
  // {
  //   const result = await this.send(actionName, action as unknown as Record<string, unknown>);
  //   return result as unknown as ExtractBaseActionPayload<T>;
  // }
  //
  // async getCurrentUrlAction(action: PageStatusAction): Promise<PageStatusResponse>{
  //   return this.sendAction("pageStatus", action);
  // }

  /**
   * Waits for a specific condition to be met in messages from the tab
   * @param type The type of message to wait for
   * @param predicate A function that returns true when the condition is met
   * @param timeoutMs Timeout in milliseconds
   * @param actionId Optional actionId to filter messages by
   * @returns A promise that resolves when the condition is met
   */
  async waitFor(
    type: 'status' | 'event' | 'error',
    predicate: (message: Message) => boolean,
    timeoutMs: number = 30000,
    actionId?: string
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        const index = this.waitConditions.findIndex(c => c.resolve === resolve);
        if (index !== -1) {
          this.waitConditions.splice(index, 1);
        }
        reject(new Error(`Wait condition timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      // Add the wait condition
      this.waitConditions.push({
        type,
        actionId,
        predicate,
        resolve,
        reject,
        timeout
      });
    });
  }

  /**
   * Cleans up resources used by this TabMessenger
   */
  dispose() {
    if (this.isListening) {
      chrome.runtime.onMessage.removeListener(this.messageListener);
      this.isListening = false;
    }

    // Clear all pending requests
    for (const request of this.pendingRequests.values()) {
      clearTimeout(request.timeout);
      request.reject(new Error('TabMessenger disposed'));
    }
    this.pendingRequests.clear();

    // Clear all wait conditions
    for (const condition of this.waitConditions) {
      clearTimeout(condition.timeout);
      condition.reject(new Error('TabMessenger disposed'));
    }
    this.waitConditions = [];
  }

  // async executeNavigateToScreen(parameters: NavigateToScreenActionParameters): Promise<ExtractEventPayload<NavigateToScreenActionPayload>>
  // {
  //   const result = await this.sendCommand<NavigateToScreenActionPayload>({
  //     action: "navigateToScreenAction",
  //     parameters
  //   });
  //   return result;
  // }

}

/**
 * Helper function to orchestrate a sequence of operations on a tab
 * @param tabId The ID of the tab to orchestrate
 * @param fn A function that uses the TabMessenger to perform operations
 * @returns A promise that resolves when the orchestration is complete
 */
export async function orchestrateOnTab<T>(
  tabId: number,
  fn: (messenger: TabMessenger) => Promise<T>
): Promise<T> {
  const messenger = new TabMessenger(tabId);
  try {
    return await fn(messenger);
  } finally {
    messenger.dispose();
  }
}
