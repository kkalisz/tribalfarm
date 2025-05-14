import {parseHTML} from 'linkedom';

const htmlString2 = `
  <html>
    <body>
      <table id="contentContainer">
        <tr>
          <td id="content_value">Cell 1</td>
          <td>Cell 2</td>
        </tr>
      </table>
    </body>
  </html>
`;


export class PageParser {
  private document: Document;

  constructor(htmlString: string) {
    // Parse the provided HTML string with linkedom
    const wrappedHtml = `<html><body>${htmlString}</body></html>`;

    const { document } = parseHTML(wrappedHtml);
    console.log(`parsed ${document.body.innerHTML.length}`)
    this.document = document;
  }

  createChildParser(selector: string): PageParser {
    const fragment = this.document.createDocumentFragment();
    const elements = this.document.querySelectorAll(selector);
    elements.forEach((element) => {
      fragment.appendChild(element.cloneNode(true));
    });

    const serializedFragment = Array.from(fragment.childNodes)
      .map((node) =>
        node.nodeType === 1 ? (node as HTMLElement).outerHTML : node.textContent
      )
      .join('');

    return new PageParser(serializedFragment);
  }

  query(selector: string): NodeListOf<Element> {
    return this.document.querySelectorAll(selector);
  }

  queryMainContent(): PageParser {
    return this.createChildParser('#contentContainer');
  }

  createChildParserByDivClass(className: string): PageParser {
    return this.createChildParser(`div.${className}`);
  }

  getContent(): string {
    return this.document.body.innerHTML;
  }

  getText(): string {
    return this.document.body.textContent || '';
  }

  /**
   * Query div elements by class name
   * @param className The class name to search for
   * @returns A new PageParser with the matching div elements
   */
  queryByDivClass(className: string): NodeListOf<Element> {
    return this.query(`div.${className}`);
  }

  /**
   * Query elements by tag name and class name
   * @param tagName The HTML tag name
   * @param className The class name to search for
   * @returns A new PageParser with the matching elements
   */
  queryByTagClass(tagName: string, className: string): NodeListOf<Element> {
    return this.query(`${tagName}.${className}`);
  }

  /**
   * Query elements by ID
   * @param id The ID to search for
   * @returns A new PageParser with the matching element
   */
  queryById(id: string): NodeListOf<Element> {
    return this.query(`#${id}`);
  }

  /**
   * Query elements by attribute value
   * @param attribute The attribute name
   * @param value The attribute value
   * @returns A new PageParser with the matching elements
   */
  queryByAttribute(attribute: string, value: string): NodeListOf<Element> {
    return this.query(`[${attribute}="${value}"]`);
  }

  /**
   * Query elements by tag name
   * @param tagName The HTML tag name
   * @returns A new PageParser with the matching elements
   */
  queryByTag(tagName: string): NodeListOf<Element> {
    return this.query(tagName);
  }
}
