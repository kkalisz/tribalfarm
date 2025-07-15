import { NavigateToPageActionHandler } from '../NavigateToPageActionHandler';
import { NavigateToPageAction } from '../NavigateToPageAction';
import { ActionContext } from '@src/shared/actions/content/core/ActionContext';
import { GenericStatusPayload } from '@src/shared/actions/content/core/types';

// Mock the document.querySelector
const originalQuerySelector = document.querySelector;
let mockQuerySelector: jest.Mock;

// Mock window.location
const originalLocation = window.location;
let locationAssignMock: jest.Mock;

describe('NavigateToPageActionHandler', () => {
  let handler: NavigateToPageActionHandler;
  let mockContext: ActionContext;
  
  beforeEach(() => {
    // Setup mocks
    mockQuerySelector = jest.fn();
    document.querySelector = mockQuerySelector;
    
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      href: 'https://example.com/page1'
    } as Location;
    
    locationAssignMock = jest.fn();
    Object.defineProperty(window.location, 'href', {
      set: locationAssignMock,
      get: () => 'https://example.com/page1'
    });
    
    // Create handler and context
    handler = new NavigateToPageActionHandler();
    mockContext = {
      isCurrentActionRestored: false
    } as ActionContext;
    
    // Mock setInterval and clearInterval
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore original implementations
    document.querySelector = originalQuerySelector;
    window.location = originalLocation;
    jest.useRealTimers();
  });
  
  test('should navigate to a new URL', async () => {
    const action: NavigateToPageAction = {
      url: 'https://example.com/page2'
    };
    
    const result = await handler.execute(action, mockContext);
    
    expect(locationAssignMock).toHaveBeenCalledWith('https://example.com/page2');
    expect(result.status).toBe('inProgress');
  });
  
  test('should return done if already on the same URL and action is restored', async () => {
    const action: NavigateToPageAction = {
      url: 'https://example.com/page1'
    };
    
    mockContext.isCurrentActionRestored = true;
    
    const result = await handler.execute(action, mockContext);
    
    expect(result.status).toBe('done');
    expect(result.payload?.wasReloaded).toBe(true);
  });
  
  test('should return done if already on the same URL and reload is true', async () => {
    const action: NavigateToPageAction = {
      url: 'https://example.com/page1',
      reload: true
    };
    
    const result = await handler.execute(action, mockContext);
    
    expect(result.status).toBe('done');
    expect(result.payload?.wasReloaded).toBe(false);
  });
  
  test('should wait for element if waitForSelector is provided and element exists', async () => {
    const action: NavigateToPageAction = {
      url: 'https://example.com/page1',
      waitForSelector: '#myElement'
    };
    
    mockContext.isCurrentActionRestored = true;
    mockQuerySelector.mockReturnValue(document.createElement('div'));
    
    const result = await handler.execute(action, mockContext);
    
    expect(mockQuerySelector).toHaveBeenCalledWith('#myElement');
    expect(result.status).toBe('done');
    expect(result.payload?.wasReloaded).toBe(true);
  });
  
  test('should wait for element to appear if waitForSelector is provided and element does not exist initially', async () => {
    const action: NavigateToPageAction = {
      url: 'https://example.com/page1',
      waitForSelector: '#myElement',
      waitTimeout: 5000
    };
    
    mockContext.isCurrentActionRestored = true;
    
    // Element doesn't exist initially, but appears after some time
    mockQuerySelector.mockReturnValueOnce(null);
    
    const resultPromise = handler.execute(action, mockContext);
    
    // Element appears after 1 second
    setTimeout(() => {
      mockQuerySelector.mockReturnValue(document.createElement('div'));
    }, 1000);
    
    // Fast-forward time
    jest.advanceTimersByTime(1100);
    
    const result = await resultPromise;
    
    expect(mockQuerySelector).toHaveBeenCalledWith('#myElement');
    expect(result.status).toBe('done');
    expect(result.payload?.wasReloaded).toBe(true);
  });
  
  test('should handle timeout when waiting for element', async () => {
    const action: NavigateToPageAction = {
      url: 'https://example.com/page1',
      waitForSelector: '#myElement',
      waitTimeout: 5000
    };
    
    mockContext.isCurrentActionRestored = true;
    
    // Element never appears
    mockQuerySelector.mockReturnValue(null);
    
    const resultPromise = handler.execute(action, mockContext);
    
    // Fast-forward time past the timeout
    jest.advanceTimersByTime(6000);
    
    const result = await resultPromise;
    
    expect(mockQuerySelector).toHaveBeenCalledWith('#myElement');
    expect(result.status).toBe('done');
    expect(result.payload?.wasReloaded).toBe(true);
  });
});