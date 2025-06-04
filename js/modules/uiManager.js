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
  
  // Add expected words with appropriate styling
  comparisonResult.words.forEach(wordResult => {
    const wordElement = document.createElement('span');
    wordElement.textContent = wordResult.word || wordResult.expected;
    
    // Apply appropriate class based on status
    switch (wordResult.status) {
      case 'correct':
        wordElement.classList.add('word-correct');
        break;
      case 'misspelled':
        wordElement.classList.add('word-misspelled');
        wordElement.setAttribute('title', `Expected: ${wordResult.expected}`);
        break;
      case 'missing':
        wordElement.classList.add('word-missing');
        break;
    }
    
    containerElement.appendChild(wordElement);
    containerElement.appendChild(document.createTextNode(' '));
  });
  
  // Add extra words if any
  if (comparisonResult.extraWords && comparisonResult.extraWords.length > 0) {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('extra-words-container');
    
    const extraLabel = document.createElement('span');
    extraLabel.textContent = 'Extra words: ';
    extraContainer.appendChild(extraLabel);
    
    comparisonResult.extraWords.forEach(extraWord => {
      const wordElement = document.createElement('span');
      wordElement.textContent = extraWord.word;
      wordElement.classList.add('word-extra');
      extraContainer.appendChild(wordElement);
      extraContainer.appendChild(document.createTextNode(' '));
    });
    
    containerElement.appendChild(extraContainer);
  }
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
