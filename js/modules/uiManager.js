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
  
  if (!result || !result.inputText) return;
  
  // Track which reference words have already been matched
  const matchedRefIndices = new Set();
  
  // Get normalized versions for better matching
  const inputWords = result.inputText.trim().split(/\s+/);
  const refWords = referenceText.trim().split(/\s+/);
  
  // Process each input word in the order the user typed them
  inputWords.forEach((inputWord, inputWordIndex) => {
    if (!inputWord) return;
    
    // Find best matching reference word
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    
    // Check all reference words to find the best match
    refWords.forEach((refWord, refWordIndex) => {
      if (matchedRefIndices.has(refWordIndex)) return;
      
      // First try exact match after transformation
      // Use the existing transformation function from your system
      const transformedInput = transformGermanInput(inputWord.toLowerCase());
      const refLower = refWord.toLowerCase();
      
      // Exact match after transformation
      if (transformedInput === refLower) {
        bestMatchIndex = refWordIndex;
        bestMatchScore = 1.0;
        return;
      }
      
      // Try partial match with German character transformation
      const similarity = calculateSimilarityWithTransformation(inputWord, refWord);
      if (similarity > 0.65 && similarity > bestMatchScore) {
        bestMatchIndex = refWordIndex;
        bestMatchScore = similarity;
      }
    });
    
    // If we found a match, reveal the word with character-level feedback
    if (bestMatchIndex !== -1 && bestMatchScore > 0.5) {
      matchedRefIndices.add(bestMatchIndex);
      
      const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
      if (bestMatchIndex < wordElements.length) {
        const wordElement = wordElements[bestMatchIndex];
        const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        const refWord = refWords[bestMatchIndex];
        
        // Mark the word as matched with appropriate class
        wordElement.classList.add(bestMatchScore >= 0.95 ? 'word-correct' : 'word-partial');
        
        // Create a character-by-character comparison of input vs reference
        // using your German transformation rules
        const charComparison = compareWithGermanRules(inputWord, refWord);
        
        // Show all characters in this word with appropriate styling
        for (let i = 0; i < letterPlaceholders.length; i++) {
          const letterSpan = letterPlaceholders[i];
          letterSpan.textContent = letterSpan.dataset.letter;
          letterSpan.classList.add('revealed');
          
          // Apply styling based on the character comparison
          if (i < charComparison.length && charComparison[i] === true) {
            letterSpan.classList.add('correct');
          } else {
            letterSpan.classList.add('misspelled');
          }
        }
      }
    }
  });
}

/**
 * Compares input word with reference word using German transformation rules
 * @param {string} input - The input word
 * @param {string} reference - The reference word
 * @returns {Array} - Array of booleans indicating character match status
 */
function compareWithGermanRules(input, reference) {
  // Transform the input using your existing German transformation function
  const transformedInput = transformGermanInput(input.toLowerCase());
  const refLower = reference.toLowerCase();
  
  // Results array (true = match, false = mismatch)
  const results = [];
  
  // Compare character by character
  for (let i = 0; i < reference.length; i++) {
    if (i < transformedInput.length) {
      // Check for direct character match
      const inputChar = transformedInput[i];
      const refChar = refLower[i];
      
      // Use your existing character equivalence rules
      results.push(checkCharacterEquivalence(inputChar, refChar));
    } else {
      // Input word is shorter than reference word
      results.push(false);
    }
  }
  
  return results;
}

/**
 * Check if two characters are equivalent under German transformation rules
 * @param {string} inputChar - Input character
 * @param {string} refChar - Reference character
 * @returns {boolean} - True if characters are equivalent
 */
function checkCharacterEquivalence(inputChar, refChar) {
  // Direct match
  if (inputChar === refChar) return true;
  
  // Implement transformations based on your existing German rules
  // This is a simple version - use your actual transformation logic
  if ((refChar === 'ä' && inputChar === 'a') ||
      (refChar === 'ö' && inputChar === 'o') ||
      (refChar === 'ü' && inputChar === 'u') ||
      (refChar === 'ß' && inputChar === 's')) {
    return true;
  }
  
  return false;
}

/**
 * Calculate similarity between input and reference with German transformation
 * @param {string} input - Input word
 * @param {string} reference - Reference word
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarityWithTransformation(input, reference) {
  const transformedInput = transformGermanInput(input.toLowerCase());
  const refLower = reference.toLowerCase();
  
  // Calculate Levenshtein distance or other similarity measure
  // between transformedInput and refLower
  // For simplicity, here's a basic character-matching algorithm
  let matches = 0;
  const maxLength = Math.max(transformedInput.length, refLower.length);
  const minLength = Math.min(transformedInput.length, refLower.length);
  
  for (let i = 0; i < minLength; i++) {
    if (checkCharacterEquivalence(transformedInput[i], refLower[i])) {
      matches++;
    }
  }
  
  return matches / maxLength;
}

/**
 * Transform German input using your existing transformation rules
 * @param {string} input - Input string
 * @returns {string} - Transformed string with proper German characters
 */
function transformGermanInput(input) {
  // Replace with your actual transformation function
  // This is just a placeholder that should match your existing implementation
  let transformed = input;
  
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
  
  return transformed;
}
