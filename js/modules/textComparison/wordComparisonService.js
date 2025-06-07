/**
 * Word Comparison Service
 * Provides enhanced word comparison functionality with robust error handling
 */
import { transformSpecialCharacters, createTextNormalizer } from './textNormalizer.js';
import { calculateSimilarityScore } from './similarityScoring.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('wordComparisonService');

/**
 * Compare two words with robust error handling
 * @param {string} inputWord - The input word to compare
 * @param {string} referenceWord - The reference word to compare against
 * @returns {Object} Comparison result with match information
 */
export function compareWords(inputWord, referenceWord) {
  try {
    // Input validation with detailed logging
    if (!inputWord && !referenceWord) {
      logger.warn('compareWords: Both input and reference words are empty');
      return { isMatch: false, reason: 'both_empty' };
    }
    
    if (!inputWord) {
      logger.debug('compareWords: Input word is empty', { referenceWord });
      return { isMatch: false, reason: 'input_empty' };
    }
    
    if (!referenceWord) {
      logger.debug('compareWords: Reference word is empty', { inputWord });
      return { isMatch: false, reason: 'reference_empty' };
    }
    
    // Normalize both words for comparison
    const textNormalizer = createTextNormalizer();
    
    // Handle potential errors in text normalization
    let cleanInput, cleanRef;
    try {
      cleanInput = textNormalizer.removePunctuation(inputWord);
    } catch (error) {
      logger.error('Error removing punctuation from input word', { inputWord, error });
      cleanInput = inputWord.toLowerCase();
    }
    
    try {
      cleanRef = textNormalizer.removePunctuation(referenceWord);
    } catch (error) {
      logger.error('Error removing punctuation from reference word', { referenceWord, error });
      cleanRef = referenceWord.toLowerCase();
    }
    
    // Perform different comparison methods
    const isExactMatch = inputWord.toLowerCase() === referenceWord.toLowerCase();
    const isCleanMatch = cleanInput === cleanRef;
    
    // Transform input word for special character handling
    let transformedInput;
    try {
      transformedInput = transformSpecialCharacters(inputWord.toLowerCase());
    } catch (error) {
      logger.error('Error transforming input word', { inputWord, error });
      transformedInput = inputWord.toLowerCase();
    }
    
    // Calculate similarity with error handling
    let similarity = 0;
    try {
      similarity = calculateSimilarityScore(transformedInput, referenceWord.toLowerCase());
    } catch (error) {
      logger.error('Error calculating similarity score', { 
        inputWord, 
        transformedInput, 
        referenceWord, 
        error 
      });
    }
    
    logger.debug('Word comparison results', { 
      input: inputWord, 
      reference: referenceWord, 
      transformedInput,
      cleanInput,
      cleanRef,
      isExactMatch, 
      isCleanMatch, 
      similarity 
    });
    
    return {
      isMatch: isExactMatch || isCleanMatch,
      isExactMatch,
      isCleanMatch,
      similarity,
      transformedInput,
      cleanInput,
      cleanRef
    };
  } catch (error) {
    logger.error('Word comparison failed', { error, inputWord, referenceWord });
    return { 
      isMatch: false, 
      error: error.message || 'Unknown comparison error',
      inputWord,
      referenceWord
    };
  }
}

/**
 * Find the best matching reference word for an input word
 * @param {string} inputWord - The user's input word
 * @param {Array<string>} referenceWords - List of reference words to check against
 * @param {Set<number>} [excludeIndices] - Optional indices to exclude from matching
 * @param {Object} [options] - Optional configuration settings
 * @param {number} [options.similarityThreshold=0.37] - Threshold for considering a match
 * @param {boolean} [options.ignoreCase=true] - Whether to ignore case when comparing
 * @returns {Object} Match result with index and score
 */
export function findBestMatchingReferenceWord(
  inputWord, 
  referenceWords, 
  excludeIndices = new Set(),
  options = {}
) {
  try {
    // Input validation with detailed error information
    if (!inputWord) {
      logger.debug('No input word provided for matching');
      return { index: -1, score: 0, reason: 'empty_input' };
    }
    
    if (!referenceWords || !Array.isArray(referenceWords) || !referenceWords.length) {
      logger.debug('No valid reference words for matching', { 
        inputWord, 
        isArray: Array.isArray(referenceWords),
        length: referenceWords?.length 
      });
      return { index: -1, score: 0, reason: 'no_reference_words' };
    }
    
    // Set default options
    const { 
      similarityThreshold = 0.37, 
      ignoreCase = true 
    } = options;
    
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    
    // Transform input once outside the loop
    let transformedInput;
    try {
      transformedInput = transformSpecialCharacters(ignoreCase ? inputWord.toLowerCase() : inputWord);
    } catch (error) {
      logger.error('Error transforming input word', { inputWord, error });
      transformedInput = ignoreCase ? inputWord.toLowerCase() : inputWord;
    }
    
    logger.debug('Finding best match for word', { 
      input: inputWord, 
      transformed: transformedInput,
      referenceWordCount: referenceWords.length,
      excludedCount: excludeIndices.size
    });
    
    const matchCandidates = [];
    
    // Process each reference word
    referenceWords.forEach((refWord, index) => {
      // Skip already matched words
      if (excludeIndices.has(index)) return;
      
      if (!refWord) {
        logger.warn('Empty reference word at index', { index });
        return;
      }
      
      const refWordForComparison = ignoreCase ? refWord.toLowerCase() : refWord;
      
      // Calculate similarity with error handling
      let similarity = 0;
      try {
        similarity = calculateSimilarityScore(transformedInput, refWordForComparison);
      } catch (error) {
        logger.error('Error calculating similarity', { 
          inputWord, 
          refWord, 
          error 
        });
      }
      
      // Store match candidates for debug logging
      matchCandidates.push({ word: refWord, similarity, index });
      
      if (similarity > similarityThreshold && similarity > bestMatchScore) {
        bestMatchIndex = index;
        bestMatchScore = similarity;
      }
    });
    
    // Log top matches for debugging
    const topMatches = [...matchCandidates]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
      
    logger.debug('Top match candidates', { inputWord, topMatches });
    
    return { 
      index: bestMatchIndex,
      score: bestMatchScore,
      transformedInput,
      match: bestMatchIndex >= 0 ? referenceWords[bestMatchIndex] : null
    };
  } catch (error) {
    logger.error('Error finding best match for word', { error, inputWord });
    return { 
      index: -1, 
      score: 0,
      error: error.message || 'Unknown matching error'
    };
  }
}

// Export the service
export default {
  compareWords,
  findBestMatchingReferenceWord
};
