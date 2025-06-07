/**
 * Alignment Utility Module
 * Handles the character-by-character alignment between input and reference text.
 *
 * Exports:
 *   - createAlignment: Basic character-by-character alignment (uses transformSpecialCharacters)
 *   - findBestAlignment: Finds the best alignment between two strings (should use dynamic programming/Levenshtein in future)
 *   - createTransformationMap: Maps original input positions to transformed positions (handles special char expansions)
 *   - findInsertPositionForMissingChar: Finds where to insert a missing char indicator in the reference
 *
 * All text transformation logic (punctuation, case, special chars) should be handled in textNormalizer.js.
 * All word/character comparison logic should be in wordComparisonService.js or wordMatcher.js.
 */

// Ensure all text transformation logic is handled by textNormalizer.js
// No ad-hoc regex or string replacements for normalization or special characters should be here.
// All normalization should use transformSpecialCharacters, normalizeText, or createTextNormalizer from textNormalizer.js.

import { transformSpecialCharacters } from './textNormalizer.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('alignmentUtility');

/**
 * @typedef {Object} AlignmentResult
 * @property {Object} transformedToRefMap - Maps each transformed input char index to reference char index
 * @property {Set<number>} refPositionsMatched - Set of matched reference char indices
 * @property {Object} originalToTransformedMap - Maps original input char index to transformed input char index
 * @property {boolean} isSubstringMatch - True if this is a partial/substring match
 * @property {number} substringPosition - Start index of substring match in reference
 * @property {Array<{inputPos: number, refPos: number}>} matchedIndices - Array of matched char index pairs
 */

/**
 * Default/empty alignment result for fallback and initialization
 */
export const DEFAULT_ALIGNMENT_RESULT = {
  transformedToRefMap: {},
  refPositionsMatched: new Set(),
  originalToTransformedMap: {},
  isSubstringMatch: false,
  substringPosition: 0,
  matchedIndices: []
};

/**
 * Create a character-by-character alignment between input and reference text
 * @param {string} inputWord - The input word to align
 * @param {string} referenceWord - The reference word to align against
 * @returns {AlignmentResult} Alignment result with mapping information
 */
export function createAlignment(inputWord, referenceWord) {
  if (!inputWord || !referenceWord) {
    logger.warn('Missing input for alignment', { inputWord, referenceWord });
    return { ...DEFAULT_ALIGNMENT_RESULT };
  }
  
  try {
    logger.debug('Creating alignment between', { inputWord, referenceWord });
    
    // Transform input for improved matching
    const transformedInput = transformSpecialCharacters(inputWord.toLowerCase());
    const refLower = referenceWord.toLowerCase();
    
    // Create results structure
    const result = {
      transformedToRefMap: {},
      refPositionsMatched: new Set(),
      originalToTransformedMap: {},
      isSubstringMatch: false,
      substringPosition: 0,
      matchedIndices: []
    };
    
    // Track original to transformed character mapping
    for (let i = 0; i < inputWord.length; i++) {
      // This simplified version just maps each position directly
      // In a real implementation, you would track the transformation from original -> transformed
      result.originalToTransformedMap[i] = i;
    }
    
    // Create a basic character-by-character alignment
    // This is a simplified alignment algorithm - a real implementation would use
    // dynamic programming or Levenshtein distance for optimal alignment
    let refPos = 0;
    
    for (let i = 0; i < transformedInput.length; i++) {
      if (refPos >= refLower.length) break;
      
      if (transformedInput[i] === refLower[refPos]) {
        // Match found
        result.transformedToRefMap[i] = refPos;
        result.refPositionsMatched.add(refPos);
        result.matchedIndices.push({ inputPos: i, refPos });
        refPos++;
      } else {
        // Look ahead to find the next match
        let found = false;
        for (let look = refPos; look < refPos + 3 && look < refLower.length; look++) {
          if (transformedInput[i] === refLower[look]) {
            result.transformedToRefMap[i] = look;
            result.refPositionsMatched.add(look);
            result.matchedIndices.push({ inputPos: i, refPos: look });
            refPos = look + 1;
            found = true;
            break;
          }
        }
        
        if (!found) {
          // No match found, try to continue
          refPos++;
        }
      }
    }
    
    // Determine if this is a substring match
    const matchedCount = result.refPositionsMatched.size;
    const isPartialMatch = matchedCount > 0 && matchedCount < refLower.length;
    
    if (isPartialMatch) {
      result.isSubstringMatch = true;
      
      // Find the earliest reference position matched
      if (result.matchedIndices.length > 0) {
        result.substringPosition = Math.min(
          ...result.matchedIndices.map(match => match.refPos)
        );
      }
    }
    
    logger.debug('Created alignment result', { 
      matchCount: result.matchedIndices.length,
      isSubstring: result.isSubstringMatch 
    });
    
    return result;
  } catch (error) {
    logger.error('Error creating alignment', error);
    return { ...DEFAULT_ALIGNMENT_RESULT };
  }
}

/**
 * Find the best alignment between two strings with detailed information
 * @param {string} input - The input string (user's text)
 * @param {string} reference - The reference string (correct text)
 * @returns {AlignmentResult} Alignment result with detailed information
 */
export function findBestAlignment(input, reference) {
  // ...existing code of findBestAlignment...
}

/**
 * Create a mapping from original input positions to transformed positions
 * @param {string} originalInput - The original input string
 * @param {string} transformedInput - The transformed input string
 * @returns {Object} - Mapping object with original positions as keys and transformed positions as values
 */
export function createTransformationMap(originalInput, transformedInput) {
  // Maps each character position in the original input to the corresponding position in the transformed input.
  // Handles cases where special characters are expanded (e.g., 'ß' -> 'ss').
  const map = {};
  let origIdx = 0;
  let transIdx = 0;
  while (origIdx < originalInput.length && transIdx < transformedInput.length) {
    const origChar = originalInput[origIdx];
    const transChar = transformedInput[transIdx];
    map[origIdx] = transIdx;
    // Handle expansion: if the transformed char(s) represent a single original char
    if (origChar === 'ß' && transformedInput.slice(transIdx, transIdx + 2) === 'ss') {
      // 'ß' expands to 'ss' in transformed
      transIdx += 2;
    } else {
      transIdx++;
    }
    origIdx++;
  }
  // If original input is longer, map remaining to last transformed index
  while (origIdx < originalInput.length) {
    map[origIdx] = transformedInput.length - 1;
    origIdx++;
  }
  return map;
}

/**
 * Find the position to insert a missing character indicator
 * @param {number} refPos - The reference position of the missing character
 * @param {string} refWord - The reference word
 * @param {Set} matchedPositions - Set of already matched positions
 * @returns {number} - The position to insert the indicator
 */
export function findInsertPositionForMissingChar(refPos, refWord, matchedPositions) {
  // Insert at the next unmatched position after refPos, or at the end if all matched
  for (let i = refPos; i < refWord.length; i++) {
    if (!matchedPositions.has(i)) {
      return i;
    }
  }
  return refWord.length;
}
