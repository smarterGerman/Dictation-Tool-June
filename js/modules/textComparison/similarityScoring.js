/**
 * Similarity Scoring Module
 * Provides functions to calculate word similarity for matching purposes
 * Using the proven algorithms from the old system
 * Enhanced with keyboard proximity analysis, length-based thresholds,
 * and German-specific typo pattern detection.
 */

import { normalizeForComparison } from './textNormalizer.js';
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

  // Always normalize for comparison
  const normalizedExpected = normalizeForComparison(expected);
  const normalizedActual = normalizeForComparison(actual);
  if (normalizedExpected.length <= 2 || normalizedActual.length <= 2) {
    console.log('[SIMILARITY] Short word normalization:', { normalizedExpected, normalizedActual });
  }

  // Exact match
  if (normalizedExpected === normalizedActual) return 1.0;

  // Case-insensitive match
  if (normalizedExpected.toLowerCase() === normalizedActual.toLowerCase()) return 0.95;

  // Substring match (one is contained in the other)
  if (normalizedExpected.includes(normalizedActual) || normalizedActual.includes(normalizedExpected)) {
    const ratio = Math.min(normalizedExpected.length, normalizedActual.length) / Math.max(normalizedExpected.length, normalizedActual.length);
    const substringScore = Math.max(0.5, ratio * 0.9);
    if (substringScore > 0.7) return substringScore;
  }

  // Levenshtein distance (normalized)
  let distance = levenshteinDistance(normalizedExpected, normalizedActual);
  const maxLength = Math.max(normalizedExpected.length, normalizedActual.length);
  const similarityFromLevenshtein = 1 - (distance / maxLength);
  return similarityFromLevenshtein;
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
  // Always normalize for comparison
  const a = normalizeForComparison(str1);
  const b = normalizeForComparison(str2);
  if (a.length <= 2 || b.length <= 2) {
    console.log('[LEVENSHTEIN] Short word normalization:', { a, b });
  }
  if (a === b) return 0;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,
        matrix[i][j-1] + 1,
        matrix[i-1][j-1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
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
