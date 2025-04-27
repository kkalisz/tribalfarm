// Execute an input action
export async function executeInputAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
    const {selector, value} = parameters;

    if (!selector || value === undefined) {
        throw {message: 'Missing required parameters', details: {parameters}};
    }

    const element = document.querySelector(selector) as HTMLInputElement;
    if (!element) {
        throw {message: 'Element not found', details: {selector}};
    }

    try {
        element.value = value;
        element.dispatchEvent(new Event('input', {bubbles: true}));
        element.dispatchEvent(new Event('change', {bubbles: true}));
        return {status: 'done', details: {action: 'input', selector, value}};
    } catch (error) {
        throw {message: 'Input action failed', details: {error, selector, value}};
    }
}