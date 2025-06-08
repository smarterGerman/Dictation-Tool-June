/**
 * UI Manager Module
 * Handles UI rendering and updates for text comparison results
 * Implements the reference-text-only display approach
 */
import { 
  processInput, 
  generateHighlightedHTML, 
  transformSpecialCharacters,
  createAlignment,
  DEFAULT_ALIGNMENT_RESULT,
  calculateSimilarityScore,
  createTextNormalizer,
  compareWords,
  findBestMatchingReferenceWord,
  createAdvancedAlignment
} from './textComparison/index.js';
import { createLogger, LOG_LEVELS } from './utils/logger.js';
// Import the state manager
import stateManager from './utils/stateManager.js';
import { handleShPattern } from './textComparison/uiHelpers.js';
import { findBestAlignment, createTransformationMap, findInsertPositionForMissingChar } from './textComparison/alignmentUtility.js';

// Create a logger for this module
const logger = createLogger('uiManager');

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
  try {
    if (!referenceMapRow) {
      logger.warn('Missing referenceMapRow in updateReferenceMappingDisplay');
      return;
    }
    // LOG: Entry
    console.log('[updateReferenceMappingDisplay] called', { result, referenceText });
    // Clear existing content
    referenceMapRow.innerHTML = '';
    // Generate placeholder container for reference
    const placeholderContainer = generatePlaceholdersForReference(referenceText);
    if (!placeholderContainer) {
      logger.error('Failed to generate placeholders for reference text');
      return;
    }
    referenceMapRow.appendChild(placeholderContainer);
    // If no result, just return the placeholders
    if (!result || !result.inputText) {
      logger.debug('No result data provided, showing empty placeholders');
      return;
    }
    // LOG: Input and reference words
    const inputWords = result.inputText ? result.inputText.trim().split(/\s+/) : [];
    const refWords = referenceText ? referenceText.trim().split(/\s+/) : [];
    console.log('[updateReferenceMappingDisplay] inputWords:', inputWords, 'refWords:', refWords);
    if (!inputWords.length || !refWords.length) {
      logger.warn('No words to process in updateReferenceMappingDisplay');
      return;
    }
    // Track which reference words have already been matched
    const matchedRefIndices = new Set();
    inputWords.forEach((inputWord, inputWordIndex) => {
      if (!inputWord) return;
      // LOG: Processing input word
      console.log('[updateReferenceMappingDisplay] Processing inputWord', inputWord, 'at index', inputWordIndex);
      // Use our helper function to find the best matching reference word
      const matchResult = findBestMatchingReferenceWord(inputWord, refWords, matchedRefIndices);
      let bestMatchIndex = matchResult.index;
      let bestMatchScore = matchResult.score;
      let transformedInput = matchResult.transformedInput;
      // LOG: Best match result
      console.log('[updateReferenceMappingDisplay] matchResult', matchResult);
      // If we found a match, show the ORIGINAL user input with feedback
      if (bestMatchIndex !== -1 && bestMatchScore > 0.5) {
        const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
        if (bestMatchIndex < wordElements.length) {
          const wordElement = wordElements[bestMatchIndex];
          let letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
          const refWord = refWords[bestMatchIndex].toLowerCase();
          let transformedInputWord = transformSpecialCharacters(inputWord.toLowerCase());
          // LOG: Word comparison
          console.log('[updateReferenceMappingDisplay] Comparing', { inputWord, transformedInputWord, refWord });
          // --- FIX: Ensure enough placeholders for all input characters ---
          if (inputWord.length > letterPlaceholders.length) {
            for (let i = letterPlaceholders.length; i < inputWord.length; i++) {
              const newPlaceholder = document.createElement('span');
              newPlaceholder.className = 'letter-placeholder';
              newPlaceholder.textContent = '_';
              newPlaceholder.dataset.position = i.toString();
              newPlaceholder.dataset.letter = inputWord[i] || '';
              wordElement.appendChild(newPlaceholder);
            }
            // Refresh NodeList after appending
            letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
          }
          // LOG: Letter placeholders
          console.log('[updateReferenceMappingDisplay] letterPlaceholders', letterPlaceholders);
          // Transform the entire input word once
          transformedInputWord = transformSpecialCharacters(inputWord.toLowerCase());
          // Special case: input and reference only differ by trailing punctuation
          const textNormalizer = createTextNormalizer();
          const inputNoPunct = textNormalizer.removePunctuation(inputWord);
          const refNoPunct = textNormalizer.removePunctuation(refWord);
          if (inputNoPunct === refNoPunct) {
            for (let i = 0; i < Math.min(inputWord.length, refWord.length); i++) {
              const letterSpan = letterPlaceholders[i];
              if (letterSpan) {
                letterSpan.classList.remove('misspelled');
                letterSpan.classList.add('correct');
                letterSpan.textContent = inputWord[i];
                letterSpan.classList.add('revealed');
                letterSpan.setAttribute('data-original-char', inputWord[i]);
              }
            }
            // Optionally, mark any extra trailing punctuation as missing or correct as you wish
            return;
          }
          // Use our helper function to compare words with proper error handling
          const comparison = compareWords(inputWord, refWord);
          // Only use substringStart if needed for partial matches
          let substringStart = 0;
          // Early return if it's a complete match ignoring punctuation
          if (comparison.isCleanMatch) {
            logger.debug('Complete match ignoring punctuation:', { inputWord, refWord });
            for (let i = 0; i < inputWord.length; i++) {
              const refPos = i;
              if (refPos < letterPlaceholders.length) {
                const letterSpan = letterPlaceholders[refPos];
                if (letterSpan) {
                  letterSpan.textContent = inputWord[i];
                  letterSpan.classList.add('revealed');
                  letterSpan.classList.add('correct');
                  letterSpan.setAttribute('data-original-char', inputWord[i]);
                }
              }
            }
            // Optionally, mark any extra trailing punctuation as missing or correct as you wish
            return;
          }
          // LOG: Per-letter comparison
          for (let i = 0; i < inputWord.length; i++) {
            const refPos = substringStart + i;
            if (refPos < letterPlaceholders.length) {
              const letterSpan = letterPlaceholders[refPos];
              letterSpan.textContent = inputWord[i];
              letterSpan.classList.add('revealed');
              letterSpan.setAttribute('data-original-char', inputWord[i]);
              // Fix: Check for undefined before calling toLowerCase
              if (
                typeof inputWord[i] !== 'undefined' &&
                typeof refWord[refPos] !== 'undefined' &&
                inputWord[i].toLowerCase() === refWord[refPos].toLowerCase()
              ) {
                letterSpan.classList.add('correct');
                // Force reflow to ensure style is applied
                void letterSpan.offsetHeight;
              } else {
                letterSpan.classList.add('misspelled');
                console.log('Misspelled letter:', inputWord[i], 'should be', refWord[refPos], 'at', refPos);
              }
            }
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error in updateReferenceMappingDisplay', error);
    console.error('[updateReferenceMappingDisplay] Exception:', error);
  }
}

// Removed deprecated transformGermanInput function - use transformSpecialCharacters from textNormalizer.js instead

/**
 * Calculate similarity between two strings using a combination of bigrams and trigrams
 * @param {string} str1 - First string (should be transformed already)
 * @param {string} str2 - Second string (should be transformed already)
 * @returns {number} - Similarity score between 0 and 1
 */
// Function removed to use the imported calculateSimilarityScore from textComparison/similarityScoring.js

// Alignment and mapping helpers are now imported from alignmentUtility.js
// (findBestAlignment, createTransformationMap, findInsertPositionForMissingChar)

/**
 * Handle special case for "sh" vs "sch" pattern
 * @param {HTMLElement} wordElement - The word element to update
 * @param {string} inputWord - The original input word
 * @param {string} transformedInputWord - The transformed input word
 * @param {string} refWord - The reference word
 */
// handleShPattern is now imported from textComparison/uiHelpers.js

// Capitalization toggle state (read from stateManager)
function isCapitalizationSensitive() {
  return stateManager.get('capitalizationSensitive') === true;
}

// Listen for capitalization toggle changes and re-render input/results as needed
if (typeof window !== 'undefined' && window.document) {
  document.addEventListener('capitalizationToggleChanged', () => {
    // You may want to trigger a re-render of the current segment/input/results here
    // For now, just log for debugging
    logger.info('Capitalization toggle changed, UI should update');
    // TODO: Call the appropriate update functions for input/results
  });
}
