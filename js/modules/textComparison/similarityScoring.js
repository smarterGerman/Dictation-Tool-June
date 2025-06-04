/**
 * Similarity Scoring Module
 * Provides functions to calculate word similarity for matching purposes
 */

import { normalizeWord } from './textNormalizer.js';

/**
 * Calculates similarity between two words using multiple techniques:
 * - Exact matching
 * - Normalized matching
 * - Levenshtein distance
 * - Substring matching (for compound words)
 * 
 * @param {string} expected - Word from reference text
 * @param {string} actual - Word from user input
 * @return {number} - Score between 0 and 1, higher means more similar
 */
export function calculateSimilarityScore(expected, actual) {
  // Exact match
  if (expected === actual) return 1.0;
  
  // Normalized match (lowercase, no punctuation)
  const normalizedExpected = normalizeWord(expected);
  const normalizedActual = normalizeWord(actual);
  if (normalizedExpected === normalizedActual) return 0.95;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedExpected, normalizedActual);
  const maxLength = Math.max(normalizedExpected.length, normalizedActual.length);
  
  // Convert distance to similarity score
  const similarityFromLevenshtein = 1 - (distance / maxLength);
  
  // Check for substring match (compound words)
  let substringScore = 0;
  if (normalizedExpected.includes(normalizedActual)) {
    substringScore = normalizedActual.length / normalizedExpected.length * 0.8;
  } else if (normalizedActual.includes(normalizedExpected)) {
    substringScore = normalizedExpected.length / normalizedActual.length * 0.8;
  }
  
  // Return the best score
  return Math.max(similarityFromLevenshtein, substringScore);
}

/**
 * Calculates Levenshtein distance between two strings
 * This measures the minimum number of single-character edits
 * needed to change one string into another
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @return {number} - Edit distance (lower means more similar)
 */
export function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i-1] === str2[j-1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,      // deletion
        dp[i][j-1] + 1,      // insertion
        dp[i-1][j-1] + cost  // substitution
      );
    }
  }
  
  return dp[m][n];
}
