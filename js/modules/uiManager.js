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
  if (!result || !result.inputText) return;
  
  // Use the original input words - NOT the transformed ones
  const inputWords = result.inputText.trim().split(/\s+/);
  const refWords = referenceText.trim().split(/\s+/);
  
  // Track which reference words have already been matched
  const matchedRefIndices = new Set();
  
  // Process each input word in the order the user typed them
  inputWords.forEach((inputWord, inputWordIndex) => {
    if (!inputWord) return;
    
    // Find best matching reference word
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    let bestMatchIsPartial = false;
    
    // Check all reference words to find the best match
    refWords.forEach((refWord, refWordIndex) => {
      if (matchedRefIndices.has(refWordIndex)) return;
      
      // Try matching but preserve original input for display
      const transformedInput = transformGermanInput(inputWord.toLowerCase());
      const refLower = refWord.toLowerCase();
      
      // Calculate similarity between transformed input and reference
      const similarity = calculateSimilarityScore(transformedInput, refLower);
      if (similarity > 0.5 && similarity > bestMatchScore) {
        bestMatchIndex = refWordIndex;
        bestMatchScore = similarity;
        bestMatchIsPartial = true;
      }
    });
    
    // If we found a match, show the ORIGINAL user input with feedback
    if (bestMatchIndex !== -1 && bestMatchScore > 0.5) {
      const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
      
      if (bestMatchIndex < wordElements.length) {
        const wordElement = wordElements[bestMatchIndex];
        const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        const refWord = refWords[bestMatchIndex];
        
        // CRITICAL CHANGE: Show what the user actually typed, not what they should have typed
        for (let i = 0; i < letterPlaceholders.length; i++) {
          const letterSpan = letterPlaceholders[i];
          
          // Only reveal characters the user has typed
          if (i < inputWord.length) {
            // Show the actual character the user typed, NOT the reference character
            letterSpan.textContent = inputWord[i];
            letterSpan.classList.add('revealed');
            
            // Compare transformed character for correctness highlighting
            const transformedChar = transformGermanInput(inputWord[i].toLowerCase());
            const refChar = letterSpan.dataset.letter.toLowerCase();
            
            // Check if character matches after transformation
            if (transformedChar === refChar) {
              letterSpan.classList.add('correct');
            } else {
              letterSpan.classList.add('misspelled');
            }
          } else {
            // Leave characters beyond user input as placeholders
            letterSpan.classList.add('progress');
          }
        }
        
        // Only mark as "matched" if similarity is very high
        if (bestMatchScore > 0.85) {
          matchedRefIndices.add(bestMatchIndex);
        }
      }
    }
  });
}

/**
 * Apply German input transformations for words
 * @param {string} input - Raw input text
 * @returns {string} - Transformed text with German character replacements
 */
function transformGermanInput(input) {
  if (!input) return '';
  
  let transformed = input.toLowerCase();
  
  // Handle umlauts
  transformed = transformed.replace(/ae/g, 'ä')
                          .replace(/oe/g, 'ö')
                          .replace(/ue/g, 'ü')
                          .replace(/a:/g, 'ä')
                          .replace(/o:/g, 'ö')
                          .replace(/u:/g, 'ü')
                          .replace(/a\//g, 'ä')
                          .replace(/o\//g, 'ö')
                          .replace(/u\//g, 'ü');
  
  // Handle ß (sharp s)
  transformed = transformed.replace(/s:/g, 'ß')
                          .replace(/s\//g, 'ß')
                          .replace(/ss/g, 'ß');
                         
  // Handle capital B as ß in middle or end of word
  transformed = transformed.replace(/(\w)B(\w|$)/g, '$1ß$2');
  
  // NEW: Special case for "sh" -> "sch" transformation
  transformed = transformed.replace(/sh/g, 'sch');
  
  return transformed;
}

/**
 * Calculate similarity between two strings with German orthographic awareness
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateSimilarityScore(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1.0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  // Special case for German orthography: Check for common omission patterns
  // like "shöner" vs "schöner" (missing 'c')
  if (str1.startsWith('sh') && str2.startsWith('sch')) {
    return 0.85; // High score but not perfect - missing 'c'
  }
  if (str2.startsWith('sh') && str1.startsWith('sch')) {
    return 0.85; // High score but not perfect - missing 'c'
  }
  
  // Check prefix matching (weighted higher)
  let prefixLen = 0;
  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (str1[i] === str2[i]) {
      prefixLen++;
    } else {
      break;
    }
  }
  
  // If significant prefix match, give high score
  if (prefixLen >= Math.min(len1, len2) * 0.75) {
    return 0.7 + (0.3 * prefixLen / maxLen);
  }
  
  // Regular character matching
  let matches = 0;
  for (let i = 0; i < len1; i++) {
    if (i < len2 && str1[i] === str2[i]) {
      matches++;
    }
  }
  
  return matches / maxLen;
}
