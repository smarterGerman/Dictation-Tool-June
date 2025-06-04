/**
 * Basic test file for text comparison functionality
 * This can be run in a browser console or Node.js environment
 */
import { processInput } from '../modules/textComparison/index.js';

// Test cases based on examples from the documentation
const testCases = [
  {
    name: 'Out-of-order typing',
    reference: "Es gibt viel zu tun",
    input: "zu gibt Es tun",
    expectedMissing: ['viel'],
    expectedCorrect: ['Es', 'gibt', 'zu', 'tun']
  },
  {
    name: 'Misspelled words',
    reference: "Es gibt viel zu tun",
    input: "esss gibtte zu tun",
    expectedMissing: ['viel'],
    expectedMisspelled: ['Es', 'gibt'],
    expectedCorrect: ['zu', 'tun']
  },
  {
    name: 'Missing & extra words',
    reference: "Die Sonne scheint hell am Himmel",
    input: "Die scheint sehr hell am blauen Himmel",
    expectedMissing: ['Sonne'],
    expectedCorrect: ['Die', 'scheint', 'hell', 'am', 'Himmel'],
    expectedExtra: ['sehr', 'blauen']
  }
];

// Run tests
function runTests() {
  console.log('Running text comparison tests...');
  
  testCases.forEach(test => {
    console.log(`\nTest: ${test.name}`);
    console.log(`Reference: "${test.reference}"`);
    console.log(`Input: "${test.input}"`);
    
    const result = processInput(test.reference, test.input);
    console.log('Result:', result);
    
    // Check if results match expectations
    const correctWords = result.words.filter(w => w.status === 'correct').map(w => w.word);
    const missingWords = result.words.filter(w => w.status === 'missing').map(w => w.expected);
    const misspelledWords = result.words.filter(w => w.status === 'misspelled').map(w => w.expected);
    const extraWords = result.extraWords.map(w => w.word);
    
    console.log('Correct words:', correctWords);
    console.log('Missing words:', missingWords);
    console.log('Misspelled words:', misspelledWords);
    console.log('Extra words:', extraWords);
    
    // Simple validation
    if (test.expectedCorrect) {
      const allFound = test.expectedCorrect.every(word => 
        correctWords.includes(word) || correctWords.includes(word.toLowerCase()));
      console.log(`All expected correct words found: ${allFound}`);
    }
    
    if (test.expectedMissing) {
      const allFound = test.expectedMissing.every(word => 
        missingWords.includes(word) || missingWords.includes(word.toLowerCase()));
      console.log(`All expected missing words found: ${allFound}`);
    }
    
    if (test.expectedMisspelled) {
      const allFound = test.expectedMisspelled.every(word => 
        misspelledWords.includes(word) || misspelledWords.includes(word.toLowerCase()));
      console.log(`All expected misspelled words found: ${allFound}`);
    }
    
    if (test.expectedExtra) {
      const allFound = test.expectedExtra.every(word => 
        extraWords.includes(word) || extraWords.includes(word.toLowerCase()));
      console.log(`All expected extra words found: ${allFound}`);
    }
  });
}

// Export the run function
export { runTests };
