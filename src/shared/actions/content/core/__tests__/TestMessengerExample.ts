import { describe, it, expect, beforeEach } from 'vitest';
import { TestMessenger } from '../../../backend/__tests__/TestMessenger';
import { BasePageResponse, BasePageAction } from '@src/shared/actions/content/core/types';

// Example response interfaces
interface GetUserResponse extends BasePageResponse {
  userId: string;
  username: string;
  isAdmin: boolean;
}

interface GetUserAction extends BasePageAction<GetUserResponse> {
  includeDetails: boolean;
}

// Example service that uses the Messenger
class UserService {
  constructor(private messenger: TestMessenger) {}

  async getUser(userId: string, includeDetails: boolean): Promise<GetUserResponse> {
    const action: GetUserAction = { includeDetails };
    const result = await this.messenger.sendCommand<GetUserResponse, GetUserAction>(
      'getUserAction', 
      action
    );
    
    if (result.status === 'error') {
      throw new Error('Failed to get user');
    }
    
    return result.details!;
  }
  
  async getUserWithRetry(userId: string, includeDetails: boolean, maxRetries: number = 3): Promise<GetUserResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.getUser(userId, includeDetails);
      } catch (error) {
        lastError = error as Error;
        // In a real implementation, you might wait before retrying
      }
    }
    
    throw lastError || new Error('Failed to get user after retries');
  }
}

// Example test suite
describe('UserService with TestMessenger', () => {
  let messenger: TestMessenger;
  let userService: UserService;
  
  beforeEach(() => {
    // Create a new TestMessenger for each test
    messenger = new TestMessenger();
    userService = new UserService(messenger);
  });
  
  it('should get user details successfully', async () => {
    // Arrange - Configure the TestMessenger to return a successful response
    const userResponse: GetUserResponse = {
      userId: '123',
      username: 'testuser',
      isAdmin: false
    };
    
    messenger.setResponse<GetUserResponse>('getUserAction', userResponse);
    
    // Act
    const result = await userService.getUser('123', true);
    
    // Assert
    expect(result).toEqual(userResponse);
    
    // Verify the action was called with the correct parameters
    const callHistory = messenger.getCallHistory<GetUserAction>('getUserAction');
    expect(callHistory.length).toBe(1);
    expect(callHistory[0].includeDetails).toBe(true);
  });
  
  it('should retry getting user details when initial attempts fail', async () => {
    // Arrange - Configure the TestMessenger to fail on first two attempts, then succeed
    const errorResponse: GetUserResponse = { userId: '', username: '', isAdmin: false };
    const successResponse: GetUserResponse = {
      userId: '123',
      username: 'testuser',
      isAdmin: true
    };
    
    // First attempt will fail
    messenger.setResponse<GetUserResponse>('getUserAction', errorResponse, 0, 'Error on first attempt');
    
    // Second attempt will fail
    messenger.setResponse<GetUserResponse>('getUserAction', errorResponse, 1, 'Error on second attempt');
    
    // Third attempt will succeed
    messenger.setResponse<GetUserResponse>('getUserAction', successResponse, 2);
    
    // Act
    const result = await userService.getUserWithRetry('123', true);
    
    // Assert
    expect(result).toEqual(successResponse);
    
    // Verify the action was called multiple times
    expect(messenger.getExecutionCount('getUserAction')).toBe(3);
  });
  
  it('should demonstrate how to use TestMessenger for different scenarios', async () => {
    // Scenario 1: Different responses for different execution counts
    const response1: GetUserResponse = { userId: '1', username: 'user1', isAdmin: false };
    const response2: GetUserResponse = { userId: '2', username: 'user2', isAdmin: true };
    
    messenger.setResponse('getUserAction', response1, 0);
    messenger.setResponse('getUserAction', response2, 1);
    
    // First call gets first response
    let result = await userService.getUser('1', false);
    expect(result).toEqual(response1);
    
    // Second call gets second response
    result = await userService.getUser('2', false);
    expect(result).toEqual(response2);
    
    // Scenario 2: Reset the messenger to start fresh
    messenger.reset();
    expect(messenger.getExecutionCount('getUserAction')).toBe(0);
    
    // Scenario 3: Configure a new response after reset
    const newResponse: GetUserResponse = { userId: '3', username: 'user3', isAdmin: false };
    messenger.setResponse('getUserAction', newResponse);
    
    result = await userService.getUser('3', true);
    expect(result).toEqual(newResponse);
  });
});

// This file is an example and not meant to be run directly.
// It demonstrates how to use TestMessenger in real test scenarios.