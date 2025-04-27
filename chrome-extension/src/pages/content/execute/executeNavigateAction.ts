// Execute a navigate action
export async function executeNavigateAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
    const {url} = parameters;

    if (!url) {
        throw {message: 'Missing url parameter', details: {parameters}};
    }

    try {
        window.location.href = url;
        return {status: 'in-progress', details: {action: 'navigate', url}};
    } catch (error) {
        throw {message: 'Navigation action failed', details: {error, url}};
    }
}