/**
 * Module for comparing transcribed text with reference text
 * Legacy module that now imports from the new modular system
 */

// Import all functions from the new modular system
import {
    transformSpecialCharacters,
    notifySegmentChange,
    processInput,
    normalizeText,
    calculateSimilarityScore,
    levenshteinDistance,
    generateHighlightedHTML,
    getTimeSinceSegmentChange  // Add this import
} from './textComparison/index.js';

// Re-export the functions for backward compatibility
export {
    transformSpecialCharacters,
    notifySegmentChange,
    processInput,
    normalizeText,
    calculateSimilarityScore,
    levenshteinDistance,
    generateHighlightedHTML
};

/**
 * Transform letter+e notation to umlauts (ae → ä, oe → ö, ue → ü)
 * @param {string} text - Input text
 * @returns {string} - Transformed text
 */
function transformLetterE(text) {
    // Use a more reliable method with simple single replacements
    let result = text;
    result = result.replace(/ae/g, 'ä');
    result = result.replace(/oe/g, 'ö');
    result = result.replace(/ue/g, 'ü');
    result = result.replace(/Ae/g, 'Ä');
    result = result.replace(/Oe/g, 'Ö');
    result = result.replace(/Ue/g, 'Ü');
    return result;
}

/**
 * Transform colon notation to umlauts (a: → ä, o: → ö, u: → ü)
 * @param {string} text - Input text
 * @returns {string} - Transformed text
 */
function transformColon(text) {
    let result = text;
    result = result.replace(/a:/g, 'ä');
    result = result.replace(/o:/g, 'ö');
    result = result.replace(/u:/g, 'ü');
    result = result.replace(/A:/g, 'Ä');
    result = result.replace(/O:/g, 'Ö');
    result = result.replace(/U:/g, 'Ü');
    return result;
}

/**
 * Transform slash notation to umlauts (a/ → ä, o/ → ö, u/ → ü)
 * @param {string} text - Input text
 * @returns {string} - Transformed text
 */
function transformSlash(text) {
    let result = text;
    result = result.replace(/a\//g, 'ä');
    result = result.replace(/o\//g, 'ö');
    result = result.replace(/u\//g, 'ü');
    result = result.replace(/A\//g, 'Ä');
    result = result.replace(/O\//g, 'Ö');
    result = result.replace(/U\//g, 'Ü');
    return result;
}

/**
 * Transform eszett alternative writings to proper eszett (ß)
 * Only transforms specific patterns, NEVER regular 'ss'
 * @param {string} text - The input text
 * @returns {string} - Text with transformed eszett
 */
function transformEszett(text) {
    let result = text;
    
    // Pattern 1: Replace "s:" with "ß"
    result = result.replace(/s:/g, 'ß');
    result = result.replace(/S:/g, 'ß');
    
    // Pattern 2: Replace "s/" with "ß"
    result = result.replace(/s\//g, 'ß');
    result = result.replace(/S\//g, 'ß');
    
    // Pattern 3: Replace capital B in the middle/end of a word with "ß"
    result = result.replace(/([a-zäöü])B($|[a-zäöü])/g, '$1ß$2');
    
    // IMPORTANT: DO NOT transform normal 'ss' to 'ß'
    // Words like "Haussegen" must remain as "Haussegen"
    
    return result;
}

/**
 * Normalize text for comparison by removing punctuation and case
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
function normalizeTextForComparison(text) {
    // Convert to lowercase and remove all punctuation
    return text
        .toLowerCase()
        .replace(/[.,;:!?()[\]{}'"–—-]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')                // Normalize whitespace
        .trim();
}

/**
 * Compare user input with reference text
 * @param {string} userInput - The user's transcribed text
 * @param {string} referenceText - The correct reference text
 * @returns {Object} - Comparison results with match status
 */
export function compareTexts(userInput, referenceText) {
    if (!userInput || !referenceText) {
        return { 
            isMatch: false,
            transformedInput: '',
            errorPositions: [],
            errorCount: 0,
            correctWords: 0
        };
    }
    
    // Don't auto-advance if we recently changed segments
    const recentSegmentChange = (getTimeSinceSegmentChange() < 1500); // 1.5 second safety window
    
    // Transform special characters in user input
    const transformedInput = transformSpecialCharacters(userInput);

    // Normalize both texts for comparison:
    // 1. Apply transformations for special characters
    // 2. Convert to lowercase for case-insensitive comparison
    // 3. Remove punctuation for comparison only
    const normalizedUserInput = normalizeTextForComparison(transformedInput);
    const normalizedRefText = normalizeTextForComparison(referenceText);
    
    // Split into words
    const userWords = normalizedUserInput.split(/\s+/).filter(w => w.length > 0);
    const refWords = normalizedRefText.split(/\s+/).filter(w => w.length > 0);
    
    // Track errors and matches
    const errorPositions = [];
    let correctWords = 0;
    
    // Original user input for highlighting
    const origUserWords = transformedInput.split(/\s+/).filter(w => w.length > 0);
    let currentPos = 0;
    
    // Compare each word
    origUserWords.forEach((word, i) => {
        // Skip if index out of bounds or words don't match
        if (i >= userWords.length || i >= refWords.length || 
            userWords[i] !== refWords[i]) {
            
            // Mark as error
            const start = currentPos;
            const end = currentPos + word.length;
            errorPositions.push({ start, end });
        } else {
            correctWords++;
        }
        
        // Update position
        currentPos += word.length + 1; // +1 for the space
    });
    
    // Count additional errors for missing words
    const errorCount = Math.max(0, refWords.length - correctWords);
    
    // Check if all words match
    let isMatch = correctWords === refWords.length && userWords.length === refWords.length;
    
    // If we just changed segments, prevent auto-advancement
    if (isMatch && recentSegmentChange) {
        console.log('Skipping auto-advance: too soon since last segment change');
        isMatch = false; // Prevent auto-advancement
    }
    
    return {
        isMatch,
        transformedInput,
        errorPositions,
        errorCount,
        correctWords,
        totalWords: refWords.length
    };
}

/**
 * Align two texts for better error highlighting
 * @param {string} input - User input
 * @param {string} reference - Reference text
 * @returns {Array} - Array of characters with status (correct, error, missing)
 */
function alignTexts(input, reference) {
    // Simple character-by-character comparison for now
    // A more advanced implementation would use dynamic programming
    const inputChars = input.split('');
    const referenceChars = reference.split('');
    const result = [];
    
    // Compare existing characters
    for (let i = 0; i < inputChars.length; i++) {
        if (i < referenceChars.length) {
            if (inputChars[i] === referenceChars[i]) {
                result.push({ char: inputChars[i], status: 'correct' });
            } else {
                result.push({ char: inputChars[i], status: 'error' });
            }
        } else {
            // Extra character in input
            result.push({ char: inputChars[i], status: 'error' });
        }
    }
    
    // Add placeholders for missing characters
    for (let i = inputChars.length; i < referenceChars.length; i++) {
        result.push({ char: ' ', status: 'missing' });
    }
    
    return result;
}
