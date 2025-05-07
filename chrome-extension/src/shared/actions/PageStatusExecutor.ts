import {CommandMessage} from "@src/shared/types";
import {
  executeClickAction,
  executeExtractAction,
  executeInputAction,
  executeNavigateAction
} from "@pages/content/execute";
import {executeNavigateToScreenAction} from "@pages/content/execute/executeNavigateToScreenAction";
import {NavigateToScreenActionPayload} from "@src/shared/models/actions/NavigateToScreenAction";
import {PageStatusAction, PageStatusResponse} from "@src/shared/actions/PageStatusAction";

export async function executeCommand(command: PageStatusAction): Promise<PageStatusResponse> {

