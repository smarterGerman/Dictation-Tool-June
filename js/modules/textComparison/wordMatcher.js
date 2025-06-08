/**
 * Word alignment module
 * Implements advanced word matching algorithm for better accuracy
 * Based on the proven algorithms from the old system
 */

import { calculateSimilarityScore } from './similarityScoring.js';
import { normalizeWord } from './textNormalizer.js';
import stateManager from '../utils/stateManager.js';

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
  console.log('[findBestWordMatches] called', { expectedWords, actualWords, options });
  
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
  const capitalizationSensitive = options.capitalizationSensitive ?? stateManager.get('capitalizationSensitive') ?? false;

  // Create normalized versions of words for comparison
  const normalizedExpected = expectedWords.map(w => normalizeWord(w));
  const normalizedActual = actualWords.map(w => normalizeWord(w));

  // Track which words have been matched
  const matchedExpected = new Array(expectedWords.length).fill(false);
  const matchedActual = new Array(actualWords.length).fill(false);

  // Results array
  const results = new Array(expectedWords.length);

  // First pass: find exact and close matches
  for (let i = 0; i < normalizedExpected.length; i++) {
    for (let j = 0; j < normalizedActual.length; j++) {
      if (matchedActual[j]) continue; // Skip already matched actual words

      // Use enhanced similarity scoring with all our new features
      const similarity = calculateSimilarityScore(normalizedExpected[i], normalizedActual[j]);

      // Get a dynamic threshold based on word length and config
      const wordLength = normalizedExpected[i].length;
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

        // Determine status based on similarity
        const status = similarity >= 0.95 ? 'correct' : 'misspelled';
        results[i] = {
          expected: expectedWords[i],
          word: actualWords[j],
          status: status,
          similarity: similarity
        };

        break;
      }
    }
    // No match found for this expected word
    if (!matchedExpected[i]) {
      results[i] = {
        expected: expectedWords[i],
        word: null,
        status: 'missing',
        similarity: 0
      };
    }
  }

  // Collect any unmatched actual words as "extra"
  const extraWords = actualWords
    .filter((word, index) => !matchedActual[index])
    .map(word => ({
      expected: null,
      word: word,
      status: 'extra',
      similarity: 0
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
