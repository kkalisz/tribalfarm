
import {doneResponse, GenericStatusPayload} from "@src/shared/actions/content/core/types";
import {ActionHandler} from "@src/shared/actions/content/core/ActionHandler";
import { ActionContext } from "@src/shared/actions/content/core/ActionContext";
import {FillInputAction, FillInputActionResponse} from "@src/shared/actions/content/fillInput/FillInputAction";

export class FillInputActionHandler implements ActionHandler<FillInputAction, FillInputActionResponse> {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(action: FillInputAction, _context: ActionContext): Promise<GenericStatusPayload<FillInputActionResponse>> {
    let allInputsFilledCorrectly = true;

    console.log("fill input action")

    // Process each input from the action parameters
    for (const input of action.inputs) {
      // Find the element using the selector
      const element = document.querySelector(input.selector) as HTMLInputElement;

      // If element not found, mark as failed and continue to next input
      if (!element) {
        console.error(`Element with selector ${input.selector} not found`);
        allInputsFilledCorrectly = false;
        continue;
      }

      // Set the value of the input
      element.value = input.value;

      // Trigger input event to simulate user input
      const inputEvent = new Event('input', { bubbles: true });
      element.dispatchEvent(inputEvent);

      // Trigger change event to ensure any listeners are notified
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);

      // Verify the value was set correctly
      if (element.value !== input.value) {
        console.error(`Failed to set value for element with selector ${input.selector}`);
        allInputsFilledCorrectly = false;
      }
    }

    // Return response with status of all inputs
    return doneResponse<FillInputActionResponse>({
      allInputsFilledCorrectly
    });
  }
}
