// Import the getGameUrlInfo function
const { getGameUrlInfo } = require('./dist_chrome/shared/helpers/getGameUrlInfo');

// Test URLs
const testUrls = [
  'https://pl11.plemiona.pl/',
  'https://pl231.plemiona.pl/',
  'https://plp11.plemiona.pl/',
  'https://invalid.plemiona.pl/',
  'https://example.com/'
];

// Test each URL
console.log('Testing getGameUrlInfo function:');
console.log('--------------------------------');
testUrls.forEach(url => {
  const result = getGameUrlInfo(url);
  console.log(`URL: ${url}`);
  console.log('Result:', result);
  console.log('--------------------------------');
});