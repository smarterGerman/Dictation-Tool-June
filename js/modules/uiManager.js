/**
 * UI Manager Module
 * Handles UI rendering and updates for text comparison results
 */
import { processInput } from './textComparison/index.js';

/**
 * Updates the UI with comparison results
 * @param {Object} comparisonResult - Result from processInput
 * @param {HTMLElement} containerElement - Container for displaying results
 */
export function updateInputDisplay(comparisonResult, containerElement) {
  // Clear previous content
  containerElement.innerHTML = '';
  
  // No results or empty input, don't show anything
  if (!comparisonResult || !comparisonResult.words) {
    return;
  }
  
  // Get actual user input text to determine what to show
  const userInput = comparisonResult.inputText || '';
  
  // If there's no user input, don't show anything
  if (!userInput.trim()) {
    return;
  }
  
  // Instead of filtering expected words, directly use the user's input text
  const userWords = userInput.trim().split(/\s+/);
  
  // Process each word the user typed
  userWords.forEach(userWord => {
    const wordElement = document.createElement('span');
    wordElement.textContent = userWord;
    
    // Find if this word matches any word in the comparison results
    const matchedWord = comparisonResult.words.find(w => 
      w.word === userWord || // Exact match
      (w.word && w.word.toLowerCase() === userWord.toLowerCase()) // Case-insensitive match
    );
    
    // Apply appropriate class based on match status
    if (matchedWord && matchedWord.status === 'correct') {
      wordElement.classList.add('word-correct');
    } else if (matchedWord && matchedWord.status === 'misspelled') {
      wordElement.classList.add('word-misspelled');
      wordElement.setAttribute('title', `Expected: ${matchedWord.expected}`);
    } else {
      // Word didn't match any expected word, might be extra
      const extraMatch = comparisonResult.extraWords && 
        comparisonResult.extraWords.find(e => e.word === userWord);
      
      if (extraMatch) {
        wordElement.classList.add('word-extra');
      } else {
        // Unclassified word - could be waiting for more matches
        wordElement.classList.add('word-unverified');
      }
    }
    
    containerElement.appendChild(wordElement);
    containerElement.appendChild(document.createTextNode(' '));
  });
}

/**
 * Generate statistics for input results
 * @param {Array} segmentResults - Array of comparison results for each segment
 * @return {Object} - Statistics about words, accuracy, etc.
 */
export function calculateStats(segmentResults) {
  let totalWords = 0;
  let correctWords = 0;
  let misspelledWords = 0;
  let missingWords = 0;
  let extraWords = 0;
  
  segmentResults.forEach(result => {
    if (!result || !result.words) return;
    
    result.words.forEach(word => {
      totalWords++;
      if (word.status === 'correct') correctWords++;
      else if (word.status === 'misspelled') misspelledWords++;
      else if (word.status === 'missing') missingWords++;
    });
    
    if (result.extraWords) {
      extraWords += result.extraWords.length;
    }
  });
  
  return {
    totalWords,
    correctWords,
    misspelledWords,
    missingWords,
    extraWords,
    accuracy: totalWords > 0 ? (correctWords / totalWords * 100).toFixed(1) : 0
  };
}
