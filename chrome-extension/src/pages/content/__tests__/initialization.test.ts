import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeContentScript } from '../index';

describe('initializeContentScript', () => {
  // Mock DOM elements and methods
  let appendChildSpy: any;
  let createElementSpy: any;
  let mockContainer: any;
  let mockShadowRoot: any;
  let mockLinkElement: any;
  let mockShadowRootContent: any;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

    // Create mock elements
    mockContainer = {
      id: '',
      style: {},
      attachShadow: vi.fn(() => mockShadowRoot)
    };

    mockShadowRoot = {
      appendChild: vi.fn()
    };

    mockLinkElement = {
      setAttribute: vi.fn(),
      style: {}
    };

    mockShadowRootContent = {
      id: '',
      className: '',
      style: {}
    };

    // Spy on document methods
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'div') {
        if (!mockContainer.id) {
          return mockContainer;
        } else {
          return mockShadowRootContent;
        }
      } else if (tagName === 'link') {
        return mockLinkElement;
      }
      return document.createElement(tagName);
    });

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
      return document.createElement('div');
    });

    // Mock chrome.runtime.getURL
    chrome.runtime.getURL = vi.fn((path) => `chrome-extension://mock-id/${path}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a container with shadow DOM', () => {
    initializeContentScript();

    // Check if container was created
    expect(createElementSpy).toHaveBeenCalledWith('div');
    expect(mockContainer.id).toBe('__root-extension-container');

    // Check if shadow root was created
    expect(mockContainer.attachShadow).toHaveBeenCalledWith({ mode: 'open' });

    // Check if container was added to body
    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('should add stylesheet to shadow root', () => {
    initializeContentScript();

    // Check if link element was created
    expect(createElementSpy).toHaveBeenCalledWith('link');

    // Check if link attributes were set correctly
    expect(mockLinkElement.setAttribute).toHaveBeenCalledWith('rel', 'stylesheet');
    expect(mockLinkElement.setAttribute).toHaveBeenCalledWith(
      'href',
      chrome.runtime.getURL('tailwind-content.css')
    );

    // Check if link was added to shadow root
    expect(mockShadowRoot.appendChild).toHaveBeenCalledWith(mockLinkElement);
  });

  it('should create a React root container in shadow DOM', () => {
    initializeContentScript();

    // Check if shadow root content was created
    expect(createElementSpy).toHaveBeenCalledTimes(4); // container, link, shadowRootContent, div from error handling
    expect(mockShadowRootContent.id).toBe('__shadow-content');
    expect(mockShadowRootContent.className).toBe('my-extension');

    // Check if shadow root content was added to shadow root
    expect(mockShadowRoot.appendChild).toHaveBeenCalledWith(mockShadowRootContent);
  });

  it('should set correct styles on container', () => {
    initializeContentScript();

    // Check container styles
    expect(mockContainer.style.position).toBe('fixed');
    expect(mockContainer.style.bottom).toBe('0');
    expect(mockContainer.style.left).toBe('0');
    expect(mockContainer.style.width).toBe('100vw');
    expect(mockContainer.style.height).toBe('100vh');
    expect(mockContainer.style.zIndex).toBe('999999');
    expect(mockContainer.style.pointerEvents).toBe('none');
  });
});
