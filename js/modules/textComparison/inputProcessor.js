/**
 * Input Processor Module
 * Processes user input and aligns it with reference text
 */
import { normalizeText } from './textNormalizer.js';
import { findBestWordMatches } from './wordMatcher.js';
import { textComparisonConfig } from '../config.js';

/**
 * Processes user input and aligns it with reference text
 * Returns a structured result object with word matches and status
 * 
 * @param {string} referenceText - The expected text
 * @param {string} userInput - The text entered by the user
 * @param {number} matchThreshold - Minimum similarity threshold (0-1)
 * @return {Object} - Alignment results with word status
 */
export function processInput(
  referenceText = "", 
  userInput = "", 
  matchThreshold = textComparisonConfig.minimumMatchThreshold
) {
  // Input validation
  if (typeof referenceText !== 'string') referenceText = String(referenceText || "");
  if (typeof userInput !== 'string') userInput = String(userInput || "");
  
  // Normalize and split texts into words
  const normalizedReference = normalizeText(referenceText);
  const normalizedInput = normalizeText(userInput);
  
  const expectedWords = normalizedReference.split(/\s+/).filter(word => word);
  const actualWords = normalizedInput.split(/\s+/).filter(word => word);
  
  // Find best matches
  const matches = findBestWordMatches(expectedWords, actualWords, matchThreshold);
  
  // Organize results for rendering
  const result = {
    words: expectedWords.map((word, index) => {
      const match = matches.find(m => m.expectedIndex === index);
      if (!match || match.missing) {
        return { word, expected: word, status: 'missing', position: index };
      } else {
        return {
          word: match.word,
          expected: word,
          status: match.score === 1 ? 'correct' : 'misspelled',
          score: match.score,
          position: index
        };
      }
    }),
    extraWords: matches.filter(m => m.extra).map(m => {
      return { word: m.word, status: 'extra' };
    })
  };
  
  return result;
}
