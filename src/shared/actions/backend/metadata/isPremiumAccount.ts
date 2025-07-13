import { PageParser } from "@src/shared/parser/PageParser";

/**
 * Determines if the provided HTML content is compatible with premium parsing
 * @param htmlContent HTML content from the village overview page
 * @returns Boolean indicating if the HTML is compatible with premium parsing
 */
export function isPremiumAccount(htmlContent: string): boolean {
  const pageParser = new PageParser(htmlContent);
  
  // Find the production table which contains village data
  const productionTable = pageParser.queryById("production_table");
  if (productionTable.length === 0) {
    return false;
  }
  
  // Get a sample row from the table body
  const rows = pageParser.query("#production_table tbody tr");
  if (rows.length === 0) {
    return false;
  }
  
  // Check the first row to determine if it's premium format
  const firstRow = rows[0];
  const rowHtml = (firstRow as HTMLElement).outerHTML;
  const rowParser = new PageParser(rowHtml);
  
  // Get all cells in the row
  const cells = rowParser.query("td");
  
  // Premium layout has more columns (at least 7)
  if (cells.length >= 7) {
    return true;
  }
  
  // Additional check: in premium layout, the first cell is for notes
  // and village ID is in the second cell
  if (cells.length > 1) {
    const firstCell = cells[0] as HTMLElement;
    const secondCell = cells[1] as HTMLElement;
    
    // Check if the second cell contains village ID (premium layout)
    const secondCellHasVillageId = secondCell.innerHTML.includes("village=");
    
    // Check if the first cell doesn't contain village ID (premium layout)
    const firstCellNoVillageId = !firstCell.innerHTML.includes("village=");
    
    if (secondCellHasVillageId && firstCellNoVillageId) {
      return true;
    }
  }
  
  return false;
}