// Content script for Tribal Farm Chrome Extension
import { DOMUtils } from './domUtils';
import { overlayManager } from './overlayManager';

interface ElementSelectionOptions {
    text?: string;
    selector?: string;
    exact?: boolean;
    timeout?: number;
    visible?: boolean;
}

export class ContentScript {
    private static instance: ContentScript;
    private cleanupHandlers: (() => void)[] = [];
    private static readonly DEFAULT_TIMEOUT = 5000;
    private static readonly SELECTOR_TIMEOUT = 100;

    private constructor() {
        console.log('Content script initialized');
        this.setupCleanup();
        this.initializeDomainSpecificUI();
    }

    private initializeDomainSpecificUI() {
        const currentDomain = window.location.hostname;
        if (currentDomain === 'plemiona.pl') {
            const sideDiv = document.createElement('div');
            sideDiv.id = 'tribal-farm-side-panel';
            sideDiv.className = 'tribal-farm-side-panel';
            document.body.appendChild(sideDiv);
        }
    }

    public static getInstance(): ContentScript {
        if (!ContentScript.instance) {
            ContentScript.instance = new ContentScript();
        }
        return ContentScript.instance;
    }

    /**
     * Selects an element based on provided options
     */
    public async selectElement(options: ElementSelectionOptions): Promise<HTMLElement | null> {
        try {
            const timeout = options.timeout || 
                (options.selector ? ContentScript.SELECTOR_TIMEOUT : ContentScript.DEFAULT_TIMEOUT);

            // Show searching overlay
            overlayManager.showOverlay('element-search', {
                title: 'Searching for Element',
                message: options.text 
                    ? `Looking for text: "${options.text}"${options.exact ? ' (exact match)' : ''}`
                    : `Looking for element: ${options.selector}`,
                duration: timeout
            });

            if (options.text) {
                // Try to find by text first
                const element = DOMUtils.findElementByText(options.text, {
                    exact: options.exact,
                    selector: options.selector
                });

                if (element && (!options.visible || DOMUtils.isElementVisible(element))) {
                    overlayManager.showOverlay('element-found', {
                        title: 'Element Found',
                        message: 'Successfully found the requested element.',
                        targetElement: element,
                        duration: 2000
                    });
                    return element;
                }
            }

            if (options.selector) {
                // Wait for element if selector is provided, with a shorter timeout for non-existent elements
                const element = await Promise.race([
                    DOMUtils.waitForElement(options.selector, {
                        timeout,
                        visible: options.visible
                    }),
                    new Promise<null>((resolve) => 
                        setTimeout(() => resolve(null), timeout)
                    )
                ]);

                if (element) {
                    overlayManager.showOverlay('element-found', {
                        title: 'Element Found',
                        message: 'Successfully found the requested element.',
                        targetElement: element,
                        duration: 2000
                    });
                }

                return element;
            }

            overlayManager.showOverlay('element-not-found', {
                title: 'Element Not Found',
                message: 'Could not find the requested element on the page.',
                duration: 3000
            });
            return null;
        } catch (error) {
            console.error('Error selecting element:', error);
            return null;
        }
    }

    /**
     * Clicks an element with optional verification
     */
    public async clickElement(element: HTMLElement, verifyClick: boolean = true): Promise<boolean> {
        try {
            if (!DOMUtils.isElementVisible(element)) {
                overlayManager.showOverlay('click-error', {
                    title: 'Click Error',
                    message: 'Cannot click invisible element',
                    duration: 3000
                });
                console.error('Cannot click invisible element');
                return false;
            }

            // Show clicking overlay
            overlayManager.showOverlay('clicking', {
                title: 'Clicking Element',
                message: 'Attempting to click the element...',
                targetElement: element,
                duration: 1000
            });

            DOMUtils.simulateClick(element);

            if (verifyClick) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Show success overlay
            overlayManager.showOverlay('click-success', {
                title: 'Click Successful',
                message: 'Element was clicked successfully',
                targetElement: element,
                duration: 2000
            });

            return true;
        } catch (error) {
            overlayManager.showOverlay('click-error', {
                title: 'Click Error',
                message: 'Failed to click the element: ' + (error instanceof Error ? error.message : 'Unknown error'),
                targetElement: element,
                duration: 3000
            });
            console.error('Error clicking element:', error);
            return false;
        }
    }

    /**
     * Extracts content from a table element
     * @param tableElement - Table element or selector
     * @returns Extracted table data or null if table not found
     */
    public async extractTableContent(tableElement: HTMLTableElement | string): Promise<Record<string, string>[] | null> {
        try {
            const table = typeof tableElement === 'string'
                ? await this.selectElement({ 
                    selector: tableElement,
                    timeout: ContentScript.SELECTOR_TIMEOUT
                }) as HTMLTableElement
                : tableElement;

            if (!table || table.tagName !== 'TABLE') {
                console.error('Invalid table element');
                return null;
            }

            return DOMUtils.extractTableData(table);
        } catch (error) {
            console.error('Error extracting table content:', error);
            return null;
        }
    }

    /**
     * Extracts content from a list element
     * @param listElement - List element or selector
     * @returns Extracted list data or null if list not found
     */
    public async extractListContent(listElement: HTMLElement | string): Promise<any[] | null> {
        try {
            const list = typeof listElement === 'string'
                ? await this.selectElement({ 
                    selector: listElement,
                    timeout: ContentScript.SELECTOR_TIMEOUT
                })
                : listElement;

            if (!list || (list.tagName !== 'UL' && list.tagName !== 'OL')) {
                console.error('Invalid list element');
                return null;
            }

            return DOMUtils.extractListData(list as HTMLUListElement | HTMLOListElement);
        } catch (error) {
            console.error('Error extracting list content:', error);
            return null;
        }
    }

    /**
     * Extracts formatted content from an element
     * @param element - Source element or selector
     * @returns Extracted formatted content or null if element not found
     */
    public async extractFormattedContent(element: HTMLElement | string): Promise<{
        text: string,
        format: {
            bold: boolean,
            italic: boolean,
            underline: boolean
        }
    }[] | null> {
        try {
            const targetElement = typeof element === 'string'
                ? await this.selectElement({ 
                    selector: element,
                    timeout: ContentScript.SELECTOR_TIMEOUT
                })
                : element;

            if (!targetElement) {
                console.error('Element not found');
                return null;
            }

            return DOMUtils.extractFormattedContent(targetElement);
        } catch (error) {
            console.error('Error extracting formatted content:', error);
            return null;
        }
    }

    /**
     * Extracts metadata from an element
     * @param element - Source element or selector
     * @returns Extracted metadata or null if element not found
     */
    public async extractMetadata(element: HTMLElement | string): Promise<{
        links: { text: string, href: string }[],
        images: { alt: string, src: string }[],
        metadata: Record<string, string>
    } | null> {
        try {
            const targetElement = typeof element === 'string'
                ? await this.selectElement({ 
                    selector: element,
                    timeout: ContentScript.SELECTOR_TIMEOUT
                })
                : element;

            if (!targetElement) {
                console.error('Element not found');
                return null;
            }

            return DOMUtils.extractMetadata(targetElement);
        } catch (error) {
            console.error('Error extracting metadata:', error);
            return null;
        }
    }

    /**
     * Extracts content from a page or specific element while preserving semantic structure
     * @param element - Optional element or selector to extract content from (defaults to entire page)
     * @returns Structured content from the page or element
     */
    public async extractPageContent(element?: HTMLElement | string): Promise<{
        type: string,
        content: any,
        sections: {
            type: string,
            role: string,
            content: any
        }[]
    } | null> {
        try {
            const targetElement = element
                ? (typeof element === 'string'
                    ? await this.selectElement({
                        selector: element,
                        timeout: ContentScript.SELECTOR_TIMEOUT
                    })
                    : element)
                : document.body;

            if (!targetElement) {
                console.error('Element not found');
                return null;
            }

            return DOMUtils.extractPageContent(targetElement);
        } catch (error) {
            console.error('Error extracting page content:', error);
            return null;
        }
    }

    private setupCleanup(): void {
        const cleanup = () => {
            this.cleanupHandlers.forEach(handler => handler());
            this.cleanupHandlers = [];
        };

        window.addEventListener('unload', cleanup);
        this.cleanupHandlers.push(() => window.removeEventListener('unload', cleanup));
    }
}

// Initialize the content script only in browser environment
if (typeof window !== 'undefined') {
    const contentScript = ContentScript.getInstance();
    // Export for external usage
    (window as any).tribalFarmContent = contentScript;
}
