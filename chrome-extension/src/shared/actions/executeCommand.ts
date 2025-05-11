import { CommandMessage } from '@src/shared/actions/core/types';
import { executeClickAction } from '@pages/content/execute/executeClickAction';
import { executeInputAction } from '@pages/content/execute/executeInputAction';
import { executeNavigateAction } from '@pages/content/execute/executeNavigateAction';
import { executeExtractAction } from '@pages/content/execute/executeExtractAction';
import {executeNavigateToScreenAction} from "@pages/content/execute/executeNavigateToScreenAction";
import {NavigateToScreenActionPayload} from "@src/shared/models/actions/NavigateToScreenAction";
import {pageStatusActionHandler} from "@src/shared/actions/pageStatus/PageStatusActionHandler";
import {ActionExecutor} from "@src/shared/actions/core/AcitionExecutor";

// Execute a command on the page
export async function executeCommand(actionExecutor: ActionExecutor, command: CommandMessage): Promise<{ status: string, details?: any }> {
    console.log(`Executing command: ${command.payload.action} ${JSON.stringify(command.payload)}`);
    // Implement different actions based on the command
    if(!actionExecutor.canHandleAction(command.payload.action)){
        console.log(`Action ${command.payload.action} is not supported`);
        return {status: 'error', details: {reason: 'action not supported'}};
    }
    return await actionExecutor.execute(
        command.payload.action,
        command.payload.parameters)

    // switch (command.payload.action) {
    //     case 'pageStatusAction':
    //         return await pageStatusActionHandler(command.payload.parameters);
    //     case 'click':
    //         return await executeClickAction(command.payload.parameters);
    //     case 'input':
    //         return await executeInputAction(command.payload.parameters);
    //     case 'navigate':
    //         return await executeNavigateAction(command.payload.parameters);
    //     case 'navigateToScreenAction':
    //         return await executeNavigateToScreenAction(command.payload as NavigateToScreenActionPayload);
    //     case 'userVillages':
    //         return await executeNavigateToScreenAction(command.payload as NavigateToScreenActionPayload);
    //     case 'extract':
    //         return await executeExtractAction(command.payload.parameters);
    //     default:
    //         // Simulate command execution for testing
    //         return new Promise((resolve, reject) => {
    //             setTimeout(() => {
    //                 if (Math.random() > 0.2) { // 80% success rate for testing
    //                     resolve({status: 'done', details: {result: 'success'}});
    //                 } else {
    //                     reject({message: 'Command failed', details: {reason: 'random failure'}});
    //                 }
    //             }, 2000);
    //         });
    // }
}