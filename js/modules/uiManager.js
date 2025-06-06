/**
 * UI Manager Module
 * Handles UI rendering and updates for text comparison results
 * Implements the reference-text-only display approach
 */
import { processInput, generateHighlightedHTML } from './textComparison/index.js';

/**
 * Updates the UI with comparison results, showing reference text with highlighting
 * @param {Object} comparisonResult - Result from processInput
 * @param {HTMLElement} containerElement - Container for displaying results
 * @param {string} referenceText - The original reference text to display
 */
export function updateInputDisplay(comparisonResult, containerElement, referenceText) {
  // Clear previous content
  containerElement.innerHTML = '';
  
  // No results, just show the reference text without highlighting
  if (!comparisonResult || !comparisonResult.words) {
    displayReferenceText(containerElement, referenceText);
    return;
  }
  
  // Display reference text with appropriate highlighting based on user input
  displayHighlightedReference(containerElement, comparisonResult, referenceText);
}

/**
 * Display reference text with highlighting based on word matches
 * @param {HTMLElement} containerElement - Container for display
 * @param {Object} result - Comparison result object
 * @param {string} referenceText - Original reference text
 */
function displayHighlightedReference(containerElement, result, referenceText) {
  // If no reference text, don't show anything
  if (!referenceText) return;
  
  const refWords = referenceText.split(/\s+/);
  
  // Process each word in the reference text
  refWords.forEach((refWord, i) => {
    const wordElement = document.createElement('span');
    wordElement.textContent = refWord;
    
    // Find matching information for this reference word
    const matchInfo = result.words && result.words[i];
    
    if (matchInfo) {
      // Apply appropriate class based on match status
      if (matchInfo.status === 'correct') {
        wordElement.classList.add('ref-word-correct');
      } else if (matchInfo.status === 'misspelled') {
        wordElement.classList.add('ref-word-misspelled');
        if (matchInfo.word) {
          wordElement.setAttribute('title', `User typed: ${matchInfo.word}`);
        }
      } else if (matchInfo.status === 'missing') {
        wordElement.classList.add('ref-word-missing');
      }
    } else {
      // Default unmatched style
      wordElement.classList.add('ref-word-unmatched');
    }
    
    containerElement.appendChild(wordElement);
    containerElement.appendChild(document.createTextNode(' '));
  });
  
  // Show any extra words the user typed at the end
  if (result.extraWords && result.extraWords.length > 0) {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('extra-words-container');
    
    const extraLabel = document.createElement('span');
    extraLabel.textContent = 'Extra words: ';
    extraLabel.classList.add('extra-words-label');
    extraContainer.appendChild(extraLabel);
    
    result.extraWords.forEach(extra => {
      const extraWord = document.createElement('span');
      extraWord.textContent = extra.word;
      extraWord.classList.add('extra-word');
      extraContainer.appendChild(extraWord);
      extraContainer.appendChild(document.createTextNode(' '));
    });
    
    containerElement.appendChild(extraContainer);
  }
}

/**
 * Display plain reference text (when no user input)
 * @param {HTMLElement} containerElement - Container for display
 * @param {string} referenceText - Text to display
 */
function displayReferenceText(containerElement, referenceText) {
  if (!referenceText) return;
  
  const refElement = document.createElement('div');
  refElement.classList.add('reference-text');
  refElement.textContent = referenceText;
  containerElement.appendChild(refElement);
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

/**
 * Determine if the user input is a complete match for the reference text
 * @param {Object} comparisonResult - Result from processInput
 * @return {boolean} - True if the input is a complete match
 */
export function isCompleteMatch(comparisonResult) {
  if (!comparisonResult || !comparisonResult.isMatch) {
    return false;
  }
  return comparisonResult.isMatch === true;
}

/**
 * Generate HTML representation of text comparison results for display
 * This can be injected directly into the container for rich formatting
 * @param {Object} comparisonResult - Result from processInput
 * @param {string} referenceText - The original reference text
 * @return {string} - HTML string with appropriate highlighting
 */
export function generateResultHTML(comparisonResult, referenceText) {
  // If we have a pre-generated HTML result, use it
  if (comparisonResult && comparisonResult.highlightedHtml) {
    return comparisonResult.highlightedHtml;
  }
  
  // No comparison results, just return the reference text wrapped
  if (!comparisonResult || !comparisonResult.words) {
    return `<div class="reference-text">${referenceText || ''}</div>`;
  }
  
  let html = '';
  const refWords = referenceText.split(/\s+/);
  
  // Build HTML for each word in the reference text
  refWords.forEach((refWord, i) => {
    const matchInfo = comparisonResult.words && comparisonResult.words[i];
    let wordClass = 'ref-word-unmatched';
    let titleAttr = '';
    
    if (matchInfo) {
      if (matchInfo.status === 'correct') {
        wordClass = 'ref-word-correct';
      } else if (matchInfo.status === 'misspelled') {
        wordClass = 'ref-word-misspelled';
        titleAttr = matchInfo.word ? ` title="User typed: ${matchInfo.word}"` : '';
      } else if (matchInfo.status === 'missing') {
        wordClass = 'ref-word-missing';
      }
    }
    
    html += `<span class="${wordClass}"${titleAttr}>${refWord}</span> `;
  });
  
  // Add extra words if any
  if (comparisonResult.extraWords && comparisonResult.extraWords.length > 0) {
    html += '<div class="extra-words-container"><span class="extra-words-label">Extra words: </span>';
    comparisonResult.extraWords.forEach(extra => {
      html += `<span class="extra-word">${extra.word}</span> `;
    });
    html += '</div>';
  }
  
  return html;
}

/**
 * Generate underscore placeholders for reference text
 * @param {string} referenceText - The original reference text
 * @returns {HTMLElement} - Container with underscore placeholders
 */
export function generatePlaceholdersForReference(referenceText) {
  const container = document.createElement('div');
  container.classList.add('reference-placeholders');
  
  const words = referenceText.split(/\s+/);
  
  words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('word-placeholder');
    wordSpan.dataset.expectedWord = word;
    
    // Create underscores for each letter
    for (let i = 0; i < word.length; i++) {
      const letterSpan = document.createElement('span');
      letterSpan.classList.add('letter-placeholder');
      letterSpan.textContent = '_';
      letterSpan.dataset.position = i;
      letterSpan.dataset.letter = word[i];
      wordSpan.appendChild(letterSpan);
    }
    
    container.appendChild(wordSpan);
    
    // Add space between words, but not after the last word
    if (index < words.length - 1) {
      container.appendChild(document.createTextNode(' '));
    }
  });
  
  return container;
}

/**
 * Update placeholders based on comparison results with character-by-character display
 * @param {Object} result - Comparison result from processInput
 * @param {HTMLElement} placeholderContainer - Container with placeholders
 */
export function updatePlaceholders(result, placeholderContainer) {
  if (!result || !placeholderContainer) return;
  
  const allWords = placeholderContainer.querySelectorAll('.word-placeholder');
  
  // Reset all words and letters to base state
  allWords.forEach(word => {
    word.className = 'word-placeholder';
    const letters = word.querySelectorAll('.letter-placeholder');
    letters.forEach(letter => {
      letter.textContent = '_';
      letter.className = 'letter-placeholder';
    });
  });
  
  // Modified section to prioritize input word order over reference order
  // First get the input words
  if (result.inputText) {
    const inputWords = result.inputText.trim().split(/\s+/);
    
    // Process each input word in the order the user typed them
    inputWords.forEach((inputWord, inputWordIndex) => {
      if (!inputWord) return;
      
      // Find which reference word this input word matches with
      let bestMatchIndex = -1;
      let bestMatchScore = 0;
      
      // Check all reference words to find the best match for this input word
      result.words.forEach((wordResult, refWordIndex) => {
        let matchScore = 0;
        
        // Exact match by index
        if (wordResult.inputWordIndex === inputWordIndex) {
          matchScore = 1.0;
        }
        // Match by content
        else if (wordResult.expected && inputWord && 
                 wordResult.expected.toLowerCase() === inputWord.toLowerCase()) {
          matchScore = 0.9;
        }
        // Partial match (for misspelled words)
        else if (wordResult.word && inputWord && 
                 wordResult.word.toLowerCase() === inputWord.toLowerCase()) {
          matchScore = 0.8;
        }
        
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          bestMatchIndex = refWordIndex;
        }
      });
      
      // If we found a match, reveal that word
      if (bestMatchIndex !== -1 && bestMatchIndex < allWords.length && bestMatchScore > 0.5) {
        const wordElement = allWords[bestMatchIndex];
        const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        const wordStatus = result.words[bestMatchIndex].status;
        
        // Add status class to the word
        wordElement.classList.add(`word-${wordStatus}`);
        
        // Show all characters in the matched word
        for (let i = 0; i < letterPlaceholders.length; i++) {
          const letterSpan = letterPlaceholders[i];
          letterSpan.textContent = letterSpan.dataset.letter;
          letterSpan.classList.add('revealed');
          
          // Apply status class to each letter
          if (wordStatus === 'correct') {
            letterSpan.classList.add('correct');
          } else if (wordStatus === 'misspelled') {
            letterSpan.classList.add('misspelled');
          }
        }
      }
    });
  }
  
  // Handle extra words display (unchanged)
  if (result.extraWords && result.extraWords.length > 0) {
    let extraWordsContainer = placeholderContainer.querySelector('.extra-words-container');
    
    // Create container for extra words if it doesn't exist
    if (!extraWordsContainer) {
      extraWordsContainer = document.createElement('div');
      extraWordsContainer.classList.add('extra-words-container');
      placeholderContainer.appendChild(extraWordsContainer);
    } else {
      // Clear existing content
      extraWordsContainer.innerHTML = '';
    }
    
    // Add label for extra words
    const labelSpan = document.createElement('span');
    labelSpan.textContent = 'Extra: ';
    extraWordsContainer.appendChild(labelSpan);
    
    // Add each extra word
    result.extraWords.forEach(extraWord => {
      const wordSpan = document.createElement('span');
      wordSpan.textContent = extraWord.word;
      wordSpan.classList.add('word-extra');
      extraWordsContainer.appendChild(wordSpan);
      extraWordsContainer.appendChild(document.createTextNode(' '));
    });
  } else {
    // Remove extra words container if no extra words
    const extraWordsContainer = placeholderContainer.querySelector('.extra-words-container');
    if (extraWordsContainer) {
      extraWordsContainer.remove();
    }
  }
}

/**
 * Creates a dual input display: raw input (immediate) and reference mapping (disambiguated)
 * @param {HTMLElement} container - The container to append the displays to
 * @returns {Object} - { rawInputDisplay, referenceMapRow }
 */
export function createDualInputDisplay(container) {
  // Create reference mapping row FIRST (should be on top)
  const referenceMapRow = document.createElement('div');
  referenceMapRow.className = 'reference-map-row';
  
  // Create raw input display row SECOND (should be below)
  const rawInputRow = document.createElement('div');
  rawInputRow.className = 'raw-input-row';

  // Create raw input display element
  const rawInputDisplay = document.createElement('div');
  rawInputDisplay.className = 'raw-input-display';
  rawInputDisplay.setAttribute('aria-live', 'polite');

  // Add elements to container in REVERSE ORDER:
  container.appendChild(referenceMapRow); // Reference mapping on top
  rawInputRow.appendChild(rawInputDisplay);
  container.appendChild(rawInputRow);     // Raw input below

  return {
    rawInputDisplay,
    referenceMapRow
  };
}

/**
 * Updates the raw input display with the user's current input
 * @param {HTMLElement} rawInputDisplay - The raw input display element
 * @param {string} input - The user's raw input
 */
export function updateRawInputDisplay(rawInputDisplay, input) {
  if (rawInputDisplay) {
    rawInputDisplay.textContent = input;
  }
}

/**
 * Updates the reference mapping display with disambiguated character-by-character feedback
 * @param {HTMLElement} referenceMapRow - The reference mapping display element
 * @param {Object} result - The result from processInputWithCharacterTracking
 * @param {string} referenceText - The reference text
 */
export function updateReferenceMappingDisplay(referenceMapRow, result, referenceText) {
  if (!referenceMapRow) return;
  referenceMapRow.innerHTML = '';

  // Generate placeholder container for reference
  const placeholderContainer = generatePlaceholdersForReference(referenceText);
  referenceMapRow.appendChild(placeholderContainer);
  
  // If no result, just return the placeholders
  if (!result || !result.inputText) {
    return;
  }
  
  // Get reference words and input words
  const refWords = referenceText.trim().split(/\s+/);
  const inputWords = result.inputText.trim().split(/\s+/);
  
  // Track which reference words have already been matched
  const matchedRefIndices = new Set();
  
  // Process each input word in the order the user typed them
  inputWords.forEach((inputWord, inputWordIndex) => {
    if (!inputWord) return;
    
    // Find which reference word this input word matches with
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    let bestMatchIsPartial = false;
    let bestMatchStart = 0;
    let bestMatchEnd = 0;
    
    // Check all reference words to find the best match for this input word
    refWords.forEach((refWord, refWordIndex) => {
      // Skip reference words that are already matched
      if (matchedRefIndices.has(refWordIndex)) return;
      
      // EXACT MATCH: The input word exactly matches this reference word
      if (inputWord.toLowerCase() === refWord.toLowerCase()) {
        // This is a perfect match!
        if (100 > bestMatchScore) {
          bestMatchScore = 100;
          bestMatchIndex = refWordIndex;
          bestMatchIsPartial = false;
        }
        return;
      }
      
      // FULL PREFIX MATCH: Input word is the entire first part of reference word
      if (refWord.toLowerCase().startsWith(inputWord.toLowerCase()) && 
          inputWord.length >= 3) { // Require at least 3 chars to match prefix
        // This is a good prefix match
        const score = 70 + (inputWord.length / refWord.length * 20);
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchIndex = refWordIndex;
          bestMatchIsPartial = true;
          bestMatchStart = 0;
          bestMatchEnd = inputWord.length;
        }
        return;
      }
      
      // FULL SUFFIX MATCH: Input word is the entire last part of reference word
      if (refWord.toLowerCase().endsWith(inputWord.toLowerCase()) && 
          inputWord.length >= 3) { // Require at least 3 chars to match suffix
        const score = 60 + (inputWord.length / refWord.length * 20);
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchIndex = refWordIndex;
          bestMatchIsPartial = true;
          bestMatchStart = refWord.length - inputWord.length;
          bestMatchEnd = refWord.length;
        }
        return;
      }
      
      // MISSPELLED WORD MATCH: Words that are very similar (like "berlim" vs "berlin")
      if (inputWord.length >= 3) {  // Only consider significant words
        // Calculate similarity score
        let sameChars = 0;
        const maxLen = Math.max(inputWord.length, refWord.length);
        const minLen = Math.min(inputWord.length, refWord.length);
        
        for (let i = 0; i < minLen; i++) {
          if (inputWord[i].toLowerCase() === refWord[i].toLowerCase()) {
            sameChars++;
          }
        }
        
        const similarityScore = (sameChars / maxLen) * 100;
        
        if (similarityScore >= 65 && similarityScore < 100) {
          const score = similarityScore;
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatchIndex = refWordIndex;
            bestMatchIsPartial = true;
            bestMatchStart = 0;
            bestMatchEnd = refWord.length;
          }
        }
      }
    }); // End of refWords.forEach
    
    // If we found a match, reveal that word and mark it as matched
    if (bestMatchIndex !== -1 && bestMatchScore > 50) {
      // For exact matches, we want to prevent reuse
      if (!bestMatchIsPartial) {
        matchedRefIndices.add(bestMatchIndex);
      }
      
      const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
      if (bestMatchIndex < wordElements.length) {
        const wordElement = wordElements[bestMatchIndex];
        const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        
        // Only use status for exact matches
        const wordStatus = !bestMatchIsPartial ? 
                          (result.words[bestMatchIndex]?.status || 'correct') : 
                          'progress';
        
        // Add appropriate class
        if (wordStatus === 'correct') {
          wordElement.classList.add('word-correct');
        } else if (wordStatus === 'misspelled') {
          wordElement.classList.add('word-misspelled');
        } else {
          wordElement.classList.add('word-progress');
        }
        
        // IMPORTANT: Only reveal the specific letters that were matched
        // For partial matches: only reveal the matched portion
        // For exact matches: reveal the whole word
        
        const startIdx = bestMatchIsPartial ? bestMatchStart : 0;
        const endIdx = bestMatchIsPartial ? bestMatchEnd : letterPlaceholders.length;
        
        for (let i = 0; i < letterPlaceholders.length; i++) {
          const letterSpan = letterPlaceholders[i];
          
          // Only reveal letters in the matched range
          if (i >= startIdx && i < endIdx) {
            letterSpan.textContent = letterSpan.dataset.letter;
            letterSpan.classList.add('revealed');
            
            // Only apply styling for exact matches or correct partial matches
            if (!bestMatchIsPartial && wordStatus === 'correct') {
              letterSpan.classList.add('correct');
            } else if (!bestMatchIsPartial && wordStatus === 'misspelled') {
              letterSpan.classList.add('misspelled');
            } else if (bestMatchIsPartial) {
              // For partial matches, check if the letter matches
              // Need to adjust the index based on the match start position
              const inputIndex = i - bestMatchStart;
              
              if (inputIndex >= 0 && inputIndex < inputWord.length) {
                // Show the actual character the user typed, not the reference character
                letterSpan.textContent = inputWord[inputIndex];
                
                // Apply correct/misspelled styling based on match
                if (letterSpan.dataset.letter.toLowerCase() === inputWord[inputIndex].toLowerCase()) {
                  letterSpan.classList.add('correct');
                } else {
                  letterSpan.classList.add('misspelled');
                }
              } else {
                letterSpan.textContent = letterSpan.dataset.letter;
                letterSpan.classList.add('progress');
              }
            }
          }
        } // End of for loop
      }
    } // End of if (bestMatchIndex...)
  }); // End of inputWords.forEach
} // End of function updateReferenceMappingDisplay
