# Chrome Extension Testing Guide

This guide explains how to write and run tests for the Chrome extension using Vitest.

## Running Tests

To run all tests:

```bash
npm run test
```

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test:watch
```

## Test Structure

Tests are organized alongside the code they test:

- `src/pages/content/index.test.ts` - Tests for utility functions in the content script
- `src/pages/content/components.test.tsx` - Tests for React components in the content script
- `src/pages/content/initialization.test.ts` - Tests for initialization functions in the content script

## Writing Tests

### Testing Utility Functions

For pure utility functions, create a test file with the same name as the file containing the function, but with a `.test.ts` extension:

```typescript
// Example: Testing the isValidDomain function
import { describe, it, expect } from 'vitest';
import { isValidDomain } from './index';

describe('isValidDomain', () => {
  it('should return true for valid domains', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { hostname: 'pl123.plemiona.pl' },
      writable: true
    });

    expect(isValidDomain()).toBe(true);
  });
});
```

### Testing React Components

For React components, use React Testing Library:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './index';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(/* <MyComponent /> */);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testing DOM Interactions

For functions that interact with the DOM, mock the DOM elements and methods:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myDomFunction } from './index';

describe('myDomFunction', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

    // Mock DOM methods
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      return { /* mock element properties */ };
    });
  });

  it('interacts with the DOM correctly', () => {
    myDomFunction();
    // Assert expected behavior
  });
});
```

### Testing Chrome API Interactions

Chrome APIs are mocked in the test setup file (`src/test/setup.ts`). You can customize these mocks for specific tests:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { myChromeFunction } from './index';

describe('myChromeFunction', () => {
  it('interacts with Chrome APIs correctly', () => {
    // Override default mock for this test
    chrome.runtime.sendMessage = vi.fn().mockImplementation((message, callback) => {
      callback({ success: true });
    });

    myChromeFunction();

    expect(chrome.runtime.sendMessage).toHaveBeenCalled();
  });
});
```

## Mocking

### Mocking Browser APIs

Browser APIs are mocked in the test setup file. You can extend these mocks as needed:

```typescript
// In your test file
beforeEach(() => {
  // Add or override mocks
  window.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ data: 'mocked data' })
  });
});
```

### Mocking Modules

To mock an imported module:

```typescript
import { vi } from 'vitest';

// Mock an entire module
vi.mock('./myModule', () => ({
  myFunction: vi.fn().mockReturnValue('mocked result')
}));
```

## Coverage Reports

To generate a coverage report:

```bash
npm run test -- --coverage
```

This will create a coverage report in the `coverage` directory.
