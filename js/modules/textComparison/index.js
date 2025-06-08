/**
 * Main exports file for text comparison system
 * Centralizes all exports from the modular components
 */

import { findBestWordMatches, generateHighlightedHTML } from './wordMatcher.js';
import { calculateSimilarityScore, levenshteinDistance } from './similarityScoring.js';
import { normalizeText, normalizeWord, transformSpecialCharacters, notifySegmentChange, getTimeSinceSegmentChange, createTextNormalizer, normalizeForComparison } from './textNormalizer.js';
import { processInput, processInputWithCharacterTracking } from './inputProcessor.js';
import { createAlignment, DEFAULT_ALIGNMENT_RESULT } from './alignmentUtility.js';
import { createAdvancedAlignment, alignWords } from './textAlignmentService.js';
import { compareWords, findBestMatchingReferenceWord } from './wordComparisonService.js';

// Function to generate HTML for results (needed by resultsScreen.js)
export function generateResultHTML(input, referenceText) {
  // Use the existing comparison system to generate HTML for results
  const result = processInput(referenceText, input);
  
  // Create highlighted HTML based on the comparison result
  let html = '';
  
  if (result && result.words) {
    result.words.forEach(word => {
      if (word.status === 'correct') {
        html += `<span class="correct">${word.expected}</span> `;
      } else if (word.status === 'misspelled') {
        html += `<span class="incorrect" title="You typed: ${word.word || ''}">${word.expected}</span> `;
      } else if (word.status === 'missing') {
        html += `<span class="missing">${word.expected}</span> `;
      }
    });
  }
  
  return html.trim();
}

// Export all the functions
export {
  findBestWordMatches,
  generateHighlightedHTML,
  calculateSimilarityScore, 
  levenshteinDistance,
  normalizeText,
  normalizeWord,
  transformSpecialCharacters,
  notifySegmentChange,
  getTimeSinceSegmentChange,
  processInput,
  processInputWithCharacterTracking,
  createTextNormalizer,
  createAlignment,
  DEFAULT_ALIGNMENT_RESULT,
  
  // Export new advanced alignment functions
  createAdvancedAlignment,
  alignWords,
  
  // Word comparison functions
  compareWords,
  findBestMatchingReferenceWord,
  normalizeForComparison
};
