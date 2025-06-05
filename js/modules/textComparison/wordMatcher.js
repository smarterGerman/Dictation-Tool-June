/**
 * Word Matcher Module
 * Core algorithm for aligning words from user input with reference text
 */
import { calculateSimilarityScore } from './similarityScoring.js';
import { textComparisonConfig } from '../config.js';
import { getTimeSinceSegmentChange } from './textNormalizer.js';

/**
 * Finds the best matches between expected words and actual user input
 * Handles out-of-order typing, misspellings, missing and extra words
 * 
 * @param {string[]} expectedWords - Array of words from the reference text
 * @param {string[]} actualWords - Array of words from user input
 * @param {number} matchThreshold - Minimum score to consider a match (0-1)
 * @return {Object[]} - Array of match objects with alignment information
 */
export function findBestWordMatches(
  expectedWords = [], 
  actualWords = [], 
  matchThreshold = textComparisonConfig.minimumMatchThreshold
) {
  // Input validation
  if (!Array.isArray(expectedWords)) expectedWords = [];
  if (!Array.isArray(actualWords)) actualWords = [];
  
  // Ensure we have valid match threshold
  if (typeof matchThreshold !== 'number' || matchThreshold < 0 || matchThreshold > 1) {
    matchThreshold = textComparisonConfig.minimumMatchThreshold;
  }
  
  const result = [];
  let remainingActualWords = [...actualWords]; // Copy to track unmatched words
  
  // For each expected word in the reference text
  for (let i = 0; i < expectedWords.length; i++) {
    const expectedWord = expectedWords[i];
    const expectedWordLower = textComparisonConfig.caseSensitive ? expectedWord : expectedWord.toLowerCase();
    let bestMatch = null;
    let bestScore = matchThreshold; // Minimum threshold to consider a match
    
    // Try to find the best matching word from user input
    for (let j = 0; j < remainingActualWords.length; j++) {
      const actualWord = remainingActualWords[j];
      const actualWordLower = textComparisonConfig.caseSensitive ? actualWord : actualWord.toLowerCase();
      const score = calculateSimilarityScore(expectedWordLower, actualWordLower);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          expectedIndex: i,
          actualIndex: actualWords.indexOf(remainingActualWords[j]),
          word: remainingActualWords[j],
          score: score,
          expected: expectedWords[i]
        };
      }
    }
    
    if (bestMatch) {
      result.push(bestMatch);
      // Remove the matched word from consideration
      const matchedWordIndex = remainingActualWords.indexOf(bestMatch.word);
      remainingActualWords.splice(matchedWordIndex, 1);
    } else {
      // No match found for this expected word
      result.push({
        expectedIndex: i,
        actualIndex: -1,
        word: null,
        score: 0,
        expected: expectedWords[i],
        missing: true
      });
    }
  }
  
  // Handle extra words that don't match any expected word
  remainingActualWords.forEach(word => {
    result.push({
      expectedIndex: -1,
      actualIndex: actualWords.indexOf(word),
      word: word,
      score: 0,
      expected: null,
      extra: true
    });
  });
  
  return result;
}

/**
 * Align two texts for better error highlighting
 * @param {string} input - User input
 * @param {string} reference - Reference text
 * @returns {Array} - Array of characters with status (correct, error, missing)
 */
export function alignTexts(input, reference) {
  // Simple character-by-character comparison for now
  const inputChars = input.split('');
  const referenceChars = reference.split('');
  const result = [];
  
  // Compare existing characters
  for (let i = 0; i < inputChars.length; i++) {
    if (i < referenceChars.length) {
      if (inputChars[i] === referenceChars[i]) {
        result.push({ char: inputChars[i], status: 'correct' });
      } else {
        result.push({ char: inputChars[i], status: 'error' });
      }
    } else {
      // Extra character in input
      result.push({ char: inputChars[i], status: 'error' });
    }
  }
  
  // Add placeholders for missing characters
  for (let i = inputChars.length; i < referenceChars.length; i++) {
    result.push({ char: ' ', status: 'missing' });
  }
  
  return result;
}

/**
 * Determines if user input is a match for the reference text
 * Accounts for similarity threshold and recent segment changes
 * 
 * @param {Array} matches - Word match results from findBestWordMatches
 * @param {number} totalExpectedWords - Total words in reference text
 * @param {number} totalActualWords - Total words in user input
 * @returns {boolean} - True if input is a match for reference text
 */
export function isTextMatch(matches, totalExpectedWords, totalActualWords) {
  // Don't auto-advance if we recently changed segments
  const recentSegmentChange = (getTimeSinceSegmentChange() < 1500); // 1.5 second safety window
  
  // Count correct words
  const correctWords = matches.filter(match => !match.missing && !match.extra && match.score > 0.7).length;
  
  // Check if all words match
  let isMatch = correctWords === totalExpectedWords && totalActualWords === totalExpectedWords;
  
  // If we just changed segments, prevent auto-advancement
  if (isMatch && recentSegmentChange) {
    console.log('Skipping auto-advance: too soon since last segment change');
    isMatch = false; // Prevent auto-advancement
  }
  
  return isMatch;
}

/**
 * Generate HTML with error highlighting for the user input
 * @param {string} input - The user's input text (or transformed input)
 * @param {Array} errorPositions - Array of error position objects {start, end}
 * @returns {string} - HTML string with highlighted errors
 */
export function generateHighlightedHTML(input, errorPositions) {
  if (!input) return '';
  
  // If no errors, all text is correct (green)
  if (!errorPositions || errorPositions.length === 0) {
    return `<span class="correct">${input}</span>`;
  }
  
  // Build output with highlighting based on error positions
  let output = '';
  const chars = input.split('');
  
  chars.forEach((char, index) => {
    // Check if this index is within any error position range
    let isError = false;
    for (const pos of errorPositions) {
      // Handle both array of indices and array of {start, end} objects
      if (typeof pos === 'number') {
        isError = pos === index;
      } else if (pos && typeof pos === 'object') {
        isError = index >= pos.start && index < pos.end;
      }
      
      if (isError) break;
    }
    
    if (isError) {
      // Error character (red)
      output += `<span class="incorrect">${char}</span>`;
    } else {
      // Correct character (green)
      output += `<span class="correct">${char}</span>`;
    }
  });
  
  return output;
}
