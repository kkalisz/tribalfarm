// Test script for the regex pattern used in getGameUrlInfo function

// The updated regex pattern
const regexPattern = /^(pl[a-zA-Z0-9]+)\.plemiona\.pl$/;

// Test hostnames
const testHostnames = [
  // Previously supported formats
  'pl11.plemiona.pl',
  'pl231.plemiona.pl',
  // New format to support
  'plp11.plemiona.pl',
  // Additional test cases
  'pltest123.plemiona.pl',
  'pl.plemiona.pl', // Should not match (no characters after "pl")
  'abc123.plemiona.pl', // Should not match (doesn't start with "pl")
  'plemiona.pl', // Should not match (no subdomain)
];

// Test each hostname
console.log('Testing regex pattern:', regexPattern);
console.log('---');

testHostnames.forEach(hostname => {
  const match = hostname.match(regexPattern);
  console.log(`Hostname: ${hostname}`);
  
  if (match) {
    console.log(`Match: Yes`);
    console.log(`Subdomain: ${match[1]}`);
  } else {
    console.log(`Match: No`);
  }
  
  console.log('---');
});

// Simulate the full getGameUrlInfo function logic for a few key URLs
console.log('\nSimulating full getGameUrlInfo function:');
console.log('---');

const testUrls = [
  'https://pl11.plemiona.pl/',
  'https://plp11.plemiona.pl/',
  'https://pl.plemiona.pl/',
  'https://abc123.plemiona.pl/'
];

testUrls.forEach(url => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const match = hostname.match(regexPattern);
    
    let result;
    if (match) {
      const subdomain = match[1];
      result = {
        isValid: true,
        subdomain,
        fullDomain: `${subdomain}.plemiona.pl`,
      };
    } else {
      result = { isValid: false };
    }
    
    console.log(`URL: ${url}`);
    console.log(`Result: ${JSON.stringify(result, null, 2)}`);
    console.log('---');
  } catch (e) {
    console.log(`URL: ${url}`);
    console.log(`Error: ${e.message}`);
    console.log('---');
  }
});