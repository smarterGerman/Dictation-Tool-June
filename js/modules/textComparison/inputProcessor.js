/**
 * Input Processor Module
 * Processes user input and aligns it with reference text
 */
import { normalizeText, transformSpecialCharacters, notifySegmentChange } from './textNormalizer.js';
import { findBestWordMatches, isTextMatch, generateHighlightedHTML, alignTexts } from './wordMatcher.js';
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
  
  // Transform special characters in user input (German umlauts, etc.)
  const transformedInput = transformSpecialCharacters(userInput);
  
  // Normalize both texts for comparison
  const normalizedReference = normalizeText(referenceText);
  const normalizedInput = normalizeText(transformedInput);
  
  // Split into words
  const expectedWords = normalizedReference.split(/\s+/).filter(word => word);
  const actualWords = normalizedInput.split(/\s+/).filter(word => word);
  
  // Find best matches between words
  const matches = findBestWordMatches(expectedWords, actualWords, matchThreshold);
  
  // Track errors and matches for highlighting
  const errorPositions = [];
  let correctWords = 0;
  
  // Original user input for highlighting
  const origUserWords = transformedInput.split(/\s+/).filter(w => w.length > 0);
  let currentPos = 0;
  
  // Compare each word to identify error positions
  origUserWords.forEach((word, i) => {
    // Find if this word has a matching expected word
    const match = matches.find(m => m.actualIndex === i);
    
    if (!match || match.score < 0.7) {
      // Mark as error
      const start = currentPos;
      const end = currentPos + word.length;
      errorPositions.push({ start, end });
    } else {
      correctWords++;
    }
    
    // Update position
    currentPos += word.length + 1; // +1 for the space
  });
  
  // Check if input is a complete match
  const isMatch = isTextMatch(matches, expectedWords.length, actualWords.length);
  
  // Return detailed results
  return {
    isMatch,
    transformedInput,
    errorPositions,
    errorCount: expectedWords.length - correctWords,
    correctWords,
    totalWords: expectedWords.length,
    
    // Include structured word data for rendering
    words: expectedWords.map((word, index) => {
      const match = matches.find(m => m.expectedIndex === index);
      if (!match || match.missing) {
        return { word, expected: word, status: 'missing', position: index };
      } else {
        return {
          word: match.word,
          expected: word,
          status: match.score >= 0.9 ? 'correct' : 'misspelled',
          score: match.score,
          position: index
        };
      }
    }),
    extraWords: matches.filter(m => m.extra).map(m => {
      return { word: m.word, status: 'extra' };
    }),
    
    // Generate HTML with highlighted errors
    highlightedHtml: generateHighlightedHTML(transformedInput, errorPositions),
    
    // Detailed character alignment
    alignedCharacters: alignTexts(transformedInput, referenceText)
  };
}

/**
 * Notify the system about a segment change
 * This prevents unwanted auto-advancement too soon after segment change
 */
export function notifySegmentAdvance() {
  notifySegmentChange();
}
