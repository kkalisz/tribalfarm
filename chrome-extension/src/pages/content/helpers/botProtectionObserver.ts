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
 * Note: BotCheckStatus.HCAPTCHA_MODAL and BotCheckStatus.POPUP_TEST take precedence over all other types.
 * BotCheckStatus.CONTENT_TEST takes precedence over QUEST_LOG and CONTENT.
 * BotCheckStatus.FORCED_PROTECTION and BotCheckStatus.BLUR_PROTECTION are additional indicators.
 *
 * @param onBotCheck - A callback function to execute when a bot protection element is detected.
 * @param rootElement - Optional root element to observe. Defaults to `document.body`.
 * @returns A function for stopping the observation.
 */
export function observeBotProtectionQuest(
  onBotCheck: (isDetected: BotCheckStatus) => void,
  rootElement: HTMLElement = document.body
): () => void {
  // Ensure the `onBotCheck` parameter is a valid function
  if (!onBotCheck || typeof onBotCheck !== 'function') {
    throw new Error('A valid onBotCheck function must be provided as the first parameter.');
  }

  // Flag to track if we've already detected and handled a bot check
  let botCheckDetected = false;

  // MutationObserver to observe DOM changes
  const observer = new MutationObserver((mutationsList: MutationRecord[]) => {

    // console.log(`mutation done: ${JSON.stringify(mutationsList.map(m => ({
    //   type: m.type,
    //   removed: m.removedNodes.length,
    //   added: m.addedNodes.length, // Example of an added property
    //   target: m.target.nodeName,  // The tag name of the target node
    //   attributeName: m.attributeName || null, // Name of the changed attribute (if applicable)
    // })), null, 2)}`);

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
          //console.log('Added node:', JSON.stringify({ type: node.nodeType, o: node.nodeName, tc: node.textContent}, null, 2));
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            console.log(JSON.stringify({
              tag: element.tagName,
              attr: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value,
              })),
            }, null, 2));


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
                botCheckDetected = true;
                onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
                // Stop observing since this has highest precedence
                ////observer.disconnect();
                return;
              }
            }

            // Check if the element is the specific bot protection popup (highest priority)
            if (
              element.id === 'popup_box_bot_protection' ||
              element.getAttribute('data-id') === 'bot_protection'
            ) {
              console.log('Detected bot protection popup dynamically added:', element);
              botCheckDetected = true;
              onBotCheck(BotCheckStatus.POPUP_TEST);
              // Stop observing since this has highest precedence
              ////observer.disconnect();
              return;
            }

            // Check if the element is the specific bot protection quest
            if (
              element.id === 'botprotection_quest' &&
              element.classList.contains('quest')
            ) {
              console.log('Detected bot protection quest dynamically added:', element);
              //onBotCheck(BotCheckStatus.QUEST_LOG);
            }

            // Check if the element is the specific bot protection row with captcha (higher priority than regular content)
            if (
              element.tagName === 'TD' &&
              element.classList.contains('bot-protection-row') &&
              element.querySelector('.captcha iframe')
            ) {
              console.log('Detected bot protection row with captcha dynamically added:', element);
              //onBotCheck(BotCheckStatus.CONTENT_TEST);
              return;
            }

            // Check if the element is the specific bot protection row
            if (
              element.tagName === 'TD' &&
              element.classList.contains('bot-protection-row')
            ) {
              console.log('Detected bot protection row dynamically added:', element);
              //onBotCheck(BotCheckStatus.CONTENT);
            }

            // // Check if the element is a div with class "bot-protection-blur"
            // if (
            //   element.tagName === 'DIV' &&
            //   element.classList.contains('bot-protection-blur')
            // ) {
            //   console.log('Detected bot protection blur div dynamically added:', element);
            //   //onBotCheck(BotCheckStatus.BLUR_PROTECTION);
            // }
            //
            // // Check if the element is a body with data-bot-protect="forced" attribute
            // if (
            //   element.tagName === 'BODY' &&
            //   element.getAttribute('data-bot-protect') === 'forced'
            // ) {
            //   console.log('Detected forced bot protection on body element dynamically added:', element);
            //   botCheckDetected = true;
            //   onBotCheck(BotCheckStatus.FORCED_PROTECTION);
            //   // This is a strong indicator, so we can stop observing
            //   ////observer.disconnect();
            //   return;
            // }

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
              botCheckDetected = true;
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
              botCheckDetected = true;
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
              onBotCheck(BotCheckStatus.QUEST_LOG);
            }

            // Check within the subtree for bot protection row with captcha (higher priority than regular content)
            console.log(`type ${element.nodeType} ${element.nodeName} ${element.classList} ${element.classList}`)
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
    botCheckDetected = true;
    onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
    // Stop observing since this has highest precedence
    //observer.disconnect();
    //return () => {}; // Return empty cleanup function since we already disconnected
  }

  // Check if the bot protection popup exists on initial load (highest priority)
  const botProtectionPopup = rootElement.querySelector('#popup_box_bot_protection, [data-id="bot_protection"]') as HTMLElement | null;
  if (botProtectionPopup) {
    console.log('Detected bot protection popup on initial load:', botProtectionPopup);
    botCheckDetected = true;
    onBotCheck(BotCheckStatus.POPUP_TEST);
    // Stop observing since this has highest precedence
    //observer.disconnect();
    //return () => {}; // Return empty cleanup function since we already disconnected
  }

  // Check if the bot protection row with captcha exists on initial load (higher priority than regular content)
  const botProtectionRowWithCaptcha = rootElement.querySelector('td.bot-protection-row .captcha iframe') as HTMLElement | null;
  if (botProtectionRowWithCaptcha) {
    const parentRow = botProtectionRowWithCaptcha.closest('td.bot-protection-row') as HTMLElement | null;
    if (parentRow) {
      console.log('Detected bot protection row with captcha on initial load:', parentRow);
      botCheckDetected = true;
      onBotCheck(BotCheckStatus.CONTENT_TEST);
      //return () => observer.disconnect();
    }
  }

  // Check if the bot protection quest exists on initial load
  const botProtectionQuest = rootElement.querySelector('#botprotection_quest') as HTMLElement | null;
  if (botProtectionQuest) {
    console.log('Detected bot protection quest on initial load:', botProtectionQuest);
    onBotCheck(BotCheckStatus.QUEST_LOG);
  }

  // Check if the bot protection row exists on initial load
  const botProtectionRow = rootElement.querySelector('td.bot-protection-row') as HTMLElement | null;
  if (botProtectionRow) {
    console.log('Detected bot protection row on initial load:', botProtectionRow);
    onBotCheck(BotCheckStatus.CONTENT);
  }

  // Check if the body has data-bot-protect="forced" attribute on initial load
  // if (document.body.getAttribute('data-bot-protect') === 'forced') {
  //   console.log('Detected forced bot protection on body element on initial load');
  //   botCheckDetected = true;
  //   onBotCheck(BotCheckStatus.FORCED_PROTECTION);
  //   // This is a strong indicator, so we can stop observing
  //   //observer.disconnect();
  //   //return () => {}; // Return empty cleanup function since we already disconnected
  // }
  //
  // // Check if the bot protection blur div exists on initial load
  // const botProtectionBlur = rootElement.querySelector('.bot-protection-blur') as HTMLElement | null;
  // if (botProtectionBlur) {
  //   console.log('Detected bot protection blur div on initial load:', botProtectionBlur);
  //   onBotCheck(BotCheckStatus.BLUR_PROTECTION);
  // }

  console.log('Started observing for bot protection elements (quests, rows with and without captcha, popups, hcaptcha modals, forced protection, and blur protection).');

  // Set up a periodic check for hcaptcha iframe as a fallback
  // This is needed because some iframes might be added directly to the body by another iframe
  // which might not trigger the MutationObserver
  const intervalId = setInterval(() => {
    // if (botCheckDetected) {
    //   clearInterval(intervalId);
    //   return;
    // }

    console.log('Checking for hcaptcha iframe in periodic check...');
    // Get all hcaptcha iframes
    const allHcaptchaIframes = document.querySelectorAll('iframe[src*="hcaptcha.com/captcha"]');

    // Filter out iframes that are inside a table with class "main" or have an ancestor with aria-hidden="true"
    const hcaptchaIframesNotInMainTable = Array.from(allHcaptchaIframes).filter(iframe => {
      // Check if this iframe is inside a table with class "main"
      const isInsideMainTable = !!iframe.closest('table.main');

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

    hcaptchaIframesNotInMainTable.forEach(iframe => {
      let parent = iframe.parentElement;
      const parentClassNames = [];

      // Traverse up the DOM and collect class names
      while (parent) {
        if (parent.className) {
          parentClassNames.push(parent.className);
        }
        parent = parent.parentElement;
      }

      // Log the class names for this iframe's ancestors
      console.log(`Iframe Parents' Class Names:`, parentClassNames);
    });


    if (hcaptchaIframesNotInMainTable.length) {
      console.log(`Detected hcaptcha modal in periodic check (not inside table.main): ${hcaptchaIframesNotInMainTable.length}`, hcaptchaIframesNotInMainTable);
      //botCheckDetected = true;
      onBotCheck(BotCheckStatus.HCAPTCHA_MODAL);
      ////observer.disconnect();
      //clearInterval(intervalId);
    }
  }, 1000); // Check every second

  // Return a cleanup function to stop the observation and clear the interval
  return () => {
    //observer.disconnect();
    //clearInterval(intervalId);
  };
}
