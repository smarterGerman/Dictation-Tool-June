/**
 * Input processing module for text comparison
 * Combines text normalization, word matching, and similarity scoring
 */

import { normalizeText } from './textNormalizer.js';
import { findBestWordMatches } from './wordMatcher.js';

/**
 * Processes input text and compares it against a reference
 * @param {string} referenceText - The expected text
 * @param {string} inputText - The text entered by the user
 * @return {Object} - Detailed comparison results
 */
export function processInput(referenceText, userInput) {
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
  
  // Split into words, preserving punctuation as part of words
  const expectedWords = referenceText.trim().split(/\s+/);
  const actualWords = userInput.trim().split(/\s+/);
  
  // Find best matches between expected and actual words
  const matchResult = findBestWordMatches(expectedWords, actualWords);
  
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
    inputText: userInput,
    referenceText: referenceText,
    
    // Add character position tracking
    currentInputPosition: userInput.length,
    charactersTyped: userInput.split(''),
    
    // Map user input positions to reference word indices
    characterMapping: []
  };
  
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
