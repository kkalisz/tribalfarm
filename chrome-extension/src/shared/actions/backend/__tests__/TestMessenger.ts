import {
  BasePageAction,
  BasePageResponse,
  GenericStatusPayload,
  Messenger,
  doneResponse
} from '@src/shared/actions/content/core/types';

/**
 * Response configuration for TestMessenger
 */
export interface ResponseConfig<RESPONSE extends BasePageResponse> {
  // The response to return
  response: RESPONSE;
  // Optional status message
  statusMessage?: string;
}

/**
 * TestMessenger is a test implementation of the Messenger interface
 * that allows defining responses based on actionName and execution count.
 */
export class TestMessenger implements Messenger {
  // Map to store responses by actionName
  private responsesByAction: Map<string, ResponseConfig<any>[]> = new Map();
  
  // Map to track execution count for each actionName
  private executionCounts: Map<string, number> = new Map();
  
  // Map to store the history of calls for each actionName
  private callHistory: Map<string, any[]> = new Map();

  /**
   * Sends a command and returns a predefined response based on actionName and execution count
   * @param actionName The name of the action
   * @param action The action parameters
   * @returns A promise that resolves with the predefined response
   */
  async sendCommand<RESPONSE extends BasePageResponse, BA extends BasePageAction<RESPONSE>>(
    actionName: string,
    action: BA
  ): Promise<GenericStatusPayload<RESPONSE>> {
    // Record the call in history
    if (!this.callHistory.has(actionName)) {
      this.callHistory.set(actionName, []);
    }
    this.callHistory.get(actionName)!.push(action);
    
    // Increment the execution count for this actionName
    const currentCount = this.executionCounts.get(actionName) || 0;
    this.executionCounts.set(actionName, currentCount + 1);
    
    // Get the responses for this actionName
    const responses = this.responsesByAction.get(actionName) || [];
    
    // If we have a response for this execution count, return it
    if (responses.length > currentCount) {
      const responseConfig = responses[currentCount];
      return {
        status: 'done',
        details: responseConfig.response,
        statusMessage: responseConfig.statusMessage
      };
    }
    
    // If we have at least one response but not for this specific count, return the last one
    if (responses.length > 0) {
      const responseConfig = responses[responses.length - 1];
      return {
        status: 'done',
        details: responseConfig.response,
        statusMessage: responseConfig.statusMessage
      };
    }
    
    // Default response if none is configured
    return {
      status: 'done',
      details: {} as RESPONSE,
      statusMessage: 'Default response'
    };
  }

  /**
   * Cleans up resources
   */
  dispose(): void {
    // Nothing to dispose in this test implementation
  }

  /**
   * Defines a response for a specific actionName and execution count
   * @param actionName The name of the action
   * @param response The response to return
   * @param executionCount The execution count (0-based) for which to return this response
   * @param statusMessage Optional status message
   */
  setResponse<RESPONSE extends BasePageResponse>(
    actionName: string,
    response: RESPONSE,
    executionCount: number = 0,
    statusMessage?: string
  ): void {
    if (!this.responsesByAction.has(actionName)) {
      this.responsesByAction.set(actionName, []);
    }
    
    const responses = this.responsesByAction.get(actionName)!;
    
    // Ensure we have enough slots in the array
    while (responses.length <= executionCount) {
      responses.push({ response: {} as RESPONSE });
    }
    
    // Set the response for the specified execution count
    responses[executionCount] = { response, statusMessage };
  }

  /**
   * Gets the current execution count for an actionName
   * @param actionName The name of the action
   * @returns The current execution count (0 if never executed)
   */
  getExecutionCount(actionName: string): number {
    return this.executionCounts.get(actionName) || 0;
  }

  /**
   * Gets the history of calls for an actionName
   * @param actionName The name of the action
   * @returns Array of action parameters passed to sendCommand
   */
  getCallHistory<BA extends BasePageAction>(actionName: string): BA[] {
    return this.callHistory.get(actionName) || [];
  }

  /**
   * Resets the execution counts and call history
   */
  reset(): void {
    this.executionCounts.clear();
    this.callHistory.clear();
  }
}