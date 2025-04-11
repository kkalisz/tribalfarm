// This file contains setup code for Vitest tests
import { vi, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock chrome and browser APIs
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path) => `chrome-extension://mock-extension-id/${path}`),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

// Mock webextension-polyfill
const mockBrowser = { ...mockChrome };

// Add mocks to global object
vi.stubGlobal('chrome', mockChrome);
vi.stubGlobal('browser', mockBrowser);

// Clean up mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Add custom matchers or other test utilities here if needed
