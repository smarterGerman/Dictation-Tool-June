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
      if (similarity > 0.5 && similarity > bestMatchScore) {
        bestMatchIndex = refWordIndex;
        bestMatchScore = similarity;
      }
    });
    
    // If we found a match, show the ORIGINAL user input with feedback
    if (bestMatchIndex !== -1 && bestMatchScore > 0.5) {
      const wordElements = placeholderContainer.querySelectorAll('.word-placeholder');
      if (bestMatchIndex < wordElements.length) {
        const wordElement = wordElements[bestMatchIndex];
        const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
        const refWord = refWords[bestMatchIndex].toLowerCase();
        
        // Transform the entire input word once
        const transformedInputWord = transformSpecialCharacters(inputWord.toLowerCase());
        
        console.log('[DEBUG] Word comparison:', inputWord, '→', transformedInputWord, 'vs', refWord);
        
        // IMPLEMENT FIX 3: Compare with Reference Word Starting Positions
        // This is the key improvement over the previous implementation
        
        // 1. Find the best alignment between transformedInputWord and refWord
        const alignmentResult = findBestAlignment(transformedInputWord, refWord);
        
        // Create a mapping from original input to transformed positions
        const originalToTransformedMap = createTransformationMap(inputWord, transformedInputWord);
        
        // Debug log the mapping
        console.log('[DEBUG] Original to transformed map:', originalToTransformedMap);
        console.log('[DEBUG] Alignment result:', alignmentResult);
        
        // Log special cases
        if (alignmentResult['sh_special_case']) {
          console.log('[DEBUG] Handling special case for "sh" vs "sch" pattern');
        }
        
        // Update display based on the alignment
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

/**
 * Creates a mapping from original input characters to their positions in the transformed text
 * Handles multi-character transformations like "oe" → "ö"
 * @param {string} originalInput - The original user input
 * @param {string} transformedInput - The text after transformation
 * @returns {Object} - Mapping from original positions to transformed positions
 */
function createTransformationMap(originalInput, transformedInput) {
  if (!originalInput || !transformedInput) {
    return {};
  }
  
  console.log('[DEBUG] Creating transformation map from', originalInput, 'to', transformedInput);
  
  const positionMap = {};
  let transformedPos = 0;
  
  for (let i = 0; i < originalInput.length; i++) {
    // Handle special cases for German umlauts (2-char sequences)
    if (i < originalInput.length - 1) {
      const twoChars = originalInput.substring(i, i+2).toLowerCase();
      
      // Check if this is a multi-character transformation
      if ((twoChars === 'oe' && transformedPos < transformedInput.length && transformedInput[transformedPos] === 'ö') || 
          (twoChars === 'ae' && transformedPos < transformedInput.length && transformedInput[transformedPos] === 'ä') || 
          (twoChars === 'ue' && transformedPos < transformedInput.length && transformedInput[transformedPos] === 'ü') ||
          (twoChars === 'o:' && transformedPos < transformedInput.length && transformedInput[transformedPos] === 'ö') ||
          (twoChars === 'a:' && transformedPos < transformedInput.length && transformedInput[transformedPos] === 'ä') ||
          (twoChars === 'u:' && transformedPos < transformedInput.length && transformedInput[transformedPos] === 'ü')) {
        
        console.log('[DEBUG] Mapping umlaut at pos', i, ':', twoChars, '→', transformedInput[transformedPos]);
        
        // Mark this as an umlaut transformation in the map
        positionMap[i] = transformedPos;
        positionMap[i+1] = transformedPos;
        
        // Add a special marker to help with UI display
        positionMap['umlaut_' + i] = true;
        
        // Skip next character as we've already mapped it
        i++;
        transformedPos++;
        continue;
      }
      
      // Handle "sh" specially for German - simple 1:1 mapping
      // We'll handle "sh" vs "sch" in the alignment function instead
      if (twoChars === 'sh' && transformedPos + 1 < transformedInput.length && 
          transformedInput[transformedPos] === 's' && 
          transformedInput[transformedPos + 1] === 'h') {
        
        console.log('[DEBUG] Simple mapping for "sh":', twoChars, '→', transformedInput.substring(transformedPos, transformedPos+2));
        
        // Regular mapping
        positionMap[i] = transformedPos;     // 's' → 's'
        positionMap[i+1] = transformedPos+1; // 'h' → 'h'
        
        // Mark this as a special 'sh' case to ensure the 'h' is visible
        positionMap['sh_' + i] = true;
        
        i++;  // Skip next character
        transformedPos += 2;  // Skip "sh" in transformed text
        continue;
      }
    }
    
    // Regular 1:1 mapping
    if (transformedPos < transformedInput.length) {
      positionMap[i] = transformedPos;
      transformedPos++;
    }
  }
  
  console.log('[DEBUG] Position map:', positionMap);
  return positionMap;
}

/**
 * Finds the best alignment between the transformed input word and reference word
 * This is the core of Fix 3 - aligning characters properly between input and reference
 * @param {string} transformedInput - The word after transformation
 * @param {string} referenceWord - The reference word to compare against
 * @returns {Object} - Information about the alignment
 */
function findBestAlignment(transformedInput, referenceWord) {
  if (!transformedInput || !referenceWord) {
    return { 
      transformedToRefMap: {}, 
      refToTransformedMap: {},
      refPositionsMatched: new Set()
    };
  }
  
  console.log('[DEBUG] Finding alignment between:', transformedInput, 'and', referenceWord);
  
  // Create result object
  const alignment = {
    transformedToRefMap: {},
    refToTransformedMap: {},
    refPositionsMatched: new Set()
  };
  
  // 1. Handle special case for "shöner" vs "schöner" (missing 'c')
  if (transformedInput.startsWith('sh') && referenceWord.startsWith('sch')) {
    console.log('[DEBUG] Special case: shöner vs schöner detected');
    
    // Map 's' to 's'
    alignment.transformedToRefMap[0] = 0;
    alignment.refToTransformedMap[0] = 0;
    alignment.refPositionsMatched.add(0);
    
    // Skip the 'c' in reference (position 1) - it's missing in the input
    // But mark it as a special 'sh' case for UI handling
    alignment['sh_special_case'] = true;
    
    // Map 'h' to 'h' in reference (position 2)
    alignment.transformedToRefMap[1] = 2;
    alignment.refToTransformedMap[2] = 1;
    alignment.refPositionsMatched.add(2);
    
    // Map the rest of the characters (after 'h')
    for (let i = 2, j = 3; i < transformedInput.length && j < referenceWord.length; i++, j++) {
      alignment.transformedToRefMap[i] = j;
      alignment.refToTransformedMap[j] = i;
      alignment.refPositionsMatched.add(j);
    }
    
    return alignment;
  }
  
  // 2. Special case for exact matches but with different length
  if (transformedInput === referenceWord) {
    console.log('[DEBUG] Exact match case');
    
    // One-to-one mapping for all characters
    for (let i = 0; i < transformedInput.length; i++) {
      alignment.transformedToRefMap[i] = i;
      alignment.refToTransformedMap[i] = i;
      alignment.refPositionsMatched.add(i);
    }
    
    return alignment;
  }
  
  // 3. Use dynamic programming to find the longest common subsequence
  // and build a character alignment based on that
  const lcs = computeLongestCommonSubsequence(transformedInput, referenceWord);
  console.log('[DEBUG] LCS result:', lcs);
  
  // Map the matching characters based on LCS
  let tIndex = 0;
  let rIndex = 0;
  
  for (const matchChar of lcs) {
    // Find the next occurrence of matchChar in both strings
    while (tIndex < transformedInput.length && transformedInput[tIndex] !== matchChar) {
      tIndex++;
    }
    
    while (rIndex < referenceWord.length && referenceWord[rIndex] !== matchChar) {
      rIndex++;
    }
    
    // Map these positions
    if (tIndex < transformedInput.length && rIndex < referenceWord.length) {
      alignment.transformedToRefMap[tIndex] = rIndex;
      alignment.refToTransformedMap[rIndex] = tIndex;
      alignment.refPositionsMatched.add(rIndex);
      
      // Move to next position
      tIndex++;
      rIndex++;
    }
  }
  
  return alignment;
}

/**
 * Compute the Longest Common Subsequence (LCS) of two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {string} - The longest common subsequence
 */
function computeLongestCommonSubsequence(str1, str2) {
  if (!str1 || !str2) return '';
  
  const m = str1.length;
  const n = str2.length;
  
  // Create DP table
  const dp = Array(m+1).fill().map(() => Array(n+1).fill(''));
  
  // Fill the dp table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + str1[i-1];
      } else {
        dp[i][j] = dp[i][j-1].length > dp[i-1][j].length ? dp[i][j-1] : dp[i-1][j];
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Finds the appropriate position to insert a placeholder for a missing character
 * @param {number} missingCharPos - Position of the missing character in reference word
 * @param {string} refWord - The reference word
 * @param {Set} matchedPositions - Set of reference positions already matched
 * @returns {number} - Position to insert the placeholder
 */
// Function removed - umlaut handling is now done directly in the main display function

/**
 * Special function to handle the UI display of 'sh' vs 'sch' pattern
 * This ensures the 'h' character is displayed correctly while preserving underscore for missing 'c'
 * @param {HTMLElement} wordElement - The word container element
 * @param {string} inputWord - Original input word (e.g., "shoener")
 * @param {string} transformedWord - Transformed input (e.g., "shöner")
 * @param {string} referenceWord - The correct reference word (e.g., "schöner")
 */
function handleShPattern(wordElement, inputWord, transformedWord, referenceWord) {
  if (!wordElement || !inputWord || !transformedWord || !referenceWord) return;
  
  // Check if this is an 'sh' vs 'sch' pattern
  if (transformedWord.startsWith('sh') && referenceWord.startsWith('sch')) {
    console.log('[DEBUG] Applying special UI handling for "sh" vs "sch" pattern');
    
    const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
    
    // Make sure 's' and 'h' are correctly marked
    if (letterPlaceholders.length >= 2) {
      // First letter is 's'
      const sLetter = letterPlaceholders[0];
      sLetter.classList.add('correct');
      sLetter.style.color = '#2ecc71'; // Ensure green color
      sLetter.textContent = 's'; // Make sure 's' is visible
      
      // Find or create a placeholder for the missing 'c'
      let cPlaceholder = null;
      let hPosition = 1; // Default position for 'h'
      
      // Create a placeholder for 'c' if it doesn't exist
      cPlaceholder = document.createElement('span');
      cPlaceholder.className = 'letter-placeholder missing-between';
      cPlaceholder.textContent = '_';
      cPlaceholder.style.color = '#e74c3c'; // Red color
      cPlaceholder.style.margin = '0 5px'; // Better spacing
      
      // Check if we need to insert the missing character placeholder
      if (letterPlaceholders.length > 1) {
        // Get the current second letter (should be 'h')
        const secondChar = letterPlaceholders[1];
        
        // Insert the missing 'c' placeholder before the 'h'
        sLetter.parentNode.insertBefore(cPlaceholder, secondChar);
        hPosition = 2; // 'h' is now at position 2
        
        // Make sure 'h' is visible and green
        if (letterPlaceholders[hPosition-1]) { // Adjust for 0-based indexing
          const hLetter = letterPlaceholders[hPosition-1];
          hLetter.textContent = 'h'; // Force 'h' to be visible
          hLetter.classList.add('correct');
          hLetter.style.color = '#2ecc71'; // Ensure green color
          hLetter.classList.remove('missing-char', 'missing-between'); // Remove any missing-char class
          console.log('[DEBUG] Made h character visible in sh pattern');
        }
      } else {
        // If there's only one letter, append the placeholder after 's'
        sLetter.parentNode.appendChild(cPlaceholder);
      }
      
      console.log('[DEBUG] Finished applying special "sh" pattern handling');
    }
  }
}

function findInsertPositionForMissingChar(missingCharPos, refWord, matchedPositions) {
  console.log('[DEBUG] Finding insert position for missing char at pos', missingCharPos, 'in word:', refWord);
  
  // Special case for "schöner" vs "shöner" - if the missing char is 'c' at position 1
  if (missingCharPos === 1 && refWord[missingCharPos] === 'c' && 
      refWord.startsWith('sch') && refWord.length > 3) {
    console.log('[DEBUG] Special case: missing character in "sch" pattern');
    // Always insert between 's' and 'h' for consistency
    return 1; 
  }
  
  // Find the closest matched position before this missing character
  let prevPos = -1;
  for (let i = missingCharPos - 1; i >= 0; i--) {
    if (matchedPositions.has(i)) {
      prevPos = i;
      break;
    }
  }
  
  // Find the closest matched position after this missing character
  let nextPos = -1;
  for (let i = missingCharPos + 1; i < refWord.length; i++) {
    if (matchedPositions.has(i)) {
      nextPos = i;
      break;
    }
  }
  
  console.log('[DEBUG] Prev matched pos:', prevPos, 'Next matched pos:', nextPos);
  
  // Decide where to insert based on surrounding matches
  if (prevPos >= 0) {
    // Insert after the previous matched position
    return prevPos + 1;
  } else if (nextPos >= 0) {
    // Insert before the next matched position
    return nextPos;
  } else if (missingCharPos === 0) {
    // Missing char is at the beginning
    return 0;
  } else {
    // Default to inserting at the approximate position
    return Math.min(missingCharPos, refWord.length - 1);
  }
}

// End of helper functions
