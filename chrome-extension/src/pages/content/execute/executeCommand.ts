import { CommandMessage } from '@src/shared/types';
import { executeClickAction } from './executeClickAction';
import { executeInputAction } from './executeInputAction';
import { executeNavigateAction } from './executeNavigateAction';
import { executeExtractAction } from './executeExtractAction';
import {executeNavigateToScreenAction} from "@pages/content/execute/executeNavigateToScreenAction";
import {NavigateToScreenActionPayload} from "@src/shared/models/actions/NavigateToScreenAction";

// Execute a command on the page
export async function executeCommand(command: CommandMessage): Promise<{ status: string, details?: any }> {
    console.log(`Executing command: ${command.payload.action} ${JSON.stringify(command.payload)}`);

    // Implement different actions based on the command
    switch (command.payload.action) {
        case 'click':
            return await executeClickAction(command.payload.parameters);
        case 'input':
            return await executeInputAction(command.payload.parameters);
        case 'navigate':
            return await executeNavigateAction(command.payload.parameters);
        case 'navigateToScreenAction':
            return await executeNavigateToScreenAction(command.payload as NavigateToScreenActionPayload);
        case 'extract':
            return await executeExtractAction(command.payload.parameters);
        default:
            // Simulate command execution for testing
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.2) { // 80% success rate for testing
                        resolve({status: 'done', details: {result: 'success'}});
                    } else {
                        reject({message: 'Command failed', details: {reason: 'random failure'}});
                    }
                }, 2000);
            });
    }
}