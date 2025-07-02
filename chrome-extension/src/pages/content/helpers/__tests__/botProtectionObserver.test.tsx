import { describe, it, expect, vi } from 'vitest';
import { observeBotProtectionQuest } from '@pages/content/helpers/botProtectionObserver';

// Mock environment setup required for jsdom (already provided by Vitest's `jsdom` environment)
describe('observeBotProtectionQuest', () => {
  it('should detect the pre-existing #botprotection_quest element on initialization', () => {
    // Arrange: Set up the mock root element with the target node already in place
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="questlog">
        <div class="quest" id="botprotection_quest" data-title="Ochrona botowa"></div>
      </div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure the callback is triggered for the pre-existing element
    expect(mockCallback).toHaveBeenCalledWith(true);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should detect dynamically added #botprotection_quest elements', () => {
    // Arrange: Create an empty root element
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="questlog"></div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Dynamically add the target node after 1ms
    setTimeout(() => {
      const dynamicQuest = document.createElement('div');
      dynamicQuest.className = 'quest';
      dynamicQuest.id = 'botprotection_quest';
      dynamicQuest.dataset.title = 'Ochrona botowa';

      rootElement.querySelector('.questlog')?.appendChild(dynamicQuest);
    }, 1);

    // Assert after a timeout to ensure the mutation is detected
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(true);
        stopObserving(); // Cleanup
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });

  it('should not call the callback if there are unrelated changes', () => {
    // Arrange: Create an empty root element
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="questlog"></div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Dynamically add a non-matching element
    setTimeout(() => {
      const unrelatedElement = document.createElement('div');
      unrelatedElement.className = 'quest';
      unrelatedElement.id = 'some_other_quest';
      unrelatedElement.dataset.title = 'Other Quest';

      rootElement.querySelector('.questlog')?.appendChild(unrelatedElement);
    }, 1);

    // Assert after a timeout to ensure no incorrect callback is made
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockCallback).not.toHaveBeenCalled();
        stopObserving(); // Cleanup
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });

  it('should stop observing when the returned cleanup function is called', () => {
    // Arrange: Create an empty root element
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="questlog"></div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Call the cleanup function to stop observing
    stopObserving();

    // Dynamically add the target node (should not trigger the callback)
    setTimeout(() => {
      const dynamicQuest = document.createElement('div');
      dynamicQuest.className = 'quest';
      dynamicQuest.id = 'botprotection_quest';
      dynamicQuest.dataset.title = 'Ochrona botowa';

      rootElement.querySelector('.questlog')?.appendChild(dynamicQuest);
    }, 1);

    // Assert after a timeout to ensure the callback is not triggered
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockCallback).not.toHaveBeenCalled();
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });
});