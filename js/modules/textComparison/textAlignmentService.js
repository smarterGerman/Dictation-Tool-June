/**
 * Text Alignment Service
 * Provides a standardized way to align and compare text segments
 */
import { createLogger } from '../utils/logger.js';
import { transformSpecialCharacters } from './textNormalizer.js';
import { calculateSimilarityScore } from './similarityScoring.js';

const logger = createLogger('textAlignmentService');

/**
 * Default alignment result structure
 */
export const DEFAULT_ALIGNMENT_RESULT = {
  // Core alignment maps
  inputToReferenceMap: {},      // Maps input positions to reference positions
  referenceToInputMap: {},      // Maps reference positions to input positions
  
  // Character-level information
  matchedInputPositions: [],    // Input positions that matched something
  matchedReferencePositions: [], // Reference positions that were matched
  
  // Word-level information
  wordMappings: [],             // Word-to-word mappings
  
  // Summary metrics
  matchedCharCount: 0,
  totalCharCount: 0,
  matchPercentage: 0,
  
  // Status information
  success: false,
  isSubstringMatch: false,
  substringPosition: -1,
  error: null
};

/**
 * Create a character-by-character alignment between input and reference text
 * Using dynamic programming approach
 * 
 * @param {string} inputText - The input text to align
 * @param {string} referenceText - The reference text to align against
 * @returns {Object} Alignment result with mapping information
 */
export function createAdvancedAlignment(inputText, referenceText) {
  // Validate inputs
  if (!inputText || !referenceText) {
    logger.warn('Missing input for alignment', { inputText, referenceText });
    return { 
      ...DEFAULT_ALIGNMENT_RESULT,
      error: 'Missing input or reference text'
    };
  }
  
  try {
    logger.debug('Creating alignment between texts', { 
      inputLength: inputText.length,
      referenceLength: referenceText.length
    });
    
    // Normalize texts for comparison
    const normalizedInput = transformSpecialCharacters(inputText.toLowerCase());
    const normalizedReference = referenceText.toLowerCase();
    
    // Create alignment result structure
    const result = { ...DEFAULT_ALIGNMENT_RESULT };
    
    // Store original to transformed mapping
    const inputMapping = {};
    for (let i = 0; i < inputText.length; i++) {
      inputMapping[i] = i; // This is simplified; in real implementation track the position shifts
    }
    
    // Use Levenshtein distance matrix to find optimal alignment
    const alignmentMatrix = createAlignmentMatrix(normalizedInput, normalizedReference);
    const alignment = backtraceAlignment(alignmentMatrix, normalizedInput, normalizedReference);
    
    // Process the alignment to build character maps
    processAlignmentResult(alignment, result, normalizedInput, normalizedReference);
    
    // Calculate metrics
    calculateAlignmentMetrics(result, normalizedInput, normalizedReference);
    
    // Mark as successful
    result.success = true;
    
    // Check for substring match
    checkForSubstringMatch(result, normalizedReference);
    
    logger.debug('Created alignment result', {
      matchPercentage: result.matchPercentage,
      matchedChars: result.matchedCharCount,
      totalChars: result.totalCharCount,
      isSubstring: result.isSubstringMatch
    });
    
    return result;
  } catch (error) {
    logger.error('Error creating alignment', error);
    return { 
      ...DEFAULT_ALIGNMENT_RESULT,
      error: error.message || 'Unknown error in alignment' 
    };
  }
}

/**
 * Create a Levenshtein distance matrix for alignment
 * @param {string} input - Normalized input text
 * @param {string} reference - Normalized reference text 
 * @returns {Array<Array>} The alignment matrix
 * @private
 */
function createAlignmentMatrix(input, reference) {
  const m = input.length;
  const n = reference.length;
  
  // Initialize matrix with dimensions [m+1][n+1]
  const matrix = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Fill first row and column
  for (let i = 0; i <= m; i++) matrix[i][0] = i;
  for (let j = 0; j <= n; j++) matrix[0][j] = j;
  
  // Fill the matrix using dynamic programming
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = input[i-1] === reference[j-1] ? 0 : 1;
      
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,     // deletion
        matrix[i][j-1] + 1,     // insertion
        matrix[i-1][j-1] + cost // substitution or match
      );
    }
  }
  
  return matrix;
}

/**
 * Backtrace through alignment matrix to find optimal alignment
 * @param {Array<Array>} matrix - The alignment matrix
 * @param {string} input - Input text
 * @param {string} reference - Reference text
 * @returns {Array} Alignment operations
 * @private
 */
function backtraceAlignment(matrix, input, reference) {
  const alignment = [];
  let i = input.length;
  let j = reference.length;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && input[i-1] === reference[j-1]) {
      // Match
      alignment.unshift({
        type: 'match',
        inputIndex: i - 1,
        referenceIndex: j - 1
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && matrix[i][j] === matrix[i-1][j-1] + 1) {
      // Substitution
      alignment.unshift({
        type: 'substitution',
        inputIndex: i - 1,
        referenceIndex: j - 1
      });
      i--;
      j--;
    } else if (i > 0 && matrix[i][j] === matrix[i-1][j] + 1) {
      // Deletion (input has extra character)
      alignment.unshift({
        type: 'deletion',
        inputIndex: i - 1,
        referenceIndex: -1
      });
      i--;
    } else {
      // Insertion (reference has extra character)
      alignment.unshift({
        type: 'insertion',
        inputIndex: -1,
        referenceIndex: j - 1
      });
      j--;
    }
  }
  
  return alignment;
}

/**
 * Process alignment operations and update the result object
 * @param {Array} alignment - Alignment operations
 * @param {Object} result - The result object to update
 * @param {string} input - Input text
 * @param {string} reference - Reference text
 * @private
 */
function processAlignmentResult(alignment, result, input, reference) {
  // Process each alignment operation
  for (const op of alignment) {
    if (op.type === 'match') {
      // Character match
      result.inputToReferenceMap[op.inputIndex] = op.referenceIndex;
      result.referenceToInputMap[op.referenceIndex] = op.inputIndex;
      
      result.matchedInputPositions.push(op.inputIndex);
      result.matchedReferencePositions.push(op.referenceIndex);
      
      result.matchedCharCount++;
    } else if (op.type === 'substitution') {
      // Character substitution
      result.inputToReferenceMap[op.inputIndex] = op.referenceIndex;
      result.referenceToInputMap[op.referenceIndex] = op.inputIndex;
    }
    // For insertions and deletions, no mapping is created
  }
}

/**
 * Calculate metrics for the alignment result
 * @param {Object} result - The result object to update
 * @param {string} input - Input text
 * @param {string} reference - Reference text
 * @private
 */
function calculateAlignmentMetrics(result, input, reference) {
  // Total character count (use the longer of the two)
  result.totalCharCount = Math.max(input.length, reference.length);
  
  // Calculate match percentage
  if (result.totalCharCount > 0) {
    result.matchPercentage = (result.matchedCharCount / result.totalCharCount) * 100;
  }
}

/**
 * Check if this is a substring match and update result
 * @param {Object} result - The result object to update
 * @param {string} reference - Reference text
 * @private
 */
function checkForSubstringMatch(result, reference) {
  const matchedPositions = result.matchedReferencePositions;
  
  if (matchedPositions.length > 0 && matchedPositions.length < reference.length) {
    result.isSubstringMatch = true;
    result.substringPosition = Math.min(...matchedPositions);
  }
}

/**
 * Word-level alignment between input and reference texts
 * @param {string} inputText - The input text with words to align
 * @param {string} referenceText - The reference text with words to align against
 * @returns {Object} Word alignment result
 */
export function alignWords(inputText, referenceText) {
  if (!inputText || !referenceText) {
    return {
      wordMappings: [],
      extraInputWords: [],
      missingReferenceWords: [],
      metrics: {
        matchPercentage: 0,
        exactMatchCount: 0,
        similarMatchCount: 0,
        unmatchedCount: 0
      }
    };
  }
  
  try {
    // Split into words
    const inputWords = inputText.trim().split(/\s+/);
    const referenceWords = referenceText.trim().split(/\s+/);
    
    // Process each input word against reference words
    const wordMappings = [];
    const matchedReferenceIndices = new Set();
    
    for (let i = 0; i < inputWords.length; i++) {
      const inputWord = inputWords[i];
      let bestMatchIndex = -1;
      let bestMatchScore = 0;
      let bestMatchType = 'none';
      
      // Find best match for this input word
      for (let j = 0; j < referenceWords.length; j++) {
        // Skip already matched reference words (simplistic approach)
        if (matchedReferenceIndices.has(j)) continue;
        
        const referenceWord = referenceWords[j];
        
        // Check for exact match
        if (inputWord.toLowerCase() === referenceWord.toLowerCase()) {
          bestMatchIndex = j;
          bestMatchScore = 100;
          bestMatchType = 'exact';
          break;
        }
        
        // Calculate similarity score
        const similarity = calculateSimilarityScore(
          inputWord.toLowerCase(), 
          referenceWord.toLowerCase()
        );
        
        // Update best match if this is better
        if (similarity > bestMatchScore && similarity > 60) { // Threshold for similarity
          bestMatchScore = similarity;
          bestMatchIndex = j;
          bestMatchType = 'similar';
        }
      }
      
      // Record this mapping
      wordMappings.push({
        inputIndex: i,
        inputWord: inputWords[i],
        referenceIndex: bestMatchIndex,
        referenceWord: bestMatchIndex >= 0 ? referenceWords[bestMatchIndex] : null,
        matchType: bestMatchType,
        similarityScore: bestMatchScore
      });
      
      // Mark reference word as matched
      if (bestMatchIndex >= 0) {
        matchedReferenceIndices.add(bestMatchIndex);
      }
    }
    
    // Find unmatched reference words
    const missingReferenceWords = [];
    for (let j = 0; j < referenceWords.length; j++) {
      if (!matchedReferenceIndices.has(j)) {
        missingReferenceWords.push({
          index: j,
          word: referenceWords[j]
        });
      }
    }
    
    // Find extra input words (those that didn't match any reference words)
    const extraInputWords = wordMappings
      .filter(mapping => mapping.matchType === 'none')
      .map(mapping => ({
        index: mapping.inputIndex,
        word: mapping.inputWord
      }));
    
    // Calculate metrics
    const exactMatchCount = wordMappings.filter(m => m.matchType === 'exact').length;
    const similarMatchCount = wordMappings.filter(m => m.matchType === 'similar').length;
    const unmatchedCount = wordMappings.filter(m => m.matchType === 'none').length;
    
    const matchPercentage = referenceWords.length > 0 
      ? ((exactMatchCount + similarMatchCount) / referenceWords.length) * 100
      : 0;
    
    return {
      wordMappings,
      extraInputWords,
      missingReferenceWords,
      metrics: {
        matchPercentage,
        exactMatchCount,
        similarMatchCount,
        unmatchedCount
      }
    };
  } catch (error) {
    logger.error('Error aligning words', error);
    return {
      wordMappings: [],
      extraInputWords: [],
      missingReferenceWords: [],
      metrics: {
        matchPercentage: 0,
        exactMatchCount: 0,
        similarMatchCount: 0,
        unmatchedCount: 0
      },
      error: error.message || 'Unknown error in word alignment'
    };
  }
}

export default {
  createAdvancedAlignment,
  alignWords,
  DEFAULT_ALIGNMENT_RESULT
};
