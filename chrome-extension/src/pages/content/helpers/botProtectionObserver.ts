import { BotCheckStatus } from '@pages/content/helpers/BotCheckStatus';

/**
 * Observes the DOM for the presence of bot protection elements and executes 
 * the provided callback function when such elements are detected.
 * 
 * Detects four types of bot protection:
 * 1. "Bot protection" quest div with id 'botprotection_quest' (returns BotCheckStatus.QUEST_LOG)
 * 2. TD element with class 'bot-protection-row' (returns BotCheckStatus.CONTENT)
 * 3. TD element with class 'bot-protection-row' containing a captcha iframe (returns BotCheckStatus.CONTENT_TEST)
 * 4. Popup with id 'popup_box_bot_protection' or data-id 'bot_protection' (returns BotCheckStatus.POPUP_TEST)
 *
 * Note: BotCheckStatus.POPUP_TEST takes precedence over all other types.
 * BotCheckStatus.CONTENT_TEST takes precedence over QUEST_LOG and CONTENT.
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

  // MutationObserver to observe DOM changes
  const observer = new MutationObserver((mutationsList: MutationRecord[]) => {

    console.log(`mutation done: ${JSON.stringify(mutationsList.map(m => ({
      type: m.type,
      removed: m.removedNodes.length,
      added: m.addedNodes.length, // Example of an added property
      target: m.target.nodeName,  // The tag name of the target node
      attributeName: m.attributeName || null, // Name of the changed attribute (if applicable)
    })), null, 2)}`);

    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Check added nodes for the target element
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            console.log(JSON.stringify(element, null, 2))

            // Check if the element is the specific bot protection popup (highest priority)
            if (
              element.id === 'popup_box_bot_protection' ||
              element.getAttribute('data-id') === 'bot_protection'
            ) {
              console.log('Detected bot protection popup dynamically added:', element);
              onBotCheck(BotCheckStatus.POPUP_TEST);
              // Stop observing since this has highest precedence
              observer.disconnect();
              return;
            }

            // Check if the element is the specific bot protection quest
            if (
              element.id === 'botprotection_quest' &&
              element.classList.contains('quest')
            ) {
              console.log('Detected bot protection quest dynamically added:', element);
              onBotCheck(BotCheckStatus.QUEST_LOG);
            }

            // Check if the element is the specific bot protection row with captcha (higher priority than regular content)
            if (
              element.tagName === 'TD' &&
              element.classList.contains('bot-protection-row') &&
              element.querySelector('.captcha iframe')
            ) {
              console.log('Detected bot protection row with captcha dynamically added:', element);
              onBotCheck(BotCheckStatus.CONTENT_TEST);
              return;
            }

            // Check if the element is the specific bot protection row
            if (
              element.tagName === 'TD' &&
              element.classList.contains('bot-protection-row')
            ) {
              console.log('Detected bot protection row dynamically added:', element);
              onBotCheck(BotCheckStatus.CONTENT);
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
              onBotCheck(BotCheckStatus.POPUP_TEST);
              // Stop observing since this has highest precedence
              observer.disconnect();
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

  // Check if the bot protection popup exists on initial load (highest priority)
  const botProtectionPopup = rootElement.querySelector('#popup_box_bot_protection, [data-id="bot_protection"]') as HTMLElement | null;
  if (botProtectionPopup) {
    console.log('Detected bot protection popup on initial load:', botProtectionPopup);
    onBotCheck(BotCheckStatus.POPUP_TEST);
    // Stop observing since this has highest precedence
    observer.disconnect();
    return () => {}; // Return empty cleanup function since we already disconnected
  }

  // Check if the bot protection row with captcha exists on initial load (higher priority than regular content)
  const botProtectionRowWithCaptcha = rootElement.querySelector('td.bot-protection-row .captcha iframe') as HTMLElement | null;
  if (botProtectionRowWithCaptcha) {
    const parentRow = botProtectionRowWithCaptcha.closest('td.bot-protection-row') as HTMLElement | null;
    if (parentRow) {
      console.log('Detected bot protection row with captcha on initial load:', parentRow);
      onBotCheck(BotCheckStatus.CONTENT_TEST);
      return () => observer.disconnect();
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

  console.log('Started observing for bot protection elements (quests, rows with and without captcha, and popups).');

  // Return a cleanup function to stop the observation
  return () => observer.disconnect();
}
