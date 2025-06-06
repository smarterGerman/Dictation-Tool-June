/**
 * Similarity Scoring Module
 * Provides functions to calculate word similarity for matching purposes
 * Using the proven algorithms from the old system
 * Enhanced with keyboard proximity analysis, length-based thresholds,
 * and German-specific typo pattern detection.
 */

import { normalizeWord } from './textNormalizer.js';
import { textComparisonConfig } from '../config.js';
import { keyboardProximityCost, detectGermanTypoPatterns } from './keyboardProximity.js';

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
  
  // Calculate Levenshtein distance, with or without keyboard proximity consideration
  let distance;
  if (textComparisonConfig.useKeyboardProximity !== false) {
    // Use enhanced version with keyboard proximity
    distance = levenshteinDistanceKeyboard(normalizedExpected, normalizedActual);
  } else {
    // Use standard version
    distance = levenshteinDistance(normalizedExpected, normalizedActual);
  }
  
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
  
  // Apply German-specific typo pattern detection for additional similarity if enabled
  let typoBonusScore = 0;
  if (textComparisonConfig.useGermanTypoPatterns !== false) {
    typoBonusScore = detectGermanTypoPatterns(normalizedActual, normalizedExpected);
  }
  
  // Combine scores, with the bonus from typo patterns
  let bestScore = Math.max(similarityFromLevenshtein, substringScore) + typoBonusScore;
  
  // Get the threshold - with or without length-based adjustment
  let finalThreshold = textComparisonConfig.minimumMatchThreshold;
  
  if (textComparisonConfig.useLengthBasedThresholds !== false) {
    // Apply length-based threshold adjustment
    // For longer words, use a more lenient threshold
    const lengthAdjustedThreshold = Math.max(
      textComparisonConfig.minimumMatchThreshold * 0.5, // never go below half the configured threshold
      textComparisonConfig.minimumMatchThreshold - 
        (normalizedExpected.length * (textComparisonConfig.lengthAdjustmentFactor || 0.01))
    );
    
    // Cap the threshold to avoid being too lenient for very long words
    // Minimum threshold of 0.2 for words over 10 chars
    finalThreshold = normalizedExpected.length > 10 ? 
      Math.max(0.2, lengthAdjustedThreshold) : 
      textComparisonConfig.minimumMatchThreshold;
  }
  
  // Cap the final score at 0.99 to avoid exceeding 100%
  bestScore = Math.min(0.99, bestScore);
  
  return bestScore > finalThreshold ? bestScore : 0;
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

/**
 * Enhanced Levenshtein distance calculation with keyboard proximity consideration
 * Takes into account the proximity of keys on a German QWERTZ keyboard
 * when calculating substitution cost
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @return {number} - Edit distance (lower means more similar)
 */
export function levenshteinDistanceKeyboard(str1, str2) {
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
  
  // Fill matrix with enhanced cost calculation
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const char1 = str1.charAt(j - 1);
      const char2 = str2.charAt(i - 1);
      
      // Use keyboard proximity cost for substitutions with the configured layout
      const cost = char1 === char2 ? 0 : keyboardProximityCost(
        char1, 
        char2, 
        textComparisonConfig.keyboardLayout || 'auto'
      );
      
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,      // deletion
        matrix[i][j-1] + 1,      // insertion
        matrix[i-1][j-1] + cost  // substitution with proximity consideration
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}
