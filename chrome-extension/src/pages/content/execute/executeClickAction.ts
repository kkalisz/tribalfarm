// Execute a click action
export async function executeClickAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
    const {selector} = parameters;

    if (!selector) {
        throw {message: 'Missing selector parameter', details: {parameters}};
    }

    const element = document.querySelector(selector);
    if (!element) {
        throw {message: 'Element not found', details: {selector}};
    }

    try {
        (element as HTMLElement).click();
        return {status: 'done', details: {action: 'click', selector}};
    } catch (error) {
        throw {message: 'Click action failed', details: {error, selector}};
    }
}