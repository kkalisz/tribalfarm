/**
 * DOM Manipulation Utilities
 * Provides a set of utilities for DOM manipulation, element selection, and traversal.
 */

export class DOMUtils {
    /**
     * Simulates a mouse click on an element
     * @param element - Target element
     * @param options - Click options (left, right, middle click)
     */
    static simulateClick(element: HTMLElement, options: { button?: number; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; } = {}): void {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: options.button || 0,
            ctrlKey: options.ctrlKey || false,
            shiftKey: options.shiftKey || false,
            altKey: options.altKey || false,
        });
        element.dispatchEvent(clickEvent);
    }

    /**
     * Finds an element by its text content
     * @param text - Text to search for
     * @param options - Search options
     * @returns HTMLElement or null if not found
     */
    static findElementByText(
        text: string,
        options: {
            exact?: boolean;
            selector?: string;
            context?: Element | Document;
        } = {}
    ): HTMLElement | null {
        const context = options.context || document;
        const elements = options.selector
            ? Array.from(context.querySelectorAll(options.selector))
            : Array.from(context.getElementsByTagName('*'));

        return elements.find((element) => {
            const elementText = element.textContent?.trim() || '';
            return options.exact
                ? elementText === text
                : elementText.includes(text);
        }) as HTMLElement || null;
    }

    /**
     * Checks if an element is visible in the viewport
     * @param element - Target element
     * @returns boolean
     */
    static isElementVisible(element: HTMLElement): boolean {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               rect.width > 0 &&
               rect.height > 0 &&
               rect.top < window.innerHeight &&
               rect.bottom > 0 &&
               rect.left < window.innerWidth &&
               rect.right > 0;
    }

    /**
     * Waits for an element to appear in the DOM
     * @param selector - CSS selector string
     * @param options - Wait options
     * @returns Promise<HTMLElement>
     */
    static waitForElement(
        selector: string,
        options: {
            timeout?: number;
            interval?: number;
            visible?: boolean;
            context?: Element | Document;
        } = {}
    ): Promise<HTMLElement> {
        const timeout = options.timeout || 5000;
        const interval = options.interval || 100;
        const context = options.context || document;
        const checkVisible = options.visible ?? true;

        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElement = () => {
                const element = context.querySelector(selector) as HTMLElement;

                if (element) {
                    if (!checkVisible || DOMUtils.isElementVisible(element)) {
                        resolve(element);
                        return;
                    }
                }

                if (Date.now() - startTime >= timeout) {
                    reject(new Error(`Timeout waiting for element: ${selector}`));
                    return;
                }

                setTimeout(checkElement, interval);
            };

            checkElement();
        });
    }
    /**
     * Finds a single element matching the selector
     * @param selector - CSS selector string
     * @param context - Optional context element (defaults to document)
     * @returns HTMLElement or null if not found
     */
    static querySelector(selector: string, context: Element | Document = document): HTMLElement | null {
        return context.querySelector(selector) as HTMLElement;
    }

    /**
     * Finds all elements matching the selector
     * @param selector - CSS selector string
     * @param context - Optional context element (defaults to document)
     * @returns Array of HTMLElements
     */
    static querySelectorAll(selector: string, context: Element | Document = document): HTMLElement[] {
        return Array.from(context.querySelectorAll(selector)) as HTMLElement[];
    }

    /**
     * Finds element by ID
     * @param id - Element ID
     * @returns HTMLElement or null if not found
     */
    static getElementById(id: string): HTMLElement | null {
        return document.getElementById(id);
    }

    /**
     * Gets the closest ancestor matching the selector
     * @param element - Starting element
     * @param selector - CSS selector string
     * @returns HTMLElement or null if not found
     */
    static closest(element: HTMLElement, selector: string): HTMLElement | null {
        return element.closest(selector) as HTMLElement;
    }

    /**
     * Gets all children of an element
     * @param element - Parent element
     * @returns Array of child elements
     */
    static children(element: HTMLElement): HTMLElement[] {
        return Array.from(element.children) as HTMLElement[];
    }

    /**
     * Gets the parent element
     * @param element - Child element
     * @returns Parent element or null
     */
    static parent(element: HTMLElement): HTMLElement | null {
        return element.parentElement;
    }

    /**
     * Gets all siblings of an element
     * @param element - Target element
     * @returns Array of sibling elements
     */
    static siblings(element: HTMLElement): HTMLElement[] {
        return Array.from(element.parentElement?.children || [])
            .filter(child => child !== element) as HTMLElement[];
    }

    /**
     * Sets or gets element attributes
     * @param element - Target element
     * @param name - Attribute name
     * @param value - Optional value to set
     * @returns Attribute value if getting, void if setting
     */
    static attr(element: HTMLElement, name: string, value?: string): string | void {
        if (value === undefined) {
            return element.getAttribute(name) || '';
        }
        element.setAttribute(name, value);
    }

    /**
     * Adds CSS classes to an element
     * @param element - Target element
     * @param classes - One or more class names
     */
    static addClass(element: HTMLElement, ...classes: string[]): void {
        element.classList.add(...classes);
    }

    /**
     * Removes CSS classes from an element
     * @param element - Target element
     * @param classes - One or more class names
     */
    static removeClass(element: HTMLElement, ...classes: string[]): void {
        element.classList.remove(...classes);
    }

    /**
     * Toggles CSS classes on an element
     * @param element - Target element
     * @param classes - One or more class names
     */
    static toggleClass(element: HTMLElement, ...classes: string[]): void {
        classes.forEach(cls => element.classList.toggle(cls));
    }

    /**
     * Sets or gets element's text content
     * @param element - Target element
     * @param text - Optional text to set
     * @returns Text content if getting, void if setting
     */
    static text(element: HTMLElement, text?: string): string | void {
        if (text === undefined) {
            return element.textContent || '';
        }
        element.textContent = text;
    }

    /**
     * Sets or gets element's HTML content
     * @param element - Target element
     * @param html - Optional HTML to set
     * @returns HTML content if getting, void if setting
     */
    static html(element: HTMLElement, html?: string): string | void {
        if (html === undefined) {
            return element.innerHTML;
        }
        element.innerHTML = html;
    }

    /**
     * Sets inline styles on an element
     * @param element - Target element
     * @param styles - Object with style properties
     */
    static setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
        Object.assign(element.style, styles);
    }

    /**
     * Checks if element matches a selector
     * @param element - Target element
     * @param selector - CSS selector string
     * @returns boolean
     */
    static matches(element: HTMLElement, selector: string): boolean {
        return element.matches(selector);
    }

    /**
     * Adds event listener with automatic cleanup
     * @param element - Target element
     * @param event - Event name
     * @param handler - Event handler function
     * @returns Cleanup function
     */
    static addEventHandler<K extends keyof HTMLElementEventMap>(
        element: HTMLElement,
        event: K,
        handler: (event: HTMLElementEventMap[K]) => void
    ): () => void {
        element.addEventListener(event, handler as EventListener);
        return () => element.removeEventListener(event, handler as EventListener);
    }

    /**
     * Extracts structured data from a table element
     * @param table - Table element
     * @returns Array of objects representing table data
     */
    static extractTableData(table: HTMLTableElement): Record<string, string>[] {
        const headers: string[] = [];
        const data: Record<string, string>[] = [];

        // Extract headers
        const headerRow = table.querySelector('tr');
        if (headerRow) {
            headerRow.querySelectorAll('th, td').forEach(cell => {
                headers.push(cell.textContent?.trim() || `Column${headers.length + 1}`);
            });
        }

        // Extract data rows
        table.querySelectorAll('tr:not(:first-child)').forEach(row => {
            const rowData: Record<string, string> = {};
            row.querySelectorAll('td').forEach((cell, index) => {
                const header = headers[index] || `Column${index + 1}`;
                rowData[header] = cell.textContent?.trim() || '';
            });
            if (Object.keys(rowData).length > 0) {
                data.push(rowData);
            }
        });

        return data;
    }

    /**
     * Extracts data from a list element
     * @param list - List element (ul/ol)
     * @returns Array of list items with their text and nested structure
     */
    static extractListData(list: HTMLUListElement | HTMLOListElement): any[] {
        return Array.from(list.children).map(item => {
            const itemData: any = {
                text: item.firstChild?.textContent?.trim() || ''
            };

            const nestedList = item.querySelector('ul, ol');
            if (nestedList) {
                itemData.items = this.extractListData(nestedList as HTMLUListElement | HTMLOListElement);
            }

            return itemData;
        });
    }

    /**
     * Extracts formatted text content preserving basic formatting
     * @param element - Source element
     * @returns Object containing text content and formatting information
     */
    static extractFormattedContent(element: HTMLElement): {
        text: string,
        format: {
            bold: boolean,
            italic: boolean,
            underline: boolean
        }
    }[] {
        const result: {
            text: string,
            format: {
                bold: boolean,
                italic: boolean,
                underline: boolean
            }
        }[] = [];

        const processNode = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim() || '';
                if (text) {
                    const parentElement = node.parentElement;
                    result.push({
                        text,
                        format: {
                            bold: parentElement?.tagName === 'STRONG' || parentElement?.tagName === 'B' ||
                                  window.getComputedStyle(parentElement as Element).fontWeight === 'bold',
                            italic: parentElement?.tagName === 'I' || parentElement?.tagName === 'EM',
                            underline: parentElement?.tagName === 'U'
                        }
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                node.childNodes.forEach(processNode);
            }
        };

        processNode(element);
        return result;
    }

    /**
     * Extracts content from a page or section while preserving semantic structure
     * @param element - Root element to extract content from (defaults to document.body)
     * @returns Object containing structured content from the page
     */
    static extractPageContent(element: HTMLElement = document.body): {
        type: string,
        content: any,
        sections: {
            type: string,
            role: string,
            content: any
        }[]
    } {
        const result = {
            type: element.tagName.toLowerCase(),
            content: this.extractElementContent(element),
            sections: []
        };

        // Find all top-level semantic sections
        const semanticSelectors = 'main, article, section, aside, nav, header, footer';
        const sections = Array.from(element.children).filter(child => {
            // Check if the element matches our semantic selectors
            if (!child.matches(semanticSelectors)) {
                return false;
            }

            // For article elements, only include them if they're not inside main
            if (child.tagName.toLowerCase() === 'article') {
                return !child.closest('main');
            }

            return true;
        });

        // sections.forEach(section => {
        //     const sectionData = {
        //         type: section.tagName.toLowerCase(),
        //         role: this.determineElementRole(section as HTMLElement),
        //         content: this.extractElementContent(section as HTMLElement)
        //     };
        //     result.sections.push(sectionData);
        // });

        return result;
    }

    /**
     * Determines the semantic role of an element based on its context and attributes
     * @param element - Element to analyze
     * @returns String describing the element's role
     */
    private static determineElementRole(element: HTMLElement): string {
        const tag = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const className = element.className;

        if (role) return role;
        if (tag === 'main') return 'main-content';
        if (tag === 'nav') return 'navigation';
        if (tag === 'aside') return 'complementary';
        if (tag === 'header') return 'banner';
        if (tag === 'footer') return 'contentinfo';

        // Try to determine role from common class names
        if (className.match(/nav|menu|navigation/i)) return 'navigation';
        if (className.match(/main|content|article/i)) return 'main-content';
        if (className.match(/sidebar|aside/i)) return 'complementary';

        return 'region';
    }

    /**
     * Extracts content from an element using the most appropriate method
     * @param element - Element to extract content from
     * @returns Extracted content in the most appropriate format
     */
    private static extractElementContent(element: HTMLElement): any {
        // Handle specific element types
        if (element.tagName === 'TABLE') {
            return {
                type: 'table',
                data: this.extractTableData(element as HTMLTableElement)
            };
        }

        if (element.tagName === 'UL' || element.tagName === 'OL') {
            return {
                type: 'list',
                data: this.extractListData(element as HTMLUListElement | HTMLOListElement)
            };
        }

        // Extract formatted content and metadata
        const content = {
            type: 'mixed',
            text: this.extractFormattedContent(element),
            metadata: this.extractMetadata(element)
        };

        // Extract nested content
        const nestedContent = Array.from(element.children)
            .filter(child => !child.matches('main, article, section, aside, nav, header, footer'))
            .map(child => ({
                type: child.tagName.toLowerCase(),
                content: this.extractElementContent(child as HTMLElement)
            }));

        return content;
    }

    static extractMetadata(element: HTMLElement): {
        links: { text: string, href: string }[],
        images: { alt: string, src: string }[],
        metadata: Record<string, string>
    } {
        const links = Array.from(element.querySelectorAll('a')).map(link => ({
            text: link.textContent?.trim() || '',
            href: link.href
        }));

        const images = Array.from(element.querySelectorAll('img')).map(img => ({
            alt: img.alt || '',
            src: img.src
        }));

        const metadata: Record<string, string> = {};
        element.querySelectorAll('meta').forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            if (name && content) {
                metadata[name] = content;
            }
        });

        return { links, images, metadata };
    }
}
