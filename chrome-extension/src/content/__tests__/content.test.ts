import { ContentScript } from '../content';
import { DOMUtils } from '../domUtils';

declare const global: typeof globalThis;

// Reset the singleton instance between tests
const resetContentScriptInstance = () => {
    // @ts-ignore: Accessing private static field for testing
    ContentScript.instance = undefined;
};

describe('ContentScript', () => {
    let contentScript: ContentScript;
    let originalWindow: typeof window;

    beforeAll(() => {
        // Store original window object
        originalWindow = window;
    });

    beforeEach(() => {
        // Reset singleton instance
        resetContentScriptInstance();

        // Create a fresh DOM environment for each test
        document.body.innerHTML = '';

        // Mock window environment
        const mockWindow = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getComputedStyle: (element: Element) => ({
                fontWeight: 'normal',
            }),
        };
        Object.defineProperty(global, 'window', {
            value: mockWindow,
            writable: true,
        });

        // Initialize content script
        contentScript = ContentScript.getInstance();
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore original window object
        Object.defineProperty(global, 'window', {
            value: originalWindow,
            writable: true,
        });
    });

    describe('UI Initialization', () => {
        test('should create and initialize side panel correctly', () => {
            // The side panel should be created during ContentScript initialization
            const sidePanel = document.getElementById('tribal-farm-side-panel');

            // Verify panel exists
            expect(sidePanel).not.toBeNull();

            // Verify panel has correct class
            expect(sidePanel?.className).toBe('tribal-farm-side-panel');

            // Verify panel is in document body
            expect(document.body.contains(sidePanel)).toBe(true);
        });
    });

    describe('Content Extraction', () => {
        test('should extract table content correctly', async () => {
            // Setup test table
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            const nameHeader = document.createElement('th');
            nameHeader.textContent = 'Name';
            const ageHeader = document.createElement('th');
            ageHeader.textContent = 'Age';
            headerRow.appendChild(nameHeader);
            headerRow.appendChild(ageHeader);
            table.appendChild(headerRow);

            const createRow = (name: string, age: string) => {
                const row = document.createElement('tr');
                const nameCell = document.createElement('td');
                nameCell.textContent = name;
                const ageCell = document.createElement('td');
                ageCell.textContent = age;
                row.appendChild(nameCell);
                row.appendChild(ageCell);
                return row;
            };

            table.appendChild(createRow('John', '25'));
            table.appendChild(createRow('Jane', '30'));
            document.body.appendChild(table);

            const result = await contentScript.extractTableContent(table);
            expect(result).toEqual([
                { Name: 'John', Age: '25' },
                { Name: 'Jane', Age: '30' }
            ]);
        });

        test('should extract list content correctly', async () => {
            // Setup test list
            const list = document.createElement('ul');

            const item1 = document.createElement('li');
            item1.textContent = 'Item 1';

            const sublist = document.createElement('ul');
            const subitem1 = document.createElement('li');
            subitem1.textContent = 'Subitem 1';
            const subitem2 = document.createElement('li');
            subitem2.textContent = 'Subitem 2';
            sublist.appendChild(subitem1);
            sublist.appendChild(subitem2);
            item1.appendChild(sublist);

            const item2 = document.createElement('li');
            item2.textContent = 'Item 2';

            list.appendChild(item1);
            list.appendChild(item2);
            document.body.appendChild(list);

            const result = await contentScript.extractListContent(list);
            expect(result).toEqual([
                {
                    text: 'Item 1',
                    items: [
                        { text: 'Subitem 1' },
                        { text: 'Subitem 2' }
                    ]
                },
                { text: 'Item 2' }
            ]);
        });

        test('should extract formatted content correctly', async () => {
            // Setup test content
            const content = document.createElement('div');
            const paragraph = document.createElement('p');

            const normalText = document.createTextNode('Normal text ');
            paragraph.appendChild(normalText);

            const boldText = document.createElement('strong');
            boldText.textContent = 'bold text';
            paragraph.appendChild(boldText);
            paragraph.appendChild(document.createTextNode(' '));

            const italicText = document.createElement('i');
            italicText.textContent = 'italic text';
            paragraph.appendChild(italicText);
            paragraph.appendChild(document.createTextNode(' '));

            const underlineText = document.createElement('u');
            underlineText.textContent = 'underlined text';
            paragraph.appendChild(underlineText);

            content.appendChild(paragraph);
            document.body.appendChild(content);

            const result = await contentScript.extractFormattedContent(content);
            expect(result).toEqual([
                { text: 'Normal text', format: { bold: false, italic: false, underline: false } },
                { text: 'bold text', format: { bold: true, italic: false, underline: false } },
                { text: 'italic text', format: { bold: false, italic: true, underline: false } },
                { text: 'underlined text', format: { bold: false, italic: false, underline: true } }
            ]);
        });

        test('should extract page content correctly', async () => {
            // Setup test page structure
            const page = document.createElement('div');

            // Create main content section
            const main = document.createElement('main');
            const article = document.createElement('article');

            // Add a table to the article
            const table = document.createElement('table');
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = 'Header';
            const td = document.createElement('td');
            td.textContent = 'Data';
            tr.appendChild(th);
            tr.appendChild(td);
            table.appendChild(tr);
            article.appendChild(table);

            // Add some formatted text
            const text = document.createElement('div');
            const bold = document.createElement('strong');
            bold.textContent = 'Important';
            text.appendChild(bold);
            article.appendChild(text);

            main.appendChild(article);

            // Create navigation
            const nav = document.createElement('nav');
            const list = document.createElement('ul');
            const listItem = document.createElement('li');
            listItem.textContent = 'Navigation Item';
            list.appendChild(listItem);
            nav.appendChild(list);

            // Create sidebar
            const aside = document.createElement('aside');
            aside.className = 'sidebar';
            const sidebarContent = document.createElement('p');
            sidebarContent.textContent = 'Sidebar content';
            aside.appendChild(sidebarContent);

            page.appendChild(main);
            page.appendChild(nav);
            page.appendChild(aside);
            document.body.appendChild(page);

            const result = await contentScript.extractPageContent(page);

            expect(result).toBeTruthy();
            expect(result?.type).toBe('div');
            expect(result?.sections).toHaveLength(3);

            // Verify main content
            const mainSection = result?.sections.find(s => s.role === 'main-content');
            expect(mainSection).toBeTruthy();
            expect(mainSection?.type).toBe('main');

            // Verify navigation
            const navSection = result?.sections.find(s => s.role === 'navigation');
            expect(navSection).toBeTruthy();
            expect(navSection?.type).toBe('nav');
            expect(navSection?.content.type).toBe('mixed');
            expect(navSection?.content.text).toBeTruthy();

            // Verify sidebar
            const sidebarSection = result?.sections.find(s => s.role === 'complementary');
            expect(sidebarSection).toBeTruthy();
            expect(sidebarSection?.type).toBe('aside');
            expect(sidebarSection?.content.type).toBe('mixed');
            expect(sidebarSection?.content.text).toBeTruthy();
        });

        test('should extract metadata correctly', async () => {
            // Setup test content
            const content = document.createElement('div');

            const link = document.createElement('a');
            link.href = 'https://example.com';
            link.textContent = 'Example Link';
            content.appendChild(link);

            const img = document.createElement('img');
            img.src = 'image.jpg';
            img.alt = 'Test Image';
            content.appendChild(img);

            const meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            meta.setAttribute('content', 'Test Description');
            content.appendChild(meta);

            document.body.appendChild(content);

            const result = await contentScript.extractMetadata(content);
            expect(result).toMatchObject({
                links: [{ text: 'Example Link' }],
                images: [{ alt: 'Test Image' }],
                metadata: { description: 'Test Description' }
            });

            // Verify URLs are present and valid
            expect(result?.links[0].href).toContain('example.com');
            expect(result?.images[0].src).toContain('image.jpg');
        });

        test('should handle invalid selectors gracefully', async () => {
            // Test each selector in parallel to speed up the test
            const results = await Promise.all([
                contentScript.extractTableContent('#non-existent-table'),
                contentScript.extractListContent('#non-existent-list'),
                contentScript.extractFormattedContent('#non-existent-content'),
                contentScript.extractMetadata('#non-existent-element')
            ]);

            // Verify all results are null
            results.forEach(result => {
                expect(result).toBeNull();
            });
        }, 1000); // Set test timeout to 1 second since we're running in parallel
    });
});
