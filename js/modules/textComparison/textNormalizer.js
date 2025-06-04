/**
 * Text Normalization Module
 * Handles normalizing text for more accurate comparison,
 * with special handling for German language characters.
 */

/**
 * Normalizes a word for comparison by removing punctuation,
 * converting to lowercase, and handling special characters
 * 
 * @param {string} word - Word to normalize
 * @return {string} - Normalized word
 */
export function normalizeWord(word) {
  return word.toLowerCase()
    .replace(/[.,?!;:()'"]/g, '')
    .replace(/oe/g, 'ö')
    .replace(/ae/g, 'ä')
    .replace(/ue/g, 'ü')
    .replace(/s\//g, 'ß')
    .trim();
}

/**
 * Normalizes text for processing by converting special character
 * combinations to their proper form
 * 
 * @param {string} text - Full text to normalize
 * @return {string} - Normalized text
 */
export function normalizeText(text) {
  return text
    .replace(/oe/g, 'ö')
    .replace(/o\//g, 'ö')
    .replace(/ae/g, 'ä')
    .replace(/ue/g, 'ü')
    .replace(/s\//g, 'ß');
}
