
import {doneResponse, GenericStatusPayload, inProgressResponse} from "@src/shared/actions/content/core/types";
import {ActionHandler} from "@src/shared/actions/content/core/ActionHandler";
import { ActionContext } from "@src/shared/actions/content/core/ActionContext";
import {
  NavigateToPageAction,
  NavigateToPageActionResponse
} from "@src/shared/actions/content/navigateToPage/NavigateToPageAction";

export class NavigateToPageActionHandler implements ActionHandler<NavigateToPageAction, NavigateToPageActionResponse> {

  async execute(action: NavigateToPageAction, context: ActionContext): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {

    const isTheSameUrl = window.location.href === action.url;
    if(isTheSameUrl && context.isCurrentActionRestored){
      // If we need to wait for a specific element
      if (action.waitForSelector) {
        return this.waitForElement(action, {
          wasReloaded: true
        });
      }
      
      return doneResponse<NavigateToPageActionResponse>({
        wasReloaded: true
      });
    }

    if(isTheSameUrl && !!action.reload){
      // If we need to wait for a specific element
      if (action.waitForSelector) {
        return this.waitForElement(action, {
          wasReloaded: false
        });
      }
      
      return doneResponse({
        wasReloaded: false
      });
    }

    window.location.href = action.url;
    return inProgressResponse();
  }

  private async waitForElement(
    action: NavigateToPageAction, 
    responsePayload: NavigateToPageActionResponse
  ): Promise<GenericStatusPayload<NavigateToPageActionResponse>> {
    // Default timeout of 10 seconds if not specified
    const timeout = action.waitTimeout || 10000;
    const selector = action.waitForSelector as string;
    
    try {
      const element = document.querySelector(selector);
      
      // If element already exists, return done response
      if (element) {
        return doneResponse<NavigateToPageActionResponse>(responsePayload);
      }
      
      // Set up a promise that resolves when the element is found or rejects on timeout
      const waitPromise = new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        
        const checkInterval = setInterval(() => {
          const element = document.querySelector(selector);
          
          if (element) {
            clearInterval(checkInterval);
            resolve();
          } else if (Date.now() - startTime > timeout) {
            clearInterval(checkInterval);
            reject(new Error(`Timeout waiting for element: ${selector}`));
          }
        }, 100); // Check every 100ms
      });
      
      await waitPromise;
      return doneResponse<NavigateToPageActionResponse>(responsePayload);
    } catch (error) {
      // If timeout or other error, still return done but log the error
      console.error('Error waiting for element:', error);
      return doneResponse<NavigateToPageActionResponse>(responsePayload);
    }
  }
}

