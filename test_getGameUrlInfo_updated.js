// Import the getGameUrlInfo function
import { getGameUrlInfo } from './src/shared/helpers/getGameUrlInfo.js';

// Test URLs
const testUrls = [
  // Previously supported formats
  'https://pl11.plemiona.pl/',
  'https://pl231.plemiona.pl/',
  // New format to support
  'https://plp11.plemiona.pl/',
  // Additional test cases
  'https://pltest123.plemiona.pl/',
  'https://pl.plemiona.pl/', // Should be invalid (no characters after "pl")
  'https://abc123.plemiona.pl/', // Should be invalid (doesn't start with "pl")
  'https://plemiona.pl/', // Should be invalid (no subdomain)
  'https://invalid-url' // Should be invalid (not a valid URL)
];

// Test each URL
testUrls.forEach(url => {
  const result = getGameUrlInfo(url);
  console.log(`URL: ${url}`);
  console.log(`Result: ${JSON.stringify(result, null, 2)}`);
  console.log('---');
});