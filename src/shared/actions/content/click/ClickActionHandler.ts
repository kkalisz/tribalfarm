
import {doneResponse, GenericStatusPayload} from "@src/shared/actions/content/core/types";
import {ActionHandler} from "@src/shared/actions/content/core/ActionHandler";
import { ActionContext } from "@src/shared/actions/content/core/ActionContext";
import {ClickAction, ClickActionResponse} from "@src/shared/actions/content/click/ClickAction";

export class ClickActionHandler implements ActionHandler<ClickAction, ClickActionResponse> {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(action: ClickAction, context: ActionContext): Promise<GenericStatusPayload<ClickActionResponse>> {
    let allClicksDone = true;

    console.log("click action before")

    if(context.isCurrentActionRestored){
      return doneResponse<ClickActionResponse>({
        allClicksDone: true
      })
    }

    console.log("click action")
    // Process each input from the action parameters
    for (const input of action.inputs) {
      // Find the element using the selector
      const element = document.querySelector(input.selector) as HTMLElement;

      // If element not found, mark as failed and continue to next input
      if (!element) {
        console.error(`Element with selector ${input.selector} not found`);
        allClicksDone = false;
        continue;
      }

      try {
        // Simulate a user click by dispatching mouse events
        // First, mousedown event
        const mousedownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        element.dispatchEvent(mousedownEvent);

        // Then, mouseup event
        const mouseupEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        element.dispatchEvent(mouseupEvent);

        // Finally, click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        element.dispatchEvent(clickEvent);

        console.log(`Successfully clicked element with selector ${input.selector}`);
      } catch (error) {
        console.error(`Failed to click element with selector ${input.selector}:`, error);
        allClicksDone = false;
      }
    }

    // Return response with status of all clicks
    return doneResponse<ClickActionResponse>({
      allClicksDone
    });
  }
}
