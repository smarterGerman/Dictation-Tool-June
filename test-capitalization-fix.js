// This script tests the capitalization sensitivity fix

import { findBestWordMatches } from './js/modules/textComparison/wordMatcher.js';
import stateManager from './js/modules/utils/stateManager.js';

console.log('Testing capitalization sensitivity fix:');
console.log('--------------------------------------');

// Test case 1: "Berlin" vs "berlin" with capitalization sensitivity enabled
const resultCapSensitive = findBestWordMatches(
  ['Berlin'], 
  ['berlin'], 
  { capitalizationSensitive: true }
);

console.log('Test case 1: "Berlin" vs "berlin" with capitalizationSensitive=true');
console.log('Result:', JSON.stringify(resultCapSensitive, null, 2));
console.log(`Word status: ${resultCapSensitive.words[0].status}`);
console.log(`Expected behavior: 'misspelled' (word should be marked as incorrect due to lowercase 'b')`);
console.log('--------------------------------------');

// Test case 2: "Berlin" vs "berlin" with capitalization sensitivity disabled
const resultCapInsensitive = findBestWordMatches(
  ['Berlin'], 
  ['berlin'], 
  { capitalizationSensitive: false }
);

console.log('Test case 2: "Berlin" vs "berlin" with capitalizationSensitive=false');
console.log('Result:', JSON.stringify(resultCapInsensitive, null, 2));
console.log(`Word status: ${resultCapInsensitive.words[0].status}`);
console.log(`Expected behavior: 'correct' (capitalization differences should be ignored)`);
console.log('--------------------------------------');

// Test case 3: Another example with different capitalization
const resultMoreExamples = findBestWordMatches(
  ['Deutschland', 'Österreich'], 
  ['deutschland', 'österreich'], 
  { capitalizationSensitive: true }
);

console.log('Test case 3: Multiple country names with incorrect capitalization (capitalizationSensitive=true)');
console.log('Result:', JSON.stringify(resultMoreExamples, null, 2));
console.log(`Word status for "Deutschland": ${resultMoreExamples.words[0].status}`);
console.log(`Word status for "Österreich": ${resultMoreExamples.words[1].status}`);
console.log('Expected behavior: Both should be "misspelled"');
