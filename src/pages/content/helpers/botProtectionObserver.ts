import { BotCheckStatus } from '@pages/content/helpers/BotCheckStatus';

/**
 * Observes the DOM for the presence of bot protection elements and executes 
 * the provided callback function when such elements are detected.
 * 
 * Detects seven types of bot protection:
 * 1. "Bot protection" quest div with id 'botprotection_quest' (returns BotCheckStatus.QUEST_LOG)
 * 2. TD element with class 'bot-protection-row' (returns BotCheckStatus.CONTENT)
 * 3. TD element with class 'bot-protection-row' containing a captcha iframe (returns BotCheckStatus.CONTENT_TEST)
 * 4. Popup with id 'popup_box_bot_protection' or data-id 'bot_protection' (returns BotCheckStatus.POPUP_TEST)
 * 5. Modal with iframe containing "hcaptcha.com/captcha" in its source (returns BotCheckStatus.HCAPTCHA_MODAL)
 * 6. Body element with data-bot-protect="forced" attribute (returns BotCheckStatus.FORCED_PROTECTION)
 * 7. Div with class "bot-protection-blur" (returns BotCheckStatus.BLUR_PROTECTION)
 * 
 * Can also detect when all bot protection methods are not present (returns BotCheckStatus.ALL_METHODS_DISAPPEARED)
 *
 * Note: BotCheckStatus.HCAPTCHA_MODAL and BotCheckStatus.POPUP_TEST take precedence over all other types.
 * BotCheckStatus.CONTENT_TEST takes precedence over QUEST_LOG and CONTENT.
 * BotCheckStatus.FORCED_PROTECTION and BotCheckStatus.BLUR_PROTECTION are additional indicators.
 *
 * @param onBotCheck - A callback function to execute when a bot protection element is detected.
 * @param rootElement - Optional root element to observe. Defaults to `document.body`.
 * @param detectAllMethodsDisappeared - Optional boolean to enable/disable detection of all methods disappearing. Defaults to false.
 * @returns A function for stopping the observation.
 */
export function observeBotProtectionQuest(
  onBotCheck: (isDetected: BotCheckStatus) => void,
  rootElement: HTMLElement = document.body,
  detectAllMethodsDisappeared: boolean = false
): () => void {
  // Ensure the `onBotCheck` parameter is a valid function
  if (!onBotCheck || typeof onBotCheck !== 'function') {
    throw new Error('A valid onBotCheck function must be provided as the first parameter.');
  }

  // Flag to track if any bot protection method was previously detected
  let anyMethodPreviouslyDetected = false;

  // Function to check if all bot protection methods have disappeared
  const checkAllMethodsDisappeared = () => {
    if (!detectAllMethodsDisappeared || !anyMethodPreviouslyDetected) {
      return false;
    }

    // Check if any bot protection method is currently present
    const hcaptchaIframePresent = rootElement.querySelector('iframe[src*="hcaptcha.com/captcha"]') !== null;
    const popupPresent = rootElement.querySelector('#popup_box_bot_protection, [data-id="bot_protection"]') !== null;
    const rowWithCaptchaPresent = rootElement.querySelector('td.bot-protection-row .captcha iframe') !== null;
    const questPresent = rootElement.querySelector('#botprotection_quest') !== null;
    const rowPresent = rootElement.querySelector('td.bot-protection-row') !== null;

    // If all methods are not present, return true
    return !hcaptchaIframePresent && !popupPresent && !rowWithCaptchaPresent && !questPresent && !rowPresent;
  };

  // MutationObserver to observe DOM changes
  const observer = new MutationObserver((mutationsList: MutationRecord[]) => {

    // Check if all methods have disappeared
    if (checkAllMethodsDisappeared()) {
      console.log('Detected all bot protection methods have disappeared');
      onBotCheck(BotCheckStatus.NONE);
      return;
    }

    // Check for attribute changes (aria-hidden)
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
        const target = mutation.target as HTMLElement;
        const ariaHiddenValue = target.getAttribute('aria-hidden');

        // If aria-hidden was removed or set to "false", check for hcaptcha iframes
        if (ariaHiddenValue !== 'true') {
          // Check if this element contains an hcaptcha iframe
          const iframes = target.querySelectorAll('iframe[src*="hcaptcha.com/captcha"]');
          if (iframes.length > 0) {
            // Filter out iframes that are inside a table with class "main"
            const validIframes = Array.from(iframes).filter(iframe => {
              return !(iframe as HTMLElement).closest('table.main');
            });

            if (validIframes.length > 0) {
              console.log('Detected hcaptcha modal iframe after aria-hidden change:', validIframes[0]);
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
              return;
            }
          }

          // Check if this element is an ancestor of an hcaptcha iframe
          // Find all hcaptcha iframes in the document
          const allIframes = document.querySelectorAll('iframe[src*="hcaptcha.com/captcha"]');
          for (const iframe of allIframes) {
            // Check if the iframe is a descendant of the target element
            if (target.contains(iframe) && !(iframe as HTMLElement).closest('table.main')) {
              console.log('Detected hcaptcha modal iframe after aria-hidden change on ancestor:', iframe);
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
              return;
            }
          }
        }
      }
    }

    // First check if any mutation has added an iframe to a .captcha div inside a td.bot-protection-row
    // This is a special case for when a CONTENT element becomes a CONTENT_TEST element
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Check if the target is a .captcha div or a child of it
        // The closest() method is only available on Element objects, not on Node objects
        const captchaDiv = mutation.target instanceof Element ? mutation.target.closest('.captcha') : null;
        if (captchaDiv) {
          // Check if the captcha div is inside a td.bot-protection-row
          const botProtectionRow = captchaDiv.closest('td.bot-protection-row');
          if (botProtectionRow) {
            // Check if there's an iframe inside the captcha div now
            const iframe = captchaDiv.querySelector('iframe');
            if (iframe) {
              console.log('Detected iframe added to captcha div inside bot protection row:', botProtectionRow);
              onBotCheck(BotCheckStatus.CONTENT_TEST);
              return;
            }
          }
        }
      }
    }

    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Check added nodes for the target element
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;

            // Check if the element is an hcaptcha iframe (highest priority)
            if (
              element.tagName === 'IFRAME' &&
              element.getAttribute('src')?.includes('hcaptcha.com/captcha')
            ) {
              // Check if this iframe is inside a table with class "main"
              const isInsideMainTable = !!element.closest('table.main');

              // Check if any ancestor has aria-hidden="true"
              let parent = element.parentElement;
              let hasAriaHiddenAncestor = false;
              while (parent && !hasAriaHiddenAncestor) {
                if (parent.getAttribute('aria-hidden') === 'true') {
                  hasAriaHiddenAncestor = true;
                }
                parent = parent.parentElement;
              }

              // Only proceed if the iframe is NOT inside a table with class "main" and does NOT have an ancestor with aria-hidden="true"
              if (!isInsideMainTable && !hasAriaHiddenAncestor) {
                console.log('Detected hcaptcha modal iframe dynamically added:', element);
                anyMethodPreviouslyDetected = true;
                onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
                return;
              }
            }

            // Check if the element is the specific bot protection popup (highest priority)
            if (
              element.id === 'popup_box_bot_protection' ||
              element.getAttribute('data-id') === 'bot_protection'
            ) {
              console.log('Detected bot protection popup dynamically added:', element);
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.POPUP_TEST);
              return;
            }

            // Check if the element is the specific bot protection quest
            if (
              element.id === 'botprotection_quest' &&
              element.classList.contains('quest')
            ) {
              console.log('Detected bot protection quest dynamically added:', element);
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.QUEST_LOG);
            }

            // Check if the element is the specific bot protection row with captcha (higher priority than regular content)
            if (
              element.tagName === 'TD' &&
              element.classList.contains('bot-protection-row') &&
              element.querySelector('.captcha iframe')
            ) {
              console.log('Detected bot protection row with captcha dynamically added:', element);
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.CONTENT_TEST);
              return;
            }

            // Check if the element is the specific bot protection row
            if (
              element.tagName === 'TD' &&
              element.classList.contains('bot-protection-row')
            ) {
              console.log('Detected bot protection row dynamically added:', element);
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.CONTENT);
            }

            // Check within the subtree for hcaptcha iframe (highest priority)
            const innerHcaptchaIframes = element.querySelectorAll(
              'iframe[src*="hcaptcha.com/captcha"]'
            );

            // Filter the iframes to exclude those inside table.main or with aria-hidden="true" ancestors
            const validInnerHcaptchaIframes = Array.from(innerHcaptchaIframes).filter(iframe => {
              // Check if this iframe is inside a table with class "main"
              const isInsideMainTable = !!(iframe as HTMLElement).closest('table.main');

              // Check if any ancestor has aria-hidden="true"
              let parent = iframe.parentElement;
              let hasAriaHiddenAncestor = false;
              while (parent && !hasAriaHiddenAncestor) {
                if (parent.getAttribute('aria-hidden') === 'true') {
                  hasAriaHiddenAncestor = true;
                }
                parent = parent.parentElement;
              }

              // We want iframes that are NOT inside a table with class "main" and do NOT have an ancestor with aria-hidden="true"
              return !isInsideMainTable && !hasAriaHiddenAncestor;
            });

            if (validInnerHcaptchaIframes.length > 0) {
              console.log(
                'Detected hcaptcha modal iframe dynamically added inside a subtree:',
                validInnerHcaptchaIframes[0]
              );
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
              // Stop observing since this has highest precedence
              //observer.disconnect();
              return;
            }

            // Check within the subtree for bot protection popup (highest priority)
            const innerBotProtectionPopup = element.querySelector(
              '#popup_box_bot_protection, [data-id="bot_protection"]'
            ) as HTMLElement | null;
            if (innerBotProtectionPopup) {
              console.log(
                'Detected bot protection popup dynamically added inside a subtree:',
                innerBotProtectionPopup
              );
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.POPUP_TEST);
              // Stop observing since this has highest precedence
              //observer.disconnect();
              return;
            }

            // Check within the subtree for bot protection quest
            const innerBotProtectionQuest = element.querySelector(
              '#botprotection_quest'
            ) as HTMLElement | null;
            if (innerBotProtectionQuest) {
              console.log(
                'Detected bot protection quest dynamically added inside a subtree:',
                innerBotProtectionQuest
              );
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.QUEST_LOG);
            }

            // Check within the subtree for bot protection row with captcha (higher priority than regular content)
            const innerBotProtectionRowWithCaptcha = element.querySelector(
              'td.bot-protection-row .captcha iframe'
            ) as HTMLElement | null;
            if (innerBotProtectionRowWithCaptcha) {
              const parentRow = innerBotProtectionRowWithCaptcha.closest('td.bot-protection-row') as HTMLElement | null;
              if (parentRow) {
                console.log(
                  'Detected bot protection row with captcha dynamically added inside a subtree:',
                  parentRow
                );
                anyMethodPreviouslyDetected = true;
                onBotCheck(BotCheckStatus.CONTENT_TEST);
                return;
              }
            }

            // Check within the subtree for bot protection row
            const innerBotProtectionRow = element.querySelector(
              'td.bot-protection-row'
            ) as HTMLElement | null;
            if (innerBotProtectionRow) {
              console.log(
                'Detected bot protection row dynamically added inside a subtree:',
                innerBotProtectionRow
              );
              anyMethodPreviouslyDetected = true;
              onBotCheck(BotCheckStatus.CONTENT);
            }
          }
        });
      }
    }
  });

  // Start observing the root element
  observer.observe(rootElement, {
    childList: true, // Observe changes to child elements
    subtree: true, // Observe all child nodes recursively
    attributes: true, // Observe attribute changes
    attributeFilter: ['aria-hidden'], // Only observe changes to aria-hidden attribute
  });

  // Check if the hcaptcha modal exists on initial load (highest priority)
  const allHcaptchaIframes = rootElement.querySelectorAll('iframe[src*="hcaptcha.com/captcha"]');
  const validHcaptchaIframes = Array.from(allHcaptchaIframes).filter(iframe => {
    // Check if this iframe is inside a table with class "main"
    const isInsideMainTable = !!(iframe as HTMLElement).closest('table.main');

    // Check if any ancestor has aria-hidden="true"
    let parent = iframe.parentElement;
    let hasAriaHiddenAncestor = false;
    while (parent && !hasAriaHiddenAncestor) {
      if (parent.getAttribute('aria-hidden') === 'true') {
        hasAriaHiddenAncestor = true;
      }
      parent = parent.parentElement;
    }

    // We want iframes that are NOT inside a table with class "main" and do NOT have an ancestor with aria-hidden="true"
    return !isInsideMainTable && !hasAriaHiddenAncestor;
  });

  if (validHcaptchaIframes.length > 0) {
    console.log('Detected hcaptcha modal on initial load:', validHcaptchaIframes[0]);
    anyMethodPreviouslyDetected = true;
    onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
  }

  // Check if the bot protection popup exists on initial load (highest priority)
  const botProtectionPopup = rootElement.querySelector('#popup_box_bot_protection, [data-id="bot_protection"]') as HTMLElement | null;
  if (botProtectionPopup) {
    console.log('Detected bot protection popup on initial load:', botProtectionPopup);
    anyMethodPreviouslyDetected = true;
    onBotCheck(BotCheckStatus.POPUP_TEST);
  }

  // Check if the bot protection row with captcha exists on initial load (higher priority than regular content)
  const botProtectionRowWithCaptcha = rootElement.querySelector('td.bot-protection-row .captcha iframe') as HTMLElement | null;
  if (botProtectionRowWithCaptcha) {
    const parentRow = botProtectionRowWithCaptcha.closest('td.bot-protection-row') as HTMLElement | null;
    if (parentRow) {
      console.log('Detected bot protection row with captcha on initial load:', parentRow);
      anyMethodPreviouslyDetected = true;
      onBotCheck(BotCheckStatus.CONTENT_TEST);
      //return () => observer.disconnect();
    }
  }

  // Check if the bot protection quest exists on initial load
  const botProtectionQuest = rootElement.querySelector('#botprotection_quest') as HTMLElement | null;
  if (botProtectionQuest) {
    console.log('Detected bot protection quest on initial load:', botProtectionQuest);
    anyMethodPreviouslyDetected = true;
    onBotCheck(BotCheckStatus.QUEST_LOG);
  }

  // Check if the bot protection row exists on initial load
  const botProtectionRow = rootElement.querySelector('td.bot-protection-row') as HTMLElement | null;
  if (botProtectionRow) {
    console.log('Detected bot protection row on initial load:', botProtectionRow);
    anyMethodPreviouslyDetected = true;
    onBotCheck(BotCheckStatus.CONTENT);
  }

  // Check if all methods have disappeared on initial load
  if (detectAllMethodsDisappeared && anyMethodPreviouslyDetected && checkAllMethodsDisappeared()) {
    console.log('Detected all bot protection methods have disappeared on initial load');
    onBotCheck(BotCheckStatus.NONE);
  }

  // Check if no bot protection elements were found on initial load
  if (!anyMethodPreviouslyDetected) {
    console.log('No bot protection elements found on initial load');
    onBotCheck(BotCheckStatus.NONE);
  }

  console.log('Started observing for bot protection elements (quests, rows with and without captcha, popups, hcaptcha modals, forced protection, and blur protection).');
  if (detectAllMethodsDisappeared) {
    console.log('Also observing for all methods disappearing');
  }

  // Return a cleanup function to stop the observation
  return () => {
    observer.disconnect();
  };
}
