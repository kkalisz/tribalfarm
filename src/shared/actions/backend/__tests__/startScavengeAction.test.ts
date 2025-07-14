import {vi, describe, it, expect, beforeEach} from 'vitest';
import {BackendActionContext} from '@src/shared/actions/backend/core/BackendActionContext';
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";
import {TestMessenger} from "@src/shared/actions/backend/__tests__/TestMessenger";
import {PAGE_STATUS_ACTION, PageStatusResponse} from "@src/shared/actions/content/pageStatus/PageStatusAction";
import {loadFileAsString} from "@src/shared/actions/backend/__tests__/loadFileAsString";
import {
  NAVIGATE_TO_PAGE_ACTION,
  NavigateToPageActionResponse
} from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";
import {scavengeVillage} from '@src/shared/actions/backend/scavenge/scavengeVillage';


describe('startScavengeAction', () => {
  let mockContext: BackendActionContext;
  let testMessenger: TestMessenger = new TestMessenger();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock context
    mockContext = {
      messenger: new MessengerWrapper(testMessenger),
      playerSettings: {
        server: 'https://example.com',
        login: 'testuser',
        password: 'testpass',
        world: 'world1',
        hasPremium: false,
      }
    };
  });

  it('should navigate to the scavenge page and parse content',
    async () => {

    const scavengeContent = await loadFileAsString('scavenge.html');
      testMessenger.setResponse<PageStatusResponse>(PAGE_STATUS_ACTION, {
          pageContent: scavengeContent,
          url: 'https://example.com/game.php?village=123&screen=place&mode=scavenge'
        },
        0,
        "done")

      testMessenger.setResponse<PageStatusResponse>(PAGE_STATUS_ACTION, {
          pageContent: scavengeContent,
          url: 'https://example.com/game.php?village=123&screen=place&mode=scavenge'
        },
        1,
        "done")

      testMessenger.setResponse<NavigateToPageActionResponse>(NAVIGATE_TO_PAGE_ACTION, {
          wasReloaded: true
        },
        0,
        "done")

      // Arrange
      const input = {villageId: '123', addRepeatScavengeTimer: false};

      // Act
      await scavengeVillage(mockContext, input);

      // Assert
      // Verify that messenger methods were called with correct parameters
      // expect(mockContext.messenger.executePageStatusAction).toHaveBeenCalledTimes(2);
      // expect(mockContext.messenger.executeNavigateToPageAction).toHaveBeenCalledWith({
      //   url: 'https://example.com/game.php?village=123&screen=place&mode=scavenge',
      //   reload: true
      // });
    });
});