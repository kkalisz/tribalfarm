import fs from 'fs';
import path from 'path';
import { isPremiumAccount } from '../isPremiumAccount';
import { beforeAll, describe, expect, it } from 'vitest';

describe('isPremiumHtml', () => {
  let regularHtml: string;
  let premiumHtml: string;

  beforeAll(() => {
    // Read the test HTML files
    regularHtml = fs.readFileSync(
      path.join(__dirname, 'overview.html'),
      'utf-8'
    );
    
    premiumHtml = fs.readFileSync(
      path.join(__dirname, 'overview_premium.html'),
      'utf-8'
    );
  });

  it('should correctly identify premium HTML', () => {
    const isPremium = isPremiumAccount(premiumHtml);
    expect(isPremium).toBe(true);
  });

  it('should correctly identify non-premium HTML', () => {
    const isPremium = isPremiumAccount(regularHtml);
    expect(isPremium).toBe(false);
  });

  it('should return false for empty HTML', () => {
    const emptyHtml = '<html><body></body></html>';
    const isPremium = isPremiumAccount(emptyHtml);
    expect(isPremium).toBe(false);
  });

  it('should return false when production_table is not found', () => {
    const noTableHtml = '<html><body><div>No table here</div></body></html>';
    const isPremium = isPremiumAccount(noTableHtml);
    expect(isPremium).toBe(false);
  });

  it('should handle malformed premium HTML', () => {
    // Create a malformed HTML that still has premium indicators
    const malformedPremiumHtml = `
      <table id="production_table">
        <tbody>
          <tr>
            <td></td>
            <td><a href="/game.php?village=8337">Village Link</a></td>
            <td>Points</td>
            <td>Resources</td>
            <td>Storage</td>
            <td>Merchants</td>
            <td>Farm</td>
          </tr>
        </tbody>
      </table>
    `;
    
    const isPremium = isPremiumAccount(malformedPremiumHtml);
    expect(isPremium).toBe(true);
  });

  it('should handle malformed non-premium HTML', () => {
    // Create a malformed HTML that still has non-premium indicators
    const malformedRegularHtml = `
      <table id="production_table">
        <tbody>
          <tr>
            <td><a href="/game.php?village=44479">Village Link</a></td>
            <td>Points</td>
            <td>Resources</td>
            <td>Storage</td>
            <td>Farm</td>
          </tr>
        </tbody>
      </table>
    `;
    
    const isPremium = isPremiumAccount(malformedRegularHtml);
    expect(isPremium).toBe(false);
  });
});