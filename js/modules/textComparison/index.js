/**
 * Text Comparison Module
 * Main export file for text comparison functionality
 * Combines the proven algorithms from old system with modular structure
 */
import { 
  findBestWordMatches, 
  alignTexts, 
  isTextMatch, 
  generateHighlightedHTML 
} from './wordMatcher.js';

import { 
  calculateSimilarityScore, 
  calculateOverallSimilarity, 
  levenshteinDistance 
} from './similarityScoring.js';

import { 
  normalizeText, 
  normalizeWord, 
  transformSpecialCharacters, 
  notifySegmentChange,
  getTimeSinceSegmentChange
} from './textNormalizer.js';

import { 
  processInput, 
  notifySegmentAdvance 
} from './inputProcessor.js';

/**
 * Compare user input with reference text
 * Legacy entry point for the text comparison system
 * 
 * @param {string} userInput - The user's transcribed text
 * @param {string} referenceText - The correct reference text
 * @returns {Object} - Comparison results with match status
 */
export function compareTexts(userInput, referenceText) {
  // This is a compatibility wrapper that uses the new processInput function
  // but returns a result object with the same structure as the old system
  const result = processInput(referenceText, userInput);
  
  return {
    isMatch: result.isMatch,
    transformedInput: result.transformedInput,
    errorPositions: result.errorPositions,
    errorCount: result.errorCount,
    correctWords: result.correctWords,
    totalWords: result.totalWords,
    highlightedHtml: result.highlightedHtml
  };
}

// Export all functions for use by other modules
export {
  // Word matching
  findBestWordMatches,
  alignTexts,
  isTextMatch,
  generateHighlightedHTML,
  
  // Similarity scoring
  calculateSimilarityScore,
  calculateOverallSimilarity,
  levenshteinDistance,
  
  // Text normalization
  normalizeText,
  normalizeWord,
  transformSpecialCharacters,
  notifySegmentChange,
  getTimeSinceSegmentChange,
  
  // Input processing
  processInput,
  notifySegmentAdvance
};
