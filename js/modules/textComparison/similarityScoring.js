/**
 * Similarity Scoring Module
 * Provides functions to calculate word similarity for matching purposes
 * Using the proven algorithms from the old system
 */

import { normalizeWord } from './textNormalizer.js';
import { textComparisonConfig } from '../config.js';

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
  // Input validation
  if (!expected && !actual) return 1.0;
  if (!expected || !actual) return 0.0;
  
  // Exact match
  if (expected === actual) return 1.0;
  
  // Normalized match (lowercase, no punctuation)
  const normalizedExpected = normalizeWord(expected);
  const normalizedActual = normalizeWord(actual);
  if (normalizedExpected === normalizedActual) return 0.95;
  
  // Case-insensitive match
  if (expected.toLowerCase() === actual.toLowerCase()) return 0.95;
  
  // Substring match (one is contained in the other)
  const lowerExpected = expected.toLowerCase();
  const lowerActual = actual.toLowerCase();
    
  if (lowerExpected.includes(lowerActual) || lowerActual.includes(lowerExpected)) {
    const ratio = Math.min(lowerExpected.length, lowerActual.length) / 
                  Math.max(lowerExpected.length, lowerActual.length);
    const substringScore = Math.max(0.5, ratio * 0.9); // At least 0.5 for substring match
    
    // If one is clearly contained in the other with a good length ratio, use this score
    if (substringScore > 0.7) {
      return substringScore;
    }
  }
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedExpected, normalizedActual);
  const maxLength = Math.max(normalizedExpected.length, normalizedActual.length);
  
  // Convert distance to similarity score
  const similarityFromLevenshtein = 1 - (distance / maxLength);
  
  // Check for additional substring match (compound words)
  let substringScore = 0;
  if (normalizedExpected.includes(normalizedActual)) {
    substringScore = normalizedActual.length / normalizedExpected.length * 0.8;
  } else if (normalizedActual.includes(normalizedExpected)) {
    substringScore = normalizedExpected.length / normalizedActual.length * 0.8;
  }
  
  // Apply the proven minimum threshold from the old system
  const bestScore = Math.max(similarityFromLevenshtein, substringScore);
  return bestScore > textComparisonConfig.minimumMatchThreshold ? bestScore : 0;
}

/**
 * Calculates the overall text similarity using Levenshtein distance
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
export function calculateOverallSimilarity(a, b) {
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  
  return Math.round(((maxLength - distance) / maxLength) * 100);
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
  // Empty strings check
  if (!str1 && !str2) return 0;
  if (!str1) return str2.length;
  if (!str2) return str1.length;
  
  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const cost = str2.charAt(i - 1) === str1.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,      // deletion
        matrix[i][j-1] + 1,      // insertion
        matrix[i-1][j-1] + cost  // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}
