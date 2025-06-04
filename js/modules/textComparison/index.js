/**
 * Text Comparison Module
 * Main export file for text comparison functionality
 */
import { findBestWordMatches } from './wordMatcher.js';
import { calculateSimilarityScore, levenshteinDistance } from './similarityScoring.js';
import { normalizeText, normalizeWord } from './textNormalizer.js';
import { processInput } from './inputProcessor.js';

export {
  findBestWordMatches,
  calculateSimilarityScore, 
  levenshteinDistance,
  normalizeText,
  normalizeWord,
  processInput
};
