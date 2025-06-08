import { describe, it, expect } from 'vitest';
import { TestMessenger } from '../../../backend/__tests__/TestMessenger';
import { BasePageResponse, BasePageAction } from '@src/shared/actions/content/core/types';

// Define test interfaces
interface TestResponse extends BasePageResponse {
  data: string;
}

interface TestAction extends BasePageAction<TestResponse> {
  param1: string;
  param2: number;
}

describe('TestMessenger', () => {
  it('should return default response when no response is configured', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action: TestAction = { param1: 'test', param2: 123 };
    
    // Act
    const result = await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    
    // Assert
    expect(result.status).toBe('done');
    expect(result.details).toEqual({});
    expect(result.statusMessage).toBe('Default response');
  });
  
  it('should return configured response for actionName', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action: TestAction = { param1: 'test', param2: 123 };
    const response: TestResponse = { data: 'response data' };
    
    messenger.setResponse('testAction', response, 0, 'Custom status message');
    
    // Act
    const result = await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    
    // Assert
    expect(result.status).toBe('done');
    expect(result.details).toEqual(response);
    expect(result.statusMessage).toBe('Custom status message');
  });
  
  it('should return different responses based on execution count', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action: TestAction = { param1: 'test', param2: 123 };
    const response1: TestResponse = { data: 'first call' };
    const response2: TestResponse = { data: 'second call' };
    const response3: TestResponse = { data: 'third call' };
    
    messenger.setResponse('testAction', response1, 0);
    messenger.setResponse('testAction', response2, 1);
    messenger.setResponse('testAction', response3, 2);
    
    // Act & Assert - First call
    let result = await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    expect(result.details).toEqual(response1);
    
    // Act & Assert - Second call
    result = await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    expect(result.details).toEqual(response2);
    
    // Act & Assert - Third call
    result = await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    expect(result.details).toEqual(response3);
  });
  
  it('should return the last configured response when execution count exceeds configured responses', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action: TestAction = { param1: 'test', param2: 123 };
    const response1: TestResponse = { data: 'first call' };
    const response2: TestResponse = { data: 'second call' };
    
    messenger.setResponse('testAction', response1, 0);
    messenger.setResponse('testAction', response2, 1);
    
    // Act - First call
    await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    
    // Act - Second call
    await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    
    // Act - Third call (exceeds configured responses)
    const result = await messenger.sendCommand<TestResponse, TestAction>('testAction', action);
    
    // Assert - Should return the last configured response
    expect(result.details).toEqual(response2);
  });
  
  it('should track execution count for each actionName', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action: TestAction = { param1: 'test', param2: 123 };
    
    // Act - Execute the action multiple times
    await messenger.sendCommand('action1', action);
    await messenger.sendCommand('action1', action);
    await messenger.sendCommand('action2', action);
    
    // Assert
    expect(messenger.getExecutionCount('action1')).toBe(2);
    expect(messenger.getExecutionCount('action2')).toBe(1);
    expect(messenger.getExecutionCount('action3')).toBe(0); // Never executed
  });
  
  it('should track call history for each actionName', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action1: TestAction = { param1: 'test1', param2: 123 };
    const action2: TestAction = { param1: 'test2', param2: 456 };
    
    // Act
    await messenger.sendCommand('testAction', action1);
    await messenger.sendCommand('testAction', action2);
    
    // Assert
    const history = messenger.getCallHistory<TestAction>('testAction');
    expect(history.length).toBe(2);
    expect(history[0]).toEqual(action1);
    expect(history[1]).toEqual(action2);
  });
  
  it('should reset execution counts and call history', async () => {
    // Arrange
    const messenger = new TestMessenger();
    const action: TestAction = { param1: 'test', param2: 123 };
    
    // Act - Execute actions and then reset
    await messenger.sendCommand('action1', action);
    await messenger.sendCommand('action2', action);
    messenger.reset();
    
    // Assert
    expect(messenger.getExecutionCount('action1')).toBe(0);
    expect(messenger.getExecutionCount('action2')).toBe(0);
    expect(messenger.getCallHistory('action1')).toEqual([]);
    expect(messenger.getCallHistory('action2')).toEqual([]);
  });
});