# TestMessenger

A test implementation of the `Messenger` interface that allows defining responses based on action name and execution count.

## Features

- Implements the `Messenger` interface for use in tests
- Allows defining specific responses for different action names
- Supports different responses based on the execution count of an action
- Tracks execution counts for each action name
- Maintains call history for verification in tests
- Provides methods to reset state between tests

## Installation

The `TestMessenger` is part of the project's test utilities and doesn't require any additional installation.

## Usage

### Basic Usage

```typescript
import { TestMessenger } from './TestMessenger';
import { BasePageResponse } from '@src/shared/actions/content/core/types';

// Create a new TestMessenger
const messenger = new TestMessenger();

// Define a response for an action
interface MyResponse extends BasePageResponse {
  data: string;
}

const response: MyResponse = { data: 'test data' };
messenger.setResponse('myAction', response);

// Use the messenger in your tests
const result = await messenger.sendCommand('myAction', { param: 'value' });
// result.details will contain the response
```

### Configuring Responses for Different Execution Counts

```typescript
// First execution will return response1
messenger.setResponse('myAction', response1, 0);

// Second execution will return response2
messenger.setResponse('myAction', response2, 1);

// Third execution will return response3
messenger.setResponse('myAction', response3, 2);

// First call
const result1 = await messenger.sendCommand('myAction', {});
// result1.details === response1

// Second call
const result2 = await messenger.sendCommand('myAction', {});
// result2.details === response2

// Third call
const result3 = await messenger.sendCommand('myAction', {});
// result3.details === response3
```

### Verifying Calls

```typescript
// Check how many times an action was called
const count = messenger.getExecutionCount('myAction');

// Get the history of calls for an action
const history = messenger.getCallHistory('myAction');
expect(history[0].param).toBe('value');
```

### Resetting Between Tests

```typescript
// Reset execution counts and call history
messenger.reset();
```

## API Reference

### Constructor

```typescript
constructor()
```

Creates a new TestMessenger instance.

### Methods

#### `sendCommand<RESPONSE, BA>(actionName: string, action: BA): Promise<GenericStatusPayload<RESPONSE>>`

Sends a command and returns a predefined response based on actionName and execution count.

#### `dispose(): void`

Cleans up resources (no-op in this implementation).

#### `setResponse<RESPONSE>(actionName: string, response: RESPONSE, executionCount: number = 0, statusMessage?: string): void`

Defines a response for a specific actionName and execution count.

- `actionName`: The name of the action
- `response`: The response to return
- `executionCount`: The execution count (0-based) for which to return this response
- `statusMessage`: Optional status message

#### `getExecutionCount(actionName: string): number`

Gets the current execution count for an actionName.

#### `getCallHistory<BA>(actionName: string): BA[]`

Gets the history of calls for an actionName.

#### `reset(): void`

Resets the execution counts and call history.

## Example

See `TestMessengerExample.ts` for a complete example of how to use TestMessenger in tests.

## License

This project is licensed under the same license as the main project.