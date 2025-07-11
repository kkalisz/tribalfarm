import fs from 'fs';
import path from 'path';
import { parseVillageOverviewPremium } from '../parseVillageOverviewPremium';

describe('parseVillageOverviewPremium', () => {
  let overviewPremiumHtml: string;

  beforeAll(() => {
    // Read the test HTML file
    overviewPremiumHtml = fs.readFileSync(
      path.join(__dirname, 'overview_premium.html'),
      'utf-8'
    );
  });

  it('should parse premium village overview data correctly', () => {
    const villages = parseVillageOverviewPremium(overviewPremiumHtml);

    // Verify that we have the expected number of villages
    expect(villages.length).toBe(1);

    // Verify the parsed data for the first village
    const village = villages[0];
    
    expect(village.villageId).toBe('8337');
    expect(village.name).toBe('Wioska eMCeKamil');
    expect(village.coordinates).toEqual({ x: 455, y: 578 });
    expect(village.points).toBe(1117);
    expect(village.resources).toEqual({
      wood: 1339,
      stone: 1485,
      iron: 1243
    });
    expect(village.storage).toBe(33523);
    expect(village.farm).toEqual({
      used: 2413,
      max: 2598
    });
  });

  it('should return an empty array if production_table is not found', () => {
    const emptyHtml = '<html><body></body></html>';
    const villages = parseVillageOverviewPremium(emptyHtml);
    expect(villages).toEqual([]);
  });

  it('should handle errors gracefully and continue parsing', () => {
    // Create a malformed HTML that will cause an error during parsing
    const malformedHtml = `
      <table id="production_table">
        <tbody>
          <tr>
            <td></td>
            <td><a href="/game.php?village=8337">Invalid</a></td>
            <td>Invalid Points</td>
            <td>Invalid Resources</td>
            <td>Invalid Storage</td>
            <td>Invalid Merchants</td>
            <td>Invalid Farm</td>
          </tr>
        </tbody>
      </table>
    `;
    
    // This should not throw an error
    const villages = parseVillageOverviewPremium(malformedHtml);
    expect(villages).toEqual([]);
  });

  it('should skip rows with insufficient cells', () => {
    const insufficientCellsHtml = `
      <table id="production_table">
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
          </tr>
        </tbody>
      </table>
    `;
    
    const villages = parseVillageOverviewPremium(insufficientCellsHtml);
    expect(villages).toEqual([]);
  });
});