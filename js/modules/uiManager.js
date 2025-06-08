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
  createAdvancedAlignment,
  normalizeForComparison
} from './textComparison/index.js';
import { createLogger, LOG_LEVELS } from './utils/logger.js';
// Import the state manager
import stateManager from './utils/stateManager.js';

function isCapitalizationSensitive() {
  return stateManager.getState('comparison')?.capitalizationSensitive ?? false;
}

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
    // Create underscores for each letter, but skip punctuation
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (/[.,!?;:()\[\]{}"'«»„“”]/.test(char)) continue; // skip punctuation
      const letterSpan = document.createElement('span');
      letterSpan.className = 'letter-placeholder';
      letterSpan.textContent = '_';
      letterSpan.dataset.position = i.toString();
      letterSpan.dataset.letter = char;
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

  // Build a map from stripped reference word to word-placeholder element
  const wordMap = {};
  allWords.forEach(wordEl => {
    const expected = wordEl.dataset.expectedWord;
    wordMap[normalizeForComparison(expected)] = wordEl;
  });

  // Reset all words and letters to base state
  allWords.forEach(word => {
    word.className = 'word-placeholder';
    const letters = word.querySelectorAll('.letter-placeholder');
    letters.forEach(letter => {
      letter.textContent = '_';
      letter.className = 'letter-placeholder';
    });
  });

  // Get input words
  if (result.inputText) {
    const inputWords = result.inputText.trim().split(/\s+/);
    inputWords.forEach((inputWord, inputWordIndex) => {
      if (!inputWord) return;
      // Find best match among result.words (which are in reference order)
      let bestMatchIndex = -1;
      let bestMatchScore = 0;
      result.words.forEach((wordResult, refWordIndex) => {
        let matchScore = 0;
        const refStripped = normalizeForComparison(wordResult.expected || '');
        if (inputWord === refStripped) {
          matchScore = 1.0;
        } else if (wordResult.word && inputWord === wordResult.word) {
          matchScore = 0.9;
        }
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          bestMatchIndex = refWordIndex;
        }
      });
      if (bestMatchIndex !== -1 && bestMatchScore > 0.5) {
        const refStripped = normalizeForComparison(result.words[bestMatchIndex].expected || '');
        const wordElement = wordMap[refStripped];
        if (!wordElement) return;
        const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        const wordStatus = result.words[bestMatchIndex].status;
        const refWord = result.words[bestMatchIndex].expected || '';
        wordElement.classList.add(`word-${wordStatus}`);
        if (wordStatus === 'correct') {
          // Show all letters as correct
          for (let i = 0; i < letterPlaceholders.length; i++) {
            letterPlaceholders[i].textContent = inputWord[i] || '_';
            letterPlaceholders[i].classList.add('revealed', 'correct');
          }
        } else if (wordStatus === 'misspelled') {
          // Per-letter feedback using alignment
          const alignment = createAlignment(inputWord, refWord);
          // Map from input index to ref index
          const inputToRef = alignment.transformedToRefMap || {};
          // Map from ref index to input index
          const refToInput = {};
          Object.entries(inputToRef).forEach(([inputIdx, refIdx]) => {
            refToInput[refIdx] = parseInt(inputIdx, 10);
          });
          // For each reference letter, show the corresponding input letter if present
          for (let i = 0; i < letterPlaceholders.length; i++) {
            const letterSpan = letterPlaceholders[i];
            if (refToInput.hasOwnProperty(i) && typeof refToInput[i] === 'number') {
              const inputIdx = refToInput[i];
              const inputChar = inputWord[inputIdx];
              letterSpan.textContent = inputChar;
              letterSpan.classList.add('revealed');
              if (inputChar && refWord[i] && inputChar.toLowerCase() === refWord[i].toLowerCase()) {
                letterSpan.classList.add('correct');
              } else {
                letterSpan.classList.add('misspelled');
              }
            } else {
              // No input for this reference letter (missing)
              letterSpan.textContent = '_';
              letterSpan.className = 'letter-placeholder';
            }
          }
          // If input is longer than reference, add extra placeholders for extra letters
          if (inputWord.length > letterPlaceholders.length) {
            for (let i = letterPlaceholders.length; i < inputWord.length; i++) {
              const extraSpan = document.createElement('span');
              extraSpan.className = 'letter-placeholder revealed misspelled';
              extraSpan.textContent = inputWord[i];
              wordElement.appendChild(extraSpan);
            }
          }
        } else {
          // For missing or other statuses, keep default underscores
        }
      }
    });
  }
  // Handle extra words display (unchanged)
  if (result.extraWords && result.extraWords.length > 0) {
    let extraWordsContainer = placeholderContainer.querySelector('.extra-words-container');
    if (!extraWordsContainer) {
      extraWordsContainer = document.createElement('div');
      extraWordsContainer.classList.add('extra-words-container');
      placeholderContainer.appendChild(extraWordsContainer);
    } else {
      extraWordsContainer.innerHTML = '';
    }
    const labelSpan = document.createElement('span');
    labelSpan.textContent = 'Extra: ';
    extraWordsContainer.appendChild(labelSpan);
    result.extraWords.forEach(extraWord => {
      const wordSpan = document.createElement('span');
      wordSpan.textContent = extraWord.word;
      wordSpan.classList.add('word-extra');
      extraWordsContainer.appendChild(wordSpan);
      extraWordsContainer.appendChild(document.createTextNode(' '));
    });
  } else {
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
 * Updates the reference mapping display with highlighting for correct, misspelled, and missing words.
 * Ensures that all 'misspelled' words are colored red, regardless of capitalization or spelling error, and regardless of Aa toggle.
 * Adds a debug log before coloring to confirm the status.
 * @param {HTMLElement} referenceMapRow - The reference mapping display element
 * @param {Object} result - The result from processInputWithCharacterTracking
 * @param {string} referenceText - The reference text
 */
export function updateReferenceMappingDisplay(referenceMapRow, result, referenceText) {
  try {
    if (!referenceMapRow) {
      console.warn('[UI] Missing referenceMapRow in updateReferenceMappingDisplay');
      return;
    }
    referenceMapRow.innerHTML = '';

    // Always use normalized, punctuation-stripped reference words
    const refWordsRaw = referenceText ? referenceText.trim().split(/\s+/) : [];
    const refWords = refWordsRaw.map(w => normalizeForComparison(w, false));
    console.log('[UI] Normalized reference words:', refWords);

    if (!refWords.length) {
      console.warn('[UI] No reference words after normalization');
      return;
    }

    const inputWordsRaw = result.inputText ? result.inputText.trim().split(/\s+/) : [];
    const inputWords = inputWordsRaw.map(w => normalizeForComparison(w, false));
    console.log('[UI] Normalized input words:', inputWords);

    function generatePlaceholdersForStrippedReference(refWords, inputWords) {
      const container = document.createElement('div');
      container.classList.add('reference-placeholders');
      refWords.forEach((refWord, index) => {
        // Find the matching input word for this reference word (if any)
        let inputWord = '';
        let matchIdx = -1;
        inputWords.forEach((iw, iwIdx) => {
          if (matchIdx === -1 && iw && iw.length > 0) {
            // Use the same matching logic as below
            if (iw === refWord || refWord.includes(iw) || iw.includes(refWord)) {
              inputWord = iw;
              matchIdx = iwIdx;
            }
          }
        });
        // If not found, just use the first unmatched input word
        if (!inputWord && inputWords[index]) inputWord = inputWords[index];
        const maxLen = Math.max(refWord.length, inputWord ? inputWord.length : 0);
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word-placeholder');
        wordSpan.dataset.expectedWord = refWord;
        for (let i = 0; i < maxLen; i++) {
          const char = refWord[i] || '';
          const letterSpan = document.createElement('span');
          letterSpan.className = 'letter-placeholder';
          letterSpan.textContent = '_';
          letterSpan.dataset.position = i.toString();
          letterSpan.dataset.letter = char;
          wordSpan.appendChild(letterSpan);
        }
        container.appendChild(wordSpan);
      });
      return container;
    }

    const placeholderContainer = generatePlaceholdersForStrippedReference(refWords, inputWords);
    if (!placeholderContainer) {
      console.error('[UI] Failed to generate placeholders for reference text');
      return;
    }
    referenceMapRow.appendChild(placeholderContainer);

    // Ensure matchedRefIndices is declared in the correct scope
    const matchedRefIndices = new Set();
    console.log('DEBUG: matchedRefIndices initialized:', matchedRefIndices);

    inputWords.forEach((inputWord, inputWordIndex) => {
      if (!inputWord) return;
      let bestMatchIndex = -1;
      let bestMatchScore = 0;
      let matchStatus = 'missing';
      let matchResult = null;

      refWords.forEach((refWord, refIndex) => {
        // Debug log to check matchedRefIndices before usage
        console.log('DEBUG: matchedRefIndices before has() call:', matchedRefIndices);
        if (matchedRefIndices.has(refIndex)) return;
        if (inputWord.length <= 2 || refWord.length <= 2) {
          console.log('[UI] Short word normalization:', { inputWord, refWord });
        }
        const alignment = createAlignment(inputWord, refWord);
        let score = 0;
        if (inputWord === refWord) score = 1.0;
        else if (refWord.includes(inputWord) || inputWord.includes(refWord)) score = 0.8;
        else if (alignment && alignment.matchedIndices && alignment.matchedIndices.length > 0) {
          score = alignment.matchedIndices.length / Math.max(inputWord.length, refWord.length);
        }
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchIndex = refIndex;
          matchStatus = score === 1.0 ? 'correct' : 'misspelled';
          matchResult = { inputWord, refWord, score, alignment };
        }
      });

      console.log('[UI] Word mapping:', { inputWord, bestMatchIndex, bestMatchScore, matchStatus, matchResult });

      if (bestMatchIndex !== -1 && bestMatchScore > 0.3) {
        matchedRefIndices.add(bestMatchIndex);
        const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
        if (bestMatchIndex < wordElements.length) {
          const wordElement = wordElements[bestMatchIndex];
          let letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
          // Defensive: handle short words (especially 2-letter words)
          if (inputWord.length > letterPlaceholders.length) {
            console.warn('[UI] Input word longer than reference word (possible extra char):', inputWord, refWords[bestMatchIndex]);
          }
          // Use alignment for per-letter feedback
          const alignment = matchResult && matchResult.alignment ? matchResult.alignment : null;
          const refToInput = {};
          if (alignment && alignment.matchedIndices) {
            alignment.matchedIndices.forEach(({ inputPos, refPos }) => {
              refToInput[refPos] = inputPos;
            });
          }
          // Ensure refWord is defined in this scope
          const refWord = refWords[bestMatchIndex];
          // Debug log before using refWord
          console.log('[UI DEBUG] refWord in per-letter feedback block:', { refWord, bestMatchIndex, inputWord, letterPlaceholders });
          // Show all user input letters, even if there are more than reference
          for (let i = 0; i < letterPlaceholders.length; i++) {
            const letterSpan = letterPlaceholders[i];
            if (!letterSpan) continue;
            if (i < inputWord.length) {
              letterSpan.textContent = inputWord[i];
              letterSpan.classList.add('revealed');
              letterSpan.setAttribute('data-original-char', inputWord[i]);
              if (i < refWord.length && inputWord[i] === refWord[i]) {
                letterSpan.classList.add('correct');
              } else {
                letterSpan.classList.add('misspelled');
                console.log('[UI] Misspelled letter:', {
                  inputChar: inputWord[i],
                  refChar: refWord[i],
                  word: inputWord,
                  refWord: refWord
                });
              }
            } else {
              // Extra input letter (beyond reference length)
              letterSpan.textContent = inputWord[i];
              letterSpan.className = 'letter-placeholder revealed misspelled';
              letterSpan.setAttribute('data-original-char', inputWord[i]);
            }
          }
        }
      } else {
        console.warn('[UI] No match found for input word:', inputWord);
      }
    });
  } catch (error) {
    console.error('[UI] Error in updateReferenceMappingDisplay:', error);
  }
}

// Removed deprecated transformGermanInput function - use transformSpecialCharacters from textNormalizer.js instead

/**
 * Calculate similarity between two strings using a combination of bigrams and trigrams
 * @param {string} str1 - First string (should be transformed already)
 * @param {string} str2 - Second string (should be transformed already)
 * @returns {number} - Similarity score between 0 and 1
 */
