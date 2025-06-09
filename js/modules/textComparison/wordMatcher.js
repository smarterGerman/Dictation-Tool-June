/**
 * Word alignment module
 * Implements advanced word matching algorithm for better accuracy
 * Based on the proven algorithms from the old system
 */

import { calculateSimilarityScore } from './similarityScoring.js';
import { normalizeForComparison } from './textNormalizer.js';
import stateManager from '../utils/stateManager.js';
import { createAlignment as createAlignmentUtility } from './alignmentUtility.js';

/**
 * Finds the best matches between expected words and actual user input
 * Handles out-of-order typing, misspellings, missing words, and extra words
 * @param {string[]} expectedWords - Array of words from the reference text
 * @param {string[]} actualWords - Array of words from user input
 * @param {Object} [options] - Optional config (e.g., capitalizationSensitive)
 * @return {Object[]} - Array of match objects with alignment information
 */
export function findBestWordMatches(expectedWords, actualWords, options = {}) {
  // LOG: Entry
  // console.log('[findBestWordMatches] called', { expectedWords, actualWords, options });
  
  if (!expectedWords || !expectedWords.length) return [];
  if (!actualWords || !actualWords.length) {
    // Return all expected words as missing
    return expectedWords.map(word => ({
      expected: word,
      word: null,
      status: 'missing',
      similarity: 0
    }));
  }

  // Capitalization sensitivity from options or stateManager
  const capitalizationSensitive = options.capitalizationSensitive ?? stateManager.getState('comparison').capitalizationSensitive ?? false;

  // Normalize all words for comparison
  const normExpectedWords = expectedWords.map(w => normalizeForComparison(w));
  const normActualWords = actualWords.map(w => normalizeForComparison(w));

  normExpectedWords.forEach((w, i) => {
    if (w.length <= 2) {
      console.log('[MATCHER] Short expected word normalization:', { w, i });
    }
  });
  normActualWords.forEach((w, i) => {
    if (w.length <= 2) {
      console.log('[MATCHER] Short actual word normalization:', { w, i });
    }
  });

  // Track which words have been matched
  const matchedExpected = new Array(expectedWords.length).fill(false);
  const matchedActual = new Array(actualWords.length).fill(false);

  // Results array
  const results = new Array(expectedWords.length);

  // First pass: find exact and close matches
  for (let i = 0; i < normExpectedWords.length; i++) {
    for (let j = 0; j < normActualWords.length; j++) {
      if (matchedActual[j]) continue; // Skip already matched actual words

      // Use enhanced similarity scoring with all our new features
      const similarity = calculateSimilarityScore(normExpectedWords[i], normActualWords[j]);

      // Get a dynamic threshold based on word length and config
      const wordLength = normExpectedWords[i].length;
      let dynamicThreshold = 0.3; // Default threshold

      if (wordLength > 5) {
        // For longer words, be more lenient with the threshold
        // Apply a sliding scale: longer words get lower thresholds
        dynamicThreshold = Math.max(
          0.2,  // Never go below 0.2
          0.3 - ((wordLength - 5) * 0.01) // Reduce threshold by 0.01 per character above 5
        );
      }

      // If good match (using dynamic threshold)
      if (similarity >= dynamicThreshold) {
        matchedExpected[i] = true;
        matchedActual[j] = true;

        // Check for exact capitalization match when capitalization sensitivity is enabled
        const isExactCapitalizationMatch = capitalizationSensitive 
          ? expectedWords[i] === actualWords[j]
          : true;  // If not case-sensitive, don't check case

        // Debug log for capitalization checking
        // console.log('[DEBUG] Word matching capitalization check:', { 
        //   expected: expectedWords[i], 
        //   actual: actualWords[j], 
        //   capitalizationSensitive: capitalizationSensitive,
        //   isExactMatch: expectedWords[i] === actualWords[j],
        //   isExactCapitalizationMatch: isExactCapitalizationMatch
        // });

        // Determine status based on similarity AND capitalization when enabled
        let status;
        if (similarity >= 0.95) {
          if (capitalizationSensitive) {
            status = (expectedWords[i] === actualWords[j]) ? 'correct' : 'misspelled';
          } else {
            status = 'correct';
          }
        } else {
          status = 'misspelled';
        }
        
        // Add debug info
        // console.log(`[CRITICAL DEBUG] Word \\"${expectedWords[i]}\\" vs \\"${actualWords[j]}\\": similarity=${similarity}, capSensitive=${capitalizationSensitive}, status=${status}`);
        
        // Create alignment object using the utility
        const alignment = createAlignmentUtility(normActualWords[j], normExpectedWords[i], actualWords[j], expectedWords[i]);

        results[i] = {
          expected: expectedWords[i],
          expectedRaw: expectedWords[i], // Add raw expected word
          word: actualWords[j],
          actualRaw: actualWords[j], // Add raw actual word
          status: status,
          similarity: similarity,
          alignment: alignment // Add alignment object
        };
        // LOG: Matcher output for each word
        console.log('[MATCHER] Word match:', {
          expected: expectedWords[i],
          actual: actualWords[j],
          status,
          similarity,
          capitalizationSensitive
        });

        break;
      }
    }
    // No match found for this expected word
    if (!matchedExpected[i]) {
      results[i] = {
        expected: expectedWords[i],
        expectedRaw: expectedWords[i], // Add raw expected word for consistency
        word: null,
        actualRaw: null, // No actual word
        status: 'missing',
        similarity: 0,
        alignment: null // No alignment for missing words
      };
    }
  }

  // Collect any unmatched actual words as "extra"
  const extraWords = actualWords
    .filter((word, index) => !matchedActual[index])
    .map(word => ({
      expected: null,
      expectedRaw: null, // No expected word
      word: word,
      actualRaw: word, // Raw actual word
      status: 'extra',
      similarity: 0,
      alignment: null // No alignment for extra words
    }));

  return {
    words: results,
    extraWords: extraWords
  };
}

/**
 * Generate HTML with highlighting based on comparison results
 * @param {Object} comparisonResult - Result from processInput
 * @return {string} - HTML with appropriate highlighting
 */
export function generateHighlightedHTML(comparisonResult) {
  if (!comparisonResult || !comparisonResult.words) {
    return '';
  }
  
  let html = '';
  comparisonResult.words.forEach(word => {
    if (word.status === 'correct') {
      html += `<span class="word-correct">${word.expected}</span> `;
    } else if (word.status === 'misspelled') {
      // Enhanced tooltip showing what was typed and similarity score
      const similarityPercent = Math.round(word.similarity * 100);
      html += `<span class="word-misspelled" 
        title="You typed: ${word.word || ''} (${similarityPercent}% match)">${word.expected}</span> `;
    } else if (word.status === 'missing') {
      html += `<span class="word-missing">${word.expected}</span> `;
    }
  });
  
  // Add extra words if any
  if (comparisonResult.extraWords && comparisonResult.extraWords.length > 0) {
    html += '<div class="extra-words">Extra words: ';
    comparisonResult.extraWords.forEach(extra => {
      html += `<span class="word-extra">${extra.word}</span> `;
    });
    html += '</div>';
  }
  
  return html;
}
