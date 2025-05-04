import {
    NavigateToScreenActionPayload
} from "@src/shared/models/actions/NavigateToScreenAction";
import {generateTribalWarsUrl} from "@src/shared/helpers/location/generateTribalWarsUrl";

export async function executeNavigateToScreenAction(action: NavigateToScreenActionPayload): Promise<{ status: string, details?: any }> {
    const { parameters: { screen, villageId } } = action;
    //TODO mode
    const url = generateTribalWarsUrl(window.location.href, villageId!, screen)
    //TODO verify is on the page
    //TODO verify force reloads

    try {
        window.location.href = url;
        return {status: 'in-progress', details: {action: 'navigate', url}};
    } catch (error) {
        throw {message: 'Navigation action failed', details: {error, url}};
    }
}