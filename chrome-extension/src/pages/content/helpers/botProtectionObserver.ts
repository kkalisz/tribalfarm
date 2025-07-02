import { BotCheckStatus } from '@pages/content/helpers/BotCheckStatus';

/**
 * Observes the DOM for the presence of a specific "bot protection" quest div
 * and executes the provided callback function when the element is detected.
 *
 * @param onBotCheck - A callback function to execute when the "bot protection" quest element is detected.
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

  // Check if the bot protection quest exists on initial load
  const botProtectionQuest = rootElement.querySelector('#botprotection_quest') as HTMLElement | null;
  if (botProtectionQuest) {
    console.log('Detected bot protection quest on initial load:', botProtectionQuest);
    onBotCheck(BotCheckStatus.QUEST_LOG);
  }

  // MutationObserver to observe DOM changes
  const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Check added nodes for the target element
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;

            // Check if the element is the specific bot protection quest
            if (
              element.id === 'botprotection_quest' &&
              element.classList.contains('quest')
            ) {
              console.log('Detected bot protection quest dynamically added:', element);
              onBotCheck(BotCheckStatus.QUEST_LOG);
            }

            // Check within the subtree
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

  console.log('Started observing for bot protection quests.');

  // Return a cleanup function to stop the observation
  return () => observer.disconnect();
}