/**
 * Word Matcher Module
 * Core algorithm for aligning words from user input with reference text
 */
import { calculateSimilarityScore } from './similarityScoring.js';
import { textComparisonConfig } from '../config.js';

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
