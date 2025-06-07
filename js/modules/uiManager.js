/**
 * UI Manager Module
 * Handles UI rendering and updates for text comparison results
 * Implements the reference-text-only display approach
 */
import { processInput, generateHighlightedHTML, transformSpecialCharacters } from './textComparison/index.js';

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
    
    // Check all reference words to find the best match
    refWords.forEach((refWord, refWordIndex) => {
      if (matchedRefIndices.has(refWordIndex)) return;
      
      // Try matching but preserve original input for display
      const transformedInput = transformSpecialCharacters(inputWord.toLowerCase());
      const refLower = refWord.toLowerCase();
      
      // DEBUG LOGGING
      console.log('[DEBUG] Matching inputWord:', inputWord, 'transformedInput:', transformedInput, 'refWord:', refWord);
      
      // Calculate similarity between transformed input and reference
      const similarity = calculateSimilarityScore(transformedInput, refLower);
      if (similarity > 0.37 && similarity > bestMatchScore) {
        bestMatchIndex = refWordIndex;
        bestMatchScore = similarity;
      }
    });
    
    // If we found a match, show the ORIGINAL user input with feedback
    if (bestMatchIndex !== -1 && bestMatchScore > 0.5) {
      const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
      if (bestMatchIndex < wordElements.length) {
        const wordElement = wordElements[bestMatchIndex];
        let letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        const refWord = refWords[bestMatchIndex].toLowerCase();
        // Only declare transformedInputWord once
        let transformedInputWord = transformSpecialCharacters(inputWord.toLowerCase());

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
        
        // Transform the entire input word once
        transformedInputWord = transformSpecialCharacters(inputWord.toLowerCase());
        
        console.log('[DEBUG] Word comparison:', inputWord, '→', transformedInputWord, 'vs', refWord);
        
        // Special case: input and reference only differ by trailing punctuation
        const inputNoPunct = inputWord.replace(/[.,;:!?()[\]{}'"–—-]/g, '');
        const refNoPunct = refWord.replace(/[.,;:!?()[\]{}'"–—-]/g, '');
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
        
        // Special case: if input and reference only differ by punctuation, mark all letters as correct and return early
        const isCompleteMatch = cleanInput === cleanRef;
        
        for (let i = 0; i < inputWord.length; i++) {
          const refPos = substringStart + i;
          if (refPos < letterPlaceholders.length) {
            const letterSpan = letterPlaceholders[refPos];
            letterSpan.textContent = inputWord[i];
            letterSpan.classList.add('revealed');
            letterSpan.setAttribute('data-original-char', inputWord[i]);
            
            // Mark as correct if it's part of a complete match or characters match case-insensitively
            if (isCompleteMatch || inputWord[i].toLowerCase() === refWord[refPos].toLowerCase()) {
              letterSpan.classList.add('correct');
            } else {
              letterSpan.classList.add('misspelled');
            }
          }
        }
        
        // If it's a complete match ignoring punctuation, mark the whole word as correct
        if (isCompleteMatch) {
          wordElement.classList.add('word-correct');
          matchedRefIndices.add(bestMatchIndex);
        }
      } else {
        for (let i = 0; i < inputWord.length; i++) {
          // Get the corresponding letter placeholder (if available)
          if (i < letterPlaceholders.length) {
            const letterSpan = letterPlaceholders[i];
            // Show the original character the user typed
            letterSpan.textContent = inputWord[i];
            letterSpan.classList.add('revealed');
            
            // Add data attribute for debugging
            letterSpan.setAttribute('data-original-char', inputWord[i]);
            
            // Find which transformed character this maps to
            const transformedPos = originalToTransformedMap[i];
            
            // Check if this is part of an umlaut transformation (like 'oe' → 'ö')
            const isUmlaut = originalToTransformedMap['umlaut_' + (i-1)] || originalToTransformedMap['umlaut_' + i];
            
            if (transformedPos !== undefined) {
              // Find where this transformed character aligns in the reference word
              const refPos = alignmentResult.transformedToRefMap[transformedPos];
              
              if (refPos !== undefined && refPos < refWord.length) {
                // Get the actual characters for comparison
                const transformedChar = transformedInputWord[transformedPos];
                const refChar = refWord[refPos];
                
                console.log('[DEBUG] Aligned comparison:', 
                          'original:', inputWord[i],
                          'transformed:', transformedChar, 
                          'reference:', refChar,
                          'positions:', i, transformedPos, refPos,
                          'isUmlaut:', isUmlaut);
                
                // Special handling for umlaut characters (both 'o' and 'e' in 'oe')
                if (isUmlaut) {
                  console.log('[DEBUG] Found umlaut character at position', i, 'in word:', inputWord);
                  
                  letterSpan.setAttribute('data-umlaut', 'true');
                  
                  // Add special CSS class based on which part of the umlaut this is
                  if (i > 0 && originalToTransformedMap['umlaut_' + (i-1)]) {
                    // This is the 'e' in 'oe'
                    letterSpan.classList.add('umlaut-part', 'umlaut-second-part');
                    // Make sure display:none is applied correctly
                    letterSpan.style.display = 'none';
                    letterSpan.style.width = '0';
                    letterSpan.style.opacity = '0';
                    letterSpan.textContent = '';
                    console.log('[DEBUG] This is the second part of an umlaut:', inputWord[i]);
                    
                    // For the second part, make parent's correctness apply to this element
                    if (letterPlaceholders[i-1] && letterPlaceholders[i-1].classList.contains('correct')) {
                      letterSpan.classList.add('correct');
                    }
                    
                  } else {
                    // This is the 'o' in 'oe'
                    letterSpan.classList.add('umlaut-part', 'umlaut-first-part');
                    console.log('[DEBUG] This is the first part of an umlaut:', inputWord[i]);
                    
                    // Convert the two characters to show the umlaut
                    if (i+1 < inputWord.length) {
                      // Find which umlaut this is
                      const twoChars = inputWord.substring(i, i+2).toLowerCase();
                      if (twoChars === 'oe') {
                        letterSpan.textContent = 'ö';
                        letterSpan.setAttribute('data-original-char', 'ö');
                      }
                      else if (twoChars === 'ae') {
                        letterSpan.textContent = 'ä';
                        letterSpan.setAttribute('data-original-char', 'ä');
                      }
                      else if (twoChars === 'ue') {
                        letterSpan.textContent = 'ü';
                        letterSpan.setAttribute('data-original-char', 'ü');
                      }
                    }
                  }
                }
                
                // Hide the second character of the umlaut pair (the 'e' in 'oe')
                if (i > 0 && originalToTransformedMap['umlaut_' + (i-1)]) {
                  // Make this element completely invisible and take no space
                  letterSpan.style.display = 'none'; 
                  letterSpan.innerHTML = ''; 
                  letterSpan.style.width = '0';
                  letterSpan.style.margin = '0';
                  letterSpan.style.padding = '0';
                  letterSpan.style.position = 'absolute';
                  letterSpan.style.visibility = 'hidden';
                  letterSpan.classList.add('hidden', 'umlaut-second-part'); 
                }
                
                // Apply appropriate class based on character match
                if (transformedChar === refChar) {
                  letterSpan.classList.add('correct');
                } else {
                  letterSpan.classList.add('misspelled');
                }
              } else {
                // This character has no alignment in the reference word
                letterSpan.classList.add('misspelled');
              }
            } else {
              // Could not map this character
              letterSpan.classList.add('misspelled');
            }
          }
        }
        
        // Handle unmatched reference characters (like 'c' in 's[c]höner')
        // But don't reveal what they are - just indicate something is missing
        for (let i = 0; i < refWord.length; i++) {
          if (!alignmentResult.refPositionsMatched.has(i)) {
            // NEW: Skip missing character indicators outside substring region for substring matches
            if (alignmentResult.isSubstringMatch) {
              const substringStart = alignmentResult.substringPosition;
              const substringEnd = substringStart + transformedInputWord.length;
              
              // If this missing character is outside the substring region, don't show an indicator
              if (i < substringStart || i >= substringEnd) {
                continue;
              }
            }
            
            // Find appropriate position to insert the missing character indicator
            const insertPosition = findInsertPositionForMissingChar(
              i, refWord, alignmentResult.refPositionsMatched
            );
            
            console.log('[DEBUG] Missing char at ref pos', i, 
                      'insert indicator at position', insertPosition);
            
            if (insertPosition >= 0 && insertPosition < letterPlaceholders.length) {
              const letterSpan = letterPlaceholders[insertPosition];
              
              // Special handling for "sh" vs "sch" case
              if (refWord[i] === 'c' && i === 1 && refWord.startsWith('sch') && 
                  transformedInputWord.startsWith('sh')) {
                console.log('[DEBUG] Special handling for missing character in "sch"');
                
                // Add a class to indicate a missing letter but don't reveal what it is
                letterSpan.classList.add('missing-between');
                // Keep the underscore to indicate something's missing
                letterSpan.textContent = '_';
                
                // Make sure it's red to indicate it's missing
                letterSpan.style.color = '#e74c3c';
                
                // Ensure surrounding characters ('s' and 'h') are marked as correct
                if (insertPosition > 0 && insertPosition + 1 < letterPlaceholders.length) {
                  console.log('[DEBUG] Ensuring surrounding characters are properly marked');
                  
                  // Mark 's' as correct (it's before the missing 'c')
                  const prevLetterSpan = letterPlaceholders[insertPosition - 1];
                  if (prevLetterSpan) {
                    prevLetterSpan.classList.add('correct');
                  }
                  
                  // Mark 'h' as correct and visible (it's after the missing 'c')
                  const nextLetterSpan = letterPlaceholders[insertPosition + 1];
                  if (nextLetterSpan) {
                    nextLetterSpan.classList.add('correct');
                    if (nextLetterSpan.classList.contains('missing-char')) {
                      nextLetterSpan.classList.remove('missing-char');
                    }
                  }
                }
              } else {
                // Standard missing character handling - indicate missing but don't reveal
                letterSpan.classList.add('missing-char');
                letterSpan.textContent = '_';
                // Ensure the color is red
                letterSpan.style.color = '#e74c3c';
              }
            }
          }
        }
        
        // Apply special handling for the "sh" vs "sch" pattern if detected
        if (transformedInputWord.startsWith('sh') && refWord.startsWith('sch')) {
          handleShPattern(wordElement, inputWord, transformedInputWord, refWord);
        }
        
        // Mark the whole word if it's a good match
        if (bestMatchScore > 0.85) {
          wordElement.classList.add('word-' + 
            (bestMatchScore > 0.95 ? 'correct' : 'misspelled'));
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
// Deprecated: use transformSpecialCharacters from textNormalizer.js instead
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
 * Calculate similarity between two strings using a combination of bigrams and trigrams
 * @param {string} str1 - First string (should be transformed already)
 * @param {string} str2 - Second string (should be transformed already)
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateSimilarityScore(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1.0;

  // Ensure strings are normalized before comparison
  str1 = transformSpecialCharacters(str1.toLowerCase());
  str2 = transformSpecialCharacters(str2.toLowerCase());

  // Create character n-grams (both bigrams and trigrams)
  const getBigrams = str => {
    const bigrams = {};
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams[bg] = (bigrams[bg] || 0) + 1;
    }
    return bigrams;
  };

  const getTrigrams = str => {
    const trigrams = {};
    for (let i = 0; i < str.length - 2; i++) {
      const tg = str.substring(i, i + 3);
      trigrams[tg] = (trigrams[tg] || 0) + 1;
    }
    return trigrams;
  };

  // Calculate bigram similarity
  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);

  let sharedBigrams = 0;
  let totalBigrams = 0;

  for (const bg in bigrams1) {
    if (bigrams2[bg]) sharedBigrams += Math.min(bigrams1[bg], bigrams2[bg]);
    totalBigrams += bigrams1[bg];
  }
  for (const bg in bigrams2) {
    totalBigrams += bigrams2[bg];
  }

  // Calculate trigram similarity
  const trigrams1 = getTrigrams(str1);
  const trigrams2 = getTrigrams(str2);

  let sharedTrigrams = 0;
  let totalTrigrams = 0;

  for (const tg in trigrams1) {
    if (trigrams2[tg]) sharedTrigrams += Math.min(trigrams1[tg], trigrams2[tg]);
    totalTrigrams += trigrams1[tg];
  }
  for (const tg in trigrams2) {
    totalTrigrams += trigrams2[tg];
  }

  // Dice coefficients
  const bigramDice = sharedBigrams > 0 ? (2 * sharedBigrams) / totalBigrams : 0;
  const trigramDice = sharedTrigrams > 0 ? (2 * sharedTrigrams) / totalTrigrams : 0;

  // Combined score: give more weight to trigrams
  return (trigramDice * 0.7 + bigramDice * 0.3);
}

/**
 * Find the best alignment between two strings with detailed information
 * @param {string} input - The input string (user's text)
 * @param {string} reference - The reference string (correct text)
 * @returns {Object} - Alignment result with detailed information
 */
function findBestAlignment(input, reference) {
  // --- INITIALIZE DP TABLE ---
  const dp = [];
  for (let i = 0; i <= input.length; i++) {
    dp[i] = [];
    for (let j = 0; j <= reference.length; j++) {
      dp[i][j] = {
        score: 0,
        direction: '', // 'left', 'up', or 'diag'
        transformedPos: -1 // Track transformed position for each char
      };
    }
  }
  
  // --- FILL DP TABLE ---
  for (let i = 1; i <= input.length; i++) {
    for (let j = 1; j <= reference.length; j++) {
      const match = input[i-1] === reference[j-1];
      const diagScore = dp[i-1][j-1].score + (match ? 1 : -1);
      const upScore = dp[i][j-1].score - 1;
      const leftScore = dp[i-1][j].score - 1;
      
      // Find the best score and direction
      let bestScore = diagScore;
      let bestDirection = 'diag';
      
      if (upScore > bestScore) {
        bestScore = upScore;
        bestDirection = 'up';
      }
      if (leftScore > bestScore) {
        bestScore = leftScore;
        bestDirection = 'left';
      }
      
      dp[i][j].score = bestScore;
      dp[i][j].direction = bestDirection;
    }
  }
  
  // --- TRACEBACK ---
  const alignment = {
    inputToRefMap: new Map(), // Maps input positions to reference positions
    refToTransformedMap: new Map(), // Maps reference positions to transformed input positions
    transformedToRefMap: new Map(), // Maps transformed input positions to reference positions
    refPositionsMatched: new Set(), // Set of matched reference positions
    isSubstringMatch: false, // Flag for substring match
    substringPosition: -1 // Position of the substring match start
  };
  
  let i = input.length;
  let j = reference.length;
  
  while (i > 0 && j > 0) {
    const current = dp[i][j];
    
    if (current.direction === 'diag') {
      // Exact match or substitution
      alignment.inputToRefMap.set(i-1, j-1);
      alignment.refToTransformedMap.set(j-1, i-1);
      alignment.transformedToRefMap.set(i-1, j-1);
      alignment.refPositionsMatched.add(j-1);
      
      i--;
      j--;
    } else if (current.direction === 'up') {
      // Insertion in reference (gap in input)
      alignment.refToTransformedMap.set(j-1, -1);
      alignment.transformedToRefMap.set(-1, j-1);
      alignment.refPositionsMatched.add(j-1);
      
      j--;
    } else if (current.direction === 'left') {
      // Deletion in reference (gap in reference)
      alignment.inputToRefMap.set(i-1, -1);
      alignment.transformedToRefMap.set(i-1, -1);
      
      i--;
    }
  }
  
  // Handle remaining gaps
  while (i > 0) {
    alignment.inputToRefMap.set(i-1, -1);
    alignment.transformedToRefMap.set(i-1, -1);
    i--;
  }
  while (j > 0) {
    alignment.refToTransformedMap.set(j-1, -1);
    alignment.transformedToRefMap.set(-1, j-1);
    j--;
  }
  
  // --- DETECT SUBSTRING MATCHES ---
  // If the input is a complete substring of the reference (or vice versa), mark as substring match
  if (alignment.refPositionsMatched.size > 0 && alignment.refPositionsMatched.size < reference.length) {
    const firstMatched = Math.min(...Array.from(alignment.refPositionsMatched));
    const lastMatched = Math.max(...Array.from(alignment.refPositionsMatched));
    
    if (lastMatched - firstMatched + 1 === alignment.refPositionsMatched.size) {
      alignment.isSubstringMatch = true;
      alignment.substringPosition = firstMatched;
    }
  }
  
  return alignment;
}

/**
 * Create a mapping from original input positions to transformed positions
 * @param {string} originalInput - The original input string
 * @param {string} transformedInput - The transformed input string
 * @returns {Object} - Mapping object with original positions as keys and transformed positions as values
 */
function createTransformationMap(originalInput, transformedInput) {
  const map = {};
  
  // --- SIMPLE CASE: Exact match ---
  if (originalInput === transformedInput) {
    for (let i = 0; i < originalInput.length; i++) {
      map[i] = i;
    }
    return map;
  }
  
  // --- COMPLEX CASE: Transformations applied ---
  let origIndex = 0;
  let transIndex = 0;
  
  while (origIndex < originalInput.length && transIndex < transformedInput.length) {
    const origChar = originalInput[origIndex];
    const transChar = transformedInput[transIndex];
    
    // Direct match
    if (origChar === transChar) {
      map[origIndex] = transIndex;
      origIndex++;
      transIndex++;
    }
    // Umlaut transformations (ö, ü, ä)
    else if (transChar === 'ö' && origChar === 'oe') {
      map[origIndex] = transIndex;
      map[origIndex+1] = transIndex;
      origIndex += 2;
      transIndex++;
    }
    else if (transChar === 'ü' && origChar === 'ue') {
      map[origIndex] = transIndex;
      map[origIndex+1] = transIndex;
      origIndex += 2;
      transIndex++;
    }
    else if (transChar === 'ä' && origChar === 'ae') {
      map[origIndex] = transIndex;
      map[origIndex+1] = transIndex;
      origIndex += 2;
      transIndex++;
    }
    // Skip over untransformed characters in the original (deletions)
    else {
      map[origIndex] = -1;
      origIndex++;
    }
  }
  
  // Handle remaining characters in transformed input (insertions)
  while (transIndex < transformedInput.length) {
    map[origIndex] = transIndex;
    origIndex++;
    transIndex++;
  }
  
  return map;
}

/**
 * Find the position to insert a missing character indicator
 * @param {number} refPos - The reference position of the missing character
 * @param {string} refWord - The reference word
 * @param {Set} matchedPositions - Set of already matched positions
 * @returns {number} - The position to insert the indicator
 */
function findInsertPositionForMissingChar(refPos, refWord, matchedPositions) {
  // If the missing character is at the beginning or end, insert at the same position
  if (refPos === 0 || refPos === refWord.length) {
    return refPos;
  }
  
  // Check if there's a match immediately before or after the missing character
  if (matchedPositions.has(refPos - 1)) {
    return refPos;
  }
  if (matchedPositions.has(refPos)) {
    return refPos;
  }
  
  // Heuristic: insert before the first unmatched character
  for (let i = refPos; i < refWord.length; i++) {
    if (!matchedPositions.has(i)) {
      return i;
    }
  }
  
  return -1; // Default to -1 if no suitable position found
}

/**
 * Handle special case for "sh" vs "sch" pattern
 * @param {HTMLElement} wordElement - The word element to update
 * @param {string} inputWord - The original input word
 * @param {string} transformedInputWord - The transformed input word
 * @param {string} refWord - The reference word
 */
function handleShPattern(wordElement, inputWord, transformedInputWord, refWord) {
  // For "sh" vs "sch" cases, reveal the "sh" as correct and hide the "c"
  const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
  
  // Show "s" and "h" as correct
  if (letterPlaceholders.length > 0) {
    letterPlaceholders[0].classList.add('correct');
  }
  if (letterPlaceholders.length > 1) {
    letterPlaceholders[1].classList.add('correct');
  }
}
