import { describe, it, expect, vi } from 'vitest';
import { observeBotProtectionQuest } from '@pages/content/helpers/botProtectionObserver';
import { BotCheckStatus } from '@pages/content/helpers/BotCheckStatus';

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
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.QUEST_LOG);

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
        expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.QUEST_LOG);
        stopObserving(); // Cleanup
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });

  it('should detect the pre-existing td.bot-protection-row element on initialization', () => {
    // Arrange: Set up the mock root element with the target node already in place
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <table class="main">
        <tbody>
          <tr>
            <td class="bot-protection-row">
              <h2>Ochrona botowa</h2>
              <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
              <div class="captcha"></div>
              <a href="#" class="btn btn-default">Rozpocznij sprawdzanie ochrony botowej</a>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure the callback is triggered for the pre-existing element
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.CONTENT);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should detect the pre-existing td.bot-protection-row element with captcha iframe on initialization', () => {
    // Arrange: Set up the mock root element with the target node already in place
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <table class="main">
        <tbody>
          <tr>
            <td class="bot-protection-row">
              <h2>Ochrona botowa</h2>
              <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
              <div class="captcha">
                <iframe src="./bot_content_page_files/hcaptcha.html" tabindex="0" frameborder="0" scrolling="no" allow="private-state-token-issuance 'src'; private-state-token-redemption 'src'" title="Widżet zawierający pole wyboru dla wyzwania bezpieczeństwa hCaptcha" data-hcaptcha-widget-id="1vbx37c24o2" data-hcaptcha-response="" style="pointer-events: auto; background-color: rgba(255, 255, 255, 0); border-radius: 4px; width: 302px; height: 76px; overflow: hidden;"></iframe>
                <textarea id="g-recaptcha-response-1vbx37c24o2" name="g-recaptcha-response" style="display: none;"></textarea>
                <textarea id="h-captcha-response-1vbx37c24o2" name="h-captcha-response" style="display: none;"></textarea>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure the callback is triggered for the pre-existing element with CONTENT_TEST status
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.CONTENT_TEST);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should detect dynamically added td.bot-protection-row elements', () => {
    // Arrange: Create an empty root element
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <table class="main">
        <tbody>
          <tr></tr>
        </tbody>
      </table>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Dynamically add the target node after 1ms
    setTimeout(() => {
      const tr = rootElement.querySelector('tr');
      if (tr) {
        const td = document.createElement('td');
        td.className = 'bot-protection-row';
        td.innerHTML = `
          <h2>Ochrona botowa</h2>
          <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
          <div class="captcha"></div>
          <a href="#" class="btn btn-default">Rozpocznij sprawdzanie ochrony botowej</a>
        `;
        tr.appendChild(td);
      }
    }, 1);

    // Assert after a timeout to ensure the mutation is detected
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.CONTENT);
        stopObserving(); // Cleanup
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });

  it('should detect dynamically added td.bot-protection-row elements with captcha iframe', () => {
    // Arrange: Create an empty root element
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <table class="main">
        <tbody>
          <tr></tr>
        </tbody>
      </table>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Dynamically add the target node after 1ms
    setTimeout(() => {
      const tr = rootElement.querySelector('tr');
      if (tr) {
        const td = document.createElement('td');
        td.className = 'bot-protection-row';
        td.innerHTML = `
          <h2>Ochrona botowa</h2>
          <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
          <div class="captcha">
            <iframe src="./bot_content_page_files/hcaptcha.html" tabindex="0" frameborder="0" scrolling="no" allow="private-state-token-issuance 'src'; private-state-token-redemption 'src'" title="Widżet zawierający pole wyboru dla wyzwania bezpieczeństwa hCaptcha" data-hcaptcha-widget-id="1vbx37c24o2" data-hcaptcha-response="" style="pointer-events: auto; background-color: rgba(255, 255, 255, 0); border-radius: 4px; width: 302px; height: 76px; overflow: hidden;"></iframe>
            <textarea id="g-recaptcha-response-1vbx37c24o2" name="g-recaptcha-response" style="display: none;"></textarea>
            <textarea id="h-captcha-response-1vbx37c24o2" name="h-captcha-response" style="display: none;"></textarea>
          </div>
        `;
        tr.appendChild(td);
      }
    }, 1);

    // Assert after a timeout to ensure the mutation is detected
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.CONTENT_TEST);
        stopObserving(); // Cleanup
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });

  it('should detect the pre-existing popup element with id="popup_box_bot_protection" on initialization', () => {
    // Arrange: Set up the mock root element with the target node already in place
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="popup_box_container sub-dialog">
        <div class="popup_box show" id="popup_box_bot_protection" style="width: 340px;">
          <a class="popup_box_close tooltip-delayed" href="#" data-title="Zamknąć :: Skrót klawiaturowy: &lt;strong&gt;Esc&lt;/strong&gt;">&nbsp;</a>
          <div class="popup_box_content">
            <h2>Ochrona botowa</h2>
            <div class="captcha">
              <iframe src="./bot_popup4_files/hcaptcha.html" tabindex="0" frameborder="0" scrolling="no" allow="private-state-token-issuance 'src'; private-state-token-redemption 'src'" title="Widżet zawierający pole wyboru dla wyzwania bezpieczeństwa hCaptcha" data-hcaptcha-widget-id="046u57k11v8d" data-hcaptcha-response="" style="pointer-events: auto; background-color: rgba(255, 255, 255, 0); border-radius: 4px; width: 302px; height: 76px; overflow: hidden;"></iframe>
              <textarea id="g-recaptcha-response-046u57k11v8d" name="g-recaptcha-response" style="display: none;"></textarea>
              <textarea id="h-captcha-response-046u57k11v8d" name="h-captcha-response" style="display: none;"></textarea>
            </div>
          </div>
        </div>
        <div class="fader"></div>
      </div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure the callback is triggered for the pre-existing element
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.POPUP_TEST);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should detect the pre-existing popup element with data-id="bot_protection" on initialization', () => {
    // Arrange: Set up the mock root element with the target node already in place
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="popup_box_container sub-dialog" data-id="bot_protection">
        <div class="popup_box show" style="width: 340px;">
          <a class="popup_box_close tooltip-delayed" href="#" data-title="Zamknąć :: Skrót klawiaturowy: &lt;strong&gt;Esc&lt;/strong&gt;">&nbsp;</a>
          <div class="popup_box_content">
            <h2>Ochrona botowa</h2>
            <div class="captcha">
              <iframe src="./bot_popup4_files/hcaptcha.html" tabindex="0" frameborder="0" scrolling="no" allow="private-state-token-issuance 'src'; private-state-token-redemption 'src'" title="Widżet zawierający pole wyboru dla wyzwania bezpieczeństwa hCaptcha" data-hcaptcha-widget-id="046u57k11v8d" data-hcaptcha-response="" style="pointer-events: auto; background-color: rgba(255, 255, 255, 0); border-radius: 4px; width: 302px; height: 76px; overflow: hidden;"></iframe>
              <textarea id="g-recaptcha-response-046u57k11v8d" name="g-recaptcha-response" style="display: none;"></textarea>
              <textarea id="h-captcha-response-046u57k11v8d" name="h-captcha-response" style="display: none;"></textarea>
            </div>
          </div>
        </div>
        <div class="fader"></div>
      </div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure the callback is triggered for the pre-existing element
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.POPUP_TEST);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should detect dynamically added popup elements', () => {
    // Arrange: Create an empty root element
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `<div id="content"></div>`;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Dynamically add the target node after 1ms
    setTimeout(() => {
      const content = rootElement.querySelector('#content');
      if (content) {
        const popupContainer = document.createElement('div');
        popupContainer.className = 'popup_box_container sub-dialog';
        popupContainer.setAttribute('data-id', 'bot_protection');
        popupContainer.innerHTML = `
          <div class="popup_box show" id="popup_box_bot_protection" style="width: 340px;">
            <a class="popup_box_close tooltip-delayed" href="#" data-title="Zamknąć :: Skrót klawiaturowy: &lt;strong&gt;Esc&lt;/strong&gt;">&nbsp;</a>
            <div class="popup_box_content">
              <h2>Ochrona botowa</h2>
              <div class="captcha"></div>
            </div>
          </div>
          <div class="fader"></div>
        `;
        content.appendChild(popupContainer);
      }
    }, 1);

    // Assert after a timeout to ensure the mutation is detected
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.POPUP_TEST);
        stopObserving(); // Cleanup
        resolve();
      }, 50); // Allow time for the mutation observer to pick up the change
    });
  });

  it('should prioritize popup bot protection over other types', () => {
    // Arrange: Set up the mock root element with multiple bot protection elements
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="questlog">
        <div class="quest" id="botprotection_quest" data-title="Ochrona botowa"></div>
      </div>
      <table class="main">
        <tbody>
          <tr>
            <td class="bot-protection-row">
              <h2>Ochrona botowa</h2>
              <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
              <div class="captcha"></div>
              <a href="#" class="btn btn-default">Rozpocznij sprawdzanie ochrony botowej</a>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="popup_box_container sub-dialog" data-id="bot_protection">
        <div class="popup_box show" id="popup_box_bot_protection" style="width: 340px;">
          <div class="popup_box_content">
            <h2>Ochrona botowa</h2>
            <div class="captcha"></div>
          </div>
        </div>
      </div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure only the popup callback is triggered (highest priority)
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.POPUP_TEST);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should prioritize CONTENT_TEST over QUEST_LOG and CONTENT', () => {
    // Arrange: Set up the mock root element with multiple bot protection elements
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <div class="questlog">
        <div class="quest" id="botprotection_quest" data-title="Ochrona botowa"></div>
      </div>
      <table class="main">
        <tbody>
          <tr>
            <td class="bot-protection-row">
              <h2>Ochrona botowa</h2>
              <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
              <div class="captcha"></div>
              <a href="#" class="btn btn-default">Rozpocznij sprawdzanie ochrony botowej</a>
            </td>
          </tr>
          <tr>
            <td class="bot-protection-row">
              <h2>Ochrona botowa</h2>
              <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
              <div class="captcha">
                <iframe src="./bot_content_page_files/hcaptcha.html" tabindex="0" frameborder="0" scrolling="no" allow="private-state-token-issuance 'src'; private-state-token-redemption 'src'" title="Widżet zawierający pole wyboru dla wyzwania bezpieczeństwa hCaptcha" data-hcaptcha-widget-id="1vbx37c24o2" data-hcaptcha-response="" style="pointer-events: auto; background-color: rgba(255, 255, 255, 0); border-radius: 4px; width: 302px; height: 76px; overflow: hidden;"></iframe>
                <textarea id="g-recaptcha-response-1vbx37c24o2" name="g-recaptcha-response" style="display: none;"></textarea>
                <textarea id="h-captcha-response-1vbx37c24o2" name="h-captcha-response" style="display: none;"></textarea>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure only the CONTENT_TEST callback is triggered (higher priority than QUEST_LOG and CONTENT)
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.CONTENT_TEST);

    // Cleanup: Stop observing
    stopObserving();
  });

  it('should prioritize POPUP_TEST over CONTENT_TEST', () => {
    // Arrange: Set up the mock root element with multiple bot protection elements
    const rootElement = document.createElement('div');
    rootElement.innerHTML = `
      <table class="main">
        <tbody>
          <tr>
            <td class="bot-protection-row">
              <h2>Ochrona botowa</h2>
              <p>Aby Plemiona były bezpieczne i sprawiedliwe dla wszystkich, przed kontynuowaniem gry musisz przejść kontrolę ochrony botowej.</p>
              <div class="captcha">
                <iframe src="./bot_content_page_files/hcaptcha.html" tabindex="0" frameborder="0" scrolling="no" allow="private-state-token-issuance 'src'; private-state-token-redemption 'src'" title="Widżet zawierający pole wyboru dla wyzwania bezpieczeństwa hCaptcha" data-hcaptcha-widget-id="1vbx37c24o2" data-hcaptcha-response="" style="pointer-events: auto; background-color: rgba(255, 255, 255, 0); border-radius: 4px; width: 302px; height: 76px; overflow: hidden;"></iframe>
                <textarea id="g-recaptcha-response-1vbx37c24o2" name="g-recaptcha-response" style="display: none;"></textarea>
                <textarea id="h-captcha-response-1vbx37c24o2" name="h-captcha-response" style="display: none;"></textarea>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="popup_box_container sub-dialog" data-id="bot_protection">
        <div class="popup_box show" id="popup_box_bot_protection" style="width: 340px;">
          <div class="popup_box_content">
            <h2>Ochrona botowa</h2>
            <div class="captcha"></div>
          </div>
        </div>
      </div>
    `;

    const mockCallback = vi.fn();

    // Act: Start observing
    const stopObserving = observeBotProtectionQuest(mockCallback, rootElement);

    // Assert: Ensure only the POPUP_TEST callback is triggered (highest priority)
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(BotCheckStatus.POPUP_TEST);

    // Cleanup: Stop observing
    stopObserving();
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
