/**
 * Alignment Utility Module
 * Handles the character-by-character alignment between input and reference text
 */
import { transformSpecialCharacters } from './textNormalizer.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('alignmentUtility');

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
 * @returns {Object} Alignment result with mapping information
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
