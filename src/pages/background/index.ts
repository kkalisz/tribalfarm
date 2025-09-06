import { logInfo} from "@src/shared/helpers/sendLog";
import {MessageHandler, MessageRouter} from '@src/shared/services/MessageRouter';
import {WorldSandbox} from '@pages/background/WorldSandbox';
import {BaseMessage} from '@src/shared/actions/content/core/types';

const playerServiceCache = new Map<string, WorldSandbox>();

const messageRouter = new MessageRouter("fullDomain", (router: MessageRouter, value: string): MessageHandler<any> => {
  const nestedRouter = router.createNestedRouter(value, "type");
  const worldSandbox = new WorldSandbox(value, nestedRouter);
  playerServiceCache.set(value,worldSandbox);
  nestedRouter.addListener("invalidate" ,(message: BaseMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    worldSandbox.invalidate()
    router.removeListener(value)
    playerServiceCache.delete(value)

    return false;
  });
  return (message: BaseMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean => {
    return nestedRouter.call(message, sender, sendResponse);
  }
});

logInfo('Service worker initialized');
