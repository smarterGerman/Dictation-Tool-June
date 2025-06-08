/**
 * Input processing module for text comparison
 * Combines text normalization, word matching, and similarity scoring
 */

import { normalizeText } from './textNormalizer.js';
import { findBestWordMatches } from './wordMatcher.js';
import { findBestAlignment } from './alignmentUtility.js';
import stateManager from '../utils/stateManager.js';

/**
 * Processes input text and compares it against a reference
 * @param {string} referenceText - The expected text
 * @param {string} inputText - The text entered by the user
 * @return {Object} - Detailed comparison results
 */
export function processInput(referenceText, userInput) {
  // userInput is expected to be already transformed (e.g., oe -> ö)
  // LOG: Entry
  console.log('[processInput] called', { referenceText, userInput });
  if (!referenceText) return { words: [], extraWords: [] };
  if (!userInput) {
    // Return all expected words as missing
    const expectedWords = referenceText.trim().split(/\s+/);
    return {
      words: expectedWords.map(word => ({
        expected: word,
        word: null,
        status: 'missing',
        similarity: 0
      })),
      extraWords: [],
      inputText: '',
      referenceText: referenceText
    };
  }

  // Capitalization sensitivity from stateManager
  const capitalizationSensitive = stateManager.getState('comparison').capitalizationSensitive ?? false;
  
  // Enhanced logging for debugging
  console.log('[DEBUG] processInput capitalization check:', { 
    capitalizationSensitive, 
    stateValue: JSON.stringify(stateManager.getState('comparison')),
    timestamp: new Date().toISOString()
  });

  // Split into words, preserving punctuation as part of words
  const expectedWords = referenceText.trim().split(/\s+/);
  const actualWords = userInput.trim().split(/\s+/);

  // LOG: Words split
  console.log('[processInput] expectedWords', expectedWords, 'actualWords', actualWords);

  // Find best matches between expected and actual words
  const matchResult = findBestWordMatches(expectedWords, actualWords, { capitalizationSensitive });

  // LOG: matchResult
  console.log('[processInput] matchResult', matchResult);

  // Calculate overall stats
  const correctWords = matchResult.words.filter(w => w.status === 'correct').length;
  const misspelledWords = matchResult.words.filter(w => w.status === 'misspelled').length;
  const missingWords = matchResult.words.filter(w => w.status === 'missing').length;
  const extraWords = matchResult.extraWords ? matchResult.extraWords.length : 0;

  // Return rich result object with detailed information
  const result = {
    words: matchResult.words,
    extraWords: matchResult.extraWords,
    stats: {
      correctWords,
      misspelledWords,
      missingWords,
      extraWords,
      totalExpected: expectedWords.length,
      accuracy: expectedWords.length > 0 
        ? correctWords / expectedWords.length 
        : 0
    },
    inputText: userInput, // already transformed
    referenceText: referenceText,
    
    // Add character position tracking
    currentInputPosition: userInput.length,
    charactersTyped: userInput.split(''),
    
    // Map user input positions to reference word indices
    characterMapping: []
  };
  
  // LOG: Final result
  console.log('[processInput] result', result);

  // Calculate which character in user input maps to which word in reference
  let charIndex = 0;
  for (let i = 0; i < expectedWords.length; i++) {
    const word = expectedWords[i];
    for (let j = 0; j < word.length; j++) {
      if (charIndex < userInput.length) {
        result.characterMapping.push({
          inputChar: userInput.charAt(charIndex),
          expectedWord: word,
          wordIndex: i,
          charIndex: j
        });
        charIndex++;
      } else {
        break;
      }
    }
  }
  
  return result;
}

/**
 * Processes input text with character-level tracking
 * @param {string} referenceText - The expected text
 * @param {string} userInput - The text entered by the user
 * @return {Object} - Detailed comparison results with character mapping
 */
export function processInputWithCharacterTracking(referenceText, userInput) {
  // userInput is expected to be already transformed (e.g., oe -> ö)
  // LOG: Entry
  console.log('[processInputWithCharacterTracking] called', { referenceText, userInput });
  const wordMatchResult = processInput(referenceText, userInput);
  // LOG: Result
  console.log('[processInputWithCharacterTracking] result', wordMatchResult);
  return wordMatchResult;
}

/**
 * Builds a mapping between input characters and reference characters
 * @param {Object} wordResult - Result from word matching
 * @param {string} referenceText - Original reference text
 * @param {string} userInput - User input text
 * @return {Array} - Array of character mapping objects
 */
function buildCharacterMapping(wordResult, referenceText, userInput) {
  const charMapping = [];
  
  if (!userInput || !referenceText || !wordResult.words) {
    return charMapping;
  }
  
  const referenceWords = referenceText.split(/\s+/);
  const inputWords = userInput.split(/\s+/);
  
  // Process each input word
  inputWords.forEach((inputWord, inputWordIndex) => {
    // Skip empty words
    if (!inputWord.trim()) return;
    
    // Find corresponding reference word
    let matchedWord = null;
    let matchedWordIndex = -1;
    
    // Look through all matched words to find this input word
    wordResult.words.forEach((wordMatch, wordIndex) => {
      if (wordMatch.word && 
          (wordMatch.inputWordIndex === inputWordIndex ||
           wordMatch.word.toLowerCase() === inputWord.toLowerCase())) {
        matchedWord = wordMatch;
        matchedWordIndex = wordIndex;
      }
    });
    
    // If we found a match
    if (matchedWord && matchedWord.status !== 'missing') {
      const refWord = referenceWords[matchedWordIndex];
      
      // Use Levenshtein-based alignment for robust mapping
      const alignment = findBestAlignment(inputWord, refWord);
      
      // Map each character in input to reference using alignment
      for (let i = 0; i < inputWord.length; i++) {
        const transformedPos = alignment.originalToTransformedMap[i];
        const refPos = transformedPos !== undefined ? alignment.transformedToRefMap[transformedPos] : undefined;
        const refChar = (refPos !== undefined && refPos >= 0 && refPos < refWord.length) ? refWord[refPos] : null;
        
        charMapping.push({
          inputWordIndex,
          inputCharIndex: i,
          wordIndex: matchedWordIndex,
          charIndex: refPos !== undefined ? refPos : -1,
          char: inputWord[i],
          refChar: refChar,
          isMatch: refChar && inputWord[i].toLowerCase() === refChar.toLowerCase(),
          alignmentResult: alignment
        });
      }
    } else {
      // This is an extra word or couldn't be matched
      // Still track its characters but without mapping to reference
      for (let i = 0; i < inputWord.length; i++) {
        charMapping.push({
          inputWordIndex,
          inputCharIndex: i,
          wordIndex: -1,
          charIndex: -1,
          char: inputWord[i],
          refChar: null,
          isMatch: false,
          isExtra: true
        });
      }
    }
  });
  
  return charMapping;
}
