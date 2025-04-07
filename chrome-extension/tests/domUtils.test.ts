import { DOMUtils } from '../src/content/domUtils';

describe('DOMUtils', () => {
    let container: HTMLElement;

    beforeEach(() => {
        // Set up a fresh container for each test
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up after each test
        container.remove();
    });

    describe('Element Selection', () => {
        beforeEach(() => {
            container.innerHTML = `
                <div id="test-id" class="test-class">
                    <span class="child">Child 1</span>
                    <span class="child">Child 2</span>
                    <p class="different">Different element</p>
                </div>
            `;
        });

        test('querySelector should find single element', () => {
            const element = DOMUtils.querySelector('.test-class');
            expect(element).toBeTruthy();
            expect(element?.className).toBe('test-class');
        });

        test('querySelectorAll should find multiple elements', () => {
            const elements = DOMUtils.querySelectorAll('.child');
            expect(elements).toHaveLength(2);
            elements.forEach(el => expect(el.className).toBe('child'));
        });

        test('getElementById should find element by ID', () => {
            const element = DOMUtils.getElementById('test-id');
            expect(element).toBeTruthy();
            expect(element?.id).toBe('test-id');
        });
    });

    describe('DOM Traversal', () => {
        beforeEach(() => {
            container.innerHTML = `
                <div class="parent">
                    <div class="child first">First</div>
                    <div class="child second">Second</div>
                    <div class="child third">Third</div>
                </div>
            `;
        });

        test('closest should find nearest matching ancestor', () => {
            const child = DOMUtils.querySelector('.first');
            const parent = DOMUtils.closest(child!, '.parent');
            expect(parent).toBeTruthy();
            expect(parent?.className).toBe('parent');
        });

        test('children should return all child elements', () => {
            const parent = DOMUtils.querySelector('.parent');
            const children = DOMUtils.children(parent!);
            expect(children).toHaveLength(3);
            expect(children.every(child => child.classList.contains('child'))).toBe(true);
        });

        test('parent should return parent element', () => {
            const child = DOMUtils.querySelector('.first');
            const parent = DOMUtils.parent(child!);
            expect(parent).toBeTruthy();
            expect(parent?.className).toBe('parent');
        });

        test('siblings should return all siblings', () => {
            const second = DOMUtils.querySelector('.second');
            const siblings = DOMUtils.siblings(second!);
            expect(siblings).toHaveLength(2);
            expect(siblings.some(sib => sib.classList.contains('first'))).toBe(true);
            expect(siblings.some(sib => sib.classList.contains('third'))).toBe(true);
        });
    });

    describe('Element Manipulation', () => {
        let testElement: HTMLElement;

        beforeEach(() => {
            testElement = document.createElement('div');
            container.appendChild(testElement);
        });

        test('attr should get and set attributes', () => {
            DOMUtils.attr(testElement, 'data-test', 'value');
            expect(DOMUtils.attr(testElement, 'data-test')).toBe('value');
        });

        test('addClass should add CSS classes', () => {
            DOMUtils.addClass(testElement, 'class1', 'class2');
            expect(testElement.classList.contains('class1')).toBe(true);
            expect(testElement.classList.contains('class2')).toBe(true);
        });

        test('removeClass should remove CSS classes', () => {
            testElement.className = 'class1 class2';
            DOMUtils.removeClass(testElement, 'class1');
            expect(testElement.classList.contains('class1')).toBe(false);
            expect(testElement.classList.contains('class2')).toBe(true);
        });

        test('toggleClass should toggle CSS classes', () => {
            DOMUtils.toggleClass(testElement, 'test-class');
            expect(testElement.classList.contains('test-class')).toBe(true);
            DOMUtils.toggleClass(testElement, 'test-class');
            expect(testElement.classList.contains('test-class')).toBe(false);
        });

        test('text should get and set text content', () => {
            DOMUtils.text(testElement, 'Test text');
            expect(DOMUtils.text(testElement)).toBe('Test text');
        });

        test('html should get and set HTML content', () => {
            const html = '<span>Test</span>';
            DOMUtils.html(testElement, html);
            expect(DOMUtils.html(testElement)).toBe(html);
        });

        test('setStyles should set inline styles', () => {
            DOMUtils.setStyles(testElement, {
                color: 'red',
                backgroundColor: 'blue'
            });
            expect(testElement.style.color).toBe('red');
            expect(testElement.style.backgroundColor).toBe('blue');
        });
    });

    describe('Event Handling', () => {
        test('addEventHandler should add and clean up event listeners', () => {
            const handler = jest.fn();
            const cleanup = DOMUtils.addEventHandler(container, 'click', handler);

            // Trigger the event
            container.click();
            expect(handler).toHaveBeenCalledTimes(1);

            // Clean up
            cleanup();
            container.click();
            expect(handler).toHaveBeenCalledTimes(1); // Should not increase
        });
    });
});