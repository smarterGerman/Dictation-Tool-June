// Test script to verify capitalization toggle functionality
import stateManager from './modules/utils/stateManager.js';
import { compareWords } from './modules/textComparison/wordComparisonService.js';

// Export for testing
export function testCapitalizationToggle() {
  console.log('==== Capitalization Toggle Test ====');
  
  // Initial state - check what's in the state manager
  const initialComparisonState = stateManager.getState('comparison');
  console.log('Initial comparison state:', initialComparisonState);
  
  // Set capitalization sensitivity explicitly
  stateManager.updateState('comparison', { capitalizationSensitive: true });
  console.log('After explicit update - capitalizationSensitive:', 
              stateManager.getState('comparison').capitalizationSensitive);
              
  // Read directly from state manager instead of using UI manager method
  const isSensitive = stateManager.getState('comparison').capitalizationSensitive;
  console.log('State manager capitalizationSensitive value:', isSensitive);
  
  // Test word comparison with capitalization sensitivity
  const word1 = "Es";
  const word2 = "es";
  
  // Test with sensitivity on
  const resultSensitive = compareWords(word2, word1, { capitalizationSensitive: true });
  console.log('Comparison with sensitivity ON:', resultSensitive);
  
  // Test with sensitivity off
  const resultInsensitive = compareWords(word2, word1, { capitalizationSensitive: false });
  console.log('Comparison with sensitivity OFF:', resultInsensitive);
  
  // Test with system setting
  const systemSetting = stateManager.getState('comparison').capitalizationSensitive;
  const resultSystem = compareWords(word2, word1, { capitalizationSensitive: systemSetting });
  console.log('Comparison with system setting:', resultSystem);
  
  console.log('==== Test Complete ====');
}

// Run the test if this file is loaded directly
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('Test script loaded, run testCapitalizationToggle() to test');
  });
}
