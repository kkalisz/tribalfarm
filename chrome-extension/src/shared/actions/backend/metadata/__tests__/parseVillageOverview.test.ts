import fs from 'fs';
import path from 'path';
import { parseVillageOverview } from '../parseVillageOverview';
import { beforeAll, describe, expect, it } from 'vitest';

describe('parseVillageOverview', () => {
  let overviewHtml: string;

  beforeAll(() => {
    // Read the test HTML file
    overviewHtml = fs.readFileSync(
      path.join(__dirname, 'overview.html'),
      'utf-8'
    );
  });

  it('should parse village overview data correctly', () => {
    const villages = parseVillageOverview(overviewHtml);

    // Verify that we have the expected number of villages
    expect(villages.length).toBe(1);

    // Verify the parsed data for the first village
    const village = villages[0];
    
    expect(village.villageId).toBe('44479');
    expect(village.name).toBe('Wioska eMCeKamilg');
    expect(village.coordinates).toEqual({ x: 362, y: 668 });
    expect(village.points).toBe(1474);
    expect(village.resources).toEqual({
      wood: 30504,
      stone: 8984,
      iron: 44070
    });
    expect(village.storage).toBe(50675);
    expect(village.farm).toEqual({
      used: 3584,
      max: 4183
    });
  });

  it('should return an empty array if production_table is not found', () => {
    const emptyHtml = '<html><body></body></html>';
    const villages = parseVillageOverview(emptyHtml);
    expect(villages).toEqual([]);
  });

  it('should handle errors gracefully and continue parsing', () => {
    // Create a malformed HTML that will cause an error during parsing
    const malformedHtml = `
      <table id="production_table">
        <tbody>
          <tr>
            <td><a href="/game.php?village=44479">Invalid</a></td>
            <td>Invalid Points</td>
            <td>Invalid Resources</td>
            <td>Invalid Storage</td>
            <td>Invalid Farm</td>
          </tr>
        </tbody>
      </table>
    `;
    
    // This should not throw an error
    const villages = parseVillageOverview(malformedHtml);
    expect(villages).toEqual([]);
  });
});