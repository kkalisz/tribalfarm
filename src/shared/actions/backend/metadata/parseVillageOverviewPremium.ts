import { PageParser } from "@src/shared/parser/PageParser";
import { VillageOverview } from '@src/shared/models/game/VillageOverview';
import { Coordinates } from "@src/shared/models/game/Coordinates";

/**
 * Parses HTML content from the premium village overview page and extracts village details
 * @param htmlContent HTML content from the premium village overview page
 * @returns Array of parsed village details
 */
export function parseVillageOverviewPremium(htmlContent: string): VillageOverview[] {
  const pageParser = new PageParser(htmlContent);
  const villages: VillageOverview[] = [];

  // Find the production table which contains village data
  const productionTable = pageParser.queryById("production_table");
  if (productionTable.length === 0) {
    return villages;
  }

  // Get all rows from the table body (skip the header row)
  const rows = pageParser.query("#production_table tbody tr");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowHtml = (row as HTMLElement).outerHTML;
    const rowParser = new PageParser(rowHtml);

    // Get all cells in the row
    const cells = rowParser.query("td");
    if (cells.length < 7) continue; // Premium layout has more columns

    try {
      // In premium layout, the first cell is for notes, so we need to use the second cell
      // Extract village ID from the second cell
      const villageCell = cells[1] as HTMLElement;
      const villageIdMatch = villageCell.innerHTML.match(/village=(\d+)/);
      const villageId = villageIdMatch ? villageIdMatch[1] : "";

      // Extract village name and coordinates
      const nameElement = rowParser.query(".quickedit-label")[0] as HTMLElement;
      const nameText = nameElement ? nameElement.getAttribute("data-text") || nameElement.textContent || "" : "";

      // Extract coordinates from the text (format: "Village Name (X|Y) KXX")
      const coordsMatch = nameElement.textContent?.match(/\((\d+)\|(\d+)\)/) || [];
      const coordinates: Coordinates = {
        x: coordsMatch[1] ? parseInt(coordsMatch[1], 10) : 0,
        y: coordsMatch[2] ? parseInt(coordsMatch[2], 10) : 0
      };

      // Extract points from the third cell (index 2)
      const pointsText = (cells[2] as HTMLElement).textContent || "0";
      const points = parseInt(pointsText.replace(/\D/g, ""), 10);

      // Extract resources from the fourth cell (index 3)
      const resourcesCell = cells[3] as HTMLElement;

      // Extract the full content of each resource span
      const woodSpan = resourcesCell.querySelector('.res.wood');
      const stoneSpan = resourcesCell.querySelector('.res.stone');
      const ironSpan = resourcesCell.querySelector('.res.iron');

      // Get the text content and remove all non-digit characters
      const woodText = woodSpan ? woodSpan.textContent || "0" : "0";
      const stoneText = stoneSpan ? stoneSpan.textContent || "0" : "0";
      const ironText = ironSpan ? ironSpan.textContent || "0" : "0";

      const resources = {
        wood: parseInt(woodText.replace(/\D/g, ""), 10),
        stone: parseInt(stoneText.replace(/\D/g, ""), 10),
        iron: parseInt(ironText.replace(/\D/g, ""), 10)
      };

      // Extract storage from the fifth cell (index 4)
      const storageText = (cells[4] as HTMLElement).textContent || "0";
      const storage = parseInt(storageText.replace(/\D/g, ""), 10);

      // Extract farm from the seventh cell (index 6) - Premium layout has merchants in between
      const farmText = (cells[6] as HTMLElement).textContent || "0/0";
      const farmParts = farmText.split("/");
      const farm = {
        used: parseInt(farmParts[0].replace(/\D/g, ""), 10),
        max: parseInt(farmParts[1].replace(/\D/g, ""), 10)
      };

      villages.push({
        villageId,
        name: nameText,
        coordinates,
        points,
        resources,
        storage,
        farm
      });
    } catch (error) {
      console.error("Error parsing premium village row:", error);
    }
  }

  return villages;
}