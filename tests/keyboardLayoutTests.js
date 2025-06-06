/**
 * Tests for keyboard layout detection and multi-layout support
 */

// Using require instead of import for Node.js compatibility
const { isKeyboardAdjacent } = require('../js/modules/textComparison/keyboardProximity.js');

console.log("===== KEYBOARD LAYOUT DETECTION TESTS =====");

// Test cases for different keyboard layouts
const testCases = [
  {
    layout: 'qwertz',
    tests: [
      { char1: 'z', char2: 't', expected: true, description: 'z and t are adjacent on QWERTZ' },
      { char1: 'y', char2: 'z', expected: false, description: 'y and z are not adjacent on QWERTZ' }
    ]
  },
  {
    layout: 'qwerty',
    tests: [
      { char1: 'y', char2: 't', expected: true, description: 'y and t are adjacent on QWERTY' },
      { char1: 'z', char2: 't', expected: false, description: 'z and t are not adjacent on QWERTY' }
    ]
  },
  {
    layout: 'azerty',
    tests: [
      { char1: 'a', char2: 'z', expected: true, description: 'a and z are adjacent on AZERTY' },
      { char1: 'q', char2: 'w', expected: false, description: 'q and w are not adjacent on AZERTY' }
    ]
  },
  {
    layout: 'auto',
    tests: [
      { char1: 'z', char2: 't', expected: true, description: 'z and t are adjacent on QWERTZ (auto-detect)' },
      { char1: 'y', char2: 't', expected: true, description: 'y and t are adjacent on QWERTY (auto-detect)' },
      { char1: 'a', char2: 'z', expected: true, description: 'a and z are adjacent on AZERTY (auto-detect)' },
      { char1: 'q', char2: 'p', expected: false, description: 'q and p are not adjacent on any layout' }
    ]
  }
];

let passedCount = 0;
let failedCount = 0;

// Run tests for each layout
testCases.forEach(layoutTest => {
  console.log(`\n--- ${layoutTest.layout.toUpperCase()} Layout Tests ---`);
  
  layoutTest.tests.forEach(test => {
    const result = isKeyboardAdjacent(test.char1, test.char2, layoutTest.layout);
    const passed = result === test.expected;
    
    if (passed) {
      console.log(`✓ PASS: ${test.description}`);
      passedCount++;
    } else {
      console.log(`✗ FAIL: ${test.description} (Got: ${result})`);
      failedCount++;
    }
  });
});

// Print summary
console.log("\n===== TEST SUMMARY =====");
console.log(`Total: ${passedCount + failedCount}, Passed: ${passedCount}, Failed: ${failedCount}`);

if (failedCount === 0) {
  console.log("ALL TESTS PASSED! ✓");
} else {
  console.log(`${failedCount} TESTS FAILED! ✗`);
}
