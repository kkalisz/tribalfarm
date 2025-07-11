// Execute an extract action
export async function executeExtractAction(parameters: Record<string, any>): Promise<{ status: string, details?: any }> {
    const {selector} = parameters;

    if (!selector) {
        throw {message: 'Missing selector parameter', details: {parameters}};
    }

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
        throw {message: 'Elements not found', details: {selector}};
    }

    try {
        const extractedData = Array.from(elements).map(el => ({
            text: el.textContent?.trim(),
            html: el.innerHTML,
            attributes: Array.from((el as Element).attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {} as Record<string, string>)
        }));

        return {
            status: 'done',
            details: {
                action: 'extract',
                selector,
                count: extractedData.length,
                data: extractedData
            }
        };
    } catch (error) {
        throw {message: 'Extract action failed', details: {error, selector}};
    }
}