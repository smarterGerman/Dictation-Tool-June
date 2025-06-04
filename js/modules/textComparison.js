/**
 * Module for comparing transcribed text with reference text
 * Includes German special character transformations and real-time error highlighting
 */

/**
 * Transform input text to normalize German special characters
 * @param {string} input - The user input text
 * @returns {string} - Normalized text with transformed special characters
 */
export function transformSpecialCharacters(input) {
    if (!input) return '';
    
    // Transformations for German special characters
    const transformations = [
        { pattern: /([^a-zA-ZäöüÄÖÜß])oe([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1ö$2' },
        { pattern: /([^a-zA-ZäöüÄÖÜß])ae([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1ä$2' },
        { pattern: /([^a-zA-ZäöüÄÖÜß])ue([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1ü$2' },
        { pattern: /([^a-zA-ZäöüÄÖÜß])Oe([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1Ö$2' },
        { pattern: /([^a-zA-ZäöüÄÖÜß])Ae([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1Ä$2' },
        { pattern: /([^a-zA-ZäöüÄÖÜß])Ue([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1Ü$2' },
        { pattern: /([^a-zA-ZäöüÄÖÜß])ss([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: '$1ß$2' },
        
        // Special case for word beginning
        { pattern: /^oe([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'ö$1' },
        { pattern: /^ae([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'ä$1' },
        { pattern: /^ue([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'ü$1' },
        { pattern: /^Oe([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'Ö$1' },
        { pattern: /^Ae([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'Ä$1' },
        { pattern: /^Ue([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'Ü$1' },
        { pattern: /^ss([^a-zA-ZäöüÄÖÜß]|$)/g, replacement: 'ß$1' },
        
        // Handle standalone words (complete word replacements)
        { pattern: /\boe\b/g, replacement: 'ö' },
        { pattern: /\bae\b/g, replacement: 'ä' },
        { pattern: /\bue\b/g, replacement: 'ü' },
        { pattern: /\bOe\b/g, replacement: 'Ö' },
        { pattern: /\bAe\b/g, replacement: 'Ä' },
        { pattern: /\bUe\b/g, replacement: 'Ü' },
        { pattern: /\bss\b/g, replacement: 'ß' }
    ];
    
    let result = input;
    
    // Apply each transformation pattern
    transformations.forEach(({ pattern, replacement }) => {
        result = result.replace(pattern, replacement);
    });
    
    return result;
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
            errorPositions: []
        };
    }
    
    // Transform special characters in user input
    const transformedInput = transformSpecialCharacters(userInput);
    
    // Normalize both texts for comparison 
    // (trim whitespace but preserve case for better error highlighting)
    const normalizedInput = transformedInput.trim();
    const normalizedReference = referenceText.trim();
    
    // For exact match check, use case-insensitive comparison
    const isExactMatch = normalizedInput.toLowerCase() === normalizedReference.toLowerCase();
    
    // Calculate a similarity score (for partial matching if needed)
    const similarityScore = calculateSimilarity(
        normalizedInput.toLowerCase(), 
        normalizedReference.toLowerCase()
    );
    
    // Find error positions for highlighting (case-sensitive for better feedback)
    const errorPositions = [];
    
    if (!isExactMatch) {
        // Use Levenshtein distance to find a better alignment of the texts
        const alignment = alignTexts(normalizedInput, normalizedReference);
        
        // Mark positions with errors
        alignment.forEach((position, index) => {
            if (position.status === 'error' || position.status === 'missing') {
                errorPositions.push(index);
            }
        });
    }
    
    return {
        isMatch: isExactMatch,
        similarityScore,
        transformedInput: normalizedInput,
        errorPositions,
        referenceText: normalizedReference
    };
}

/**
 * Calculate text similarity using Levenshtein distance
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
function calculateSimilarity(a, b) {
    if (!a && !b) return 100;
    if (!a || !b) return 0;
    
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    
    return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(a, b) {
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i-1][j] + 1,      // deletion
                matrix[i][j-1] + 1,      // insertion
                matrix[i-1][j-1] + cost  // substitution
            );
        }
    }
    
    return matrix[b.length][a.length];
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

/**
 * Generate HTML with error highlighting for the user input
 * @param {string} input - The user's input text (or transformed input)
 * @param {Array} errorPositions - Array of error positions
 * @returns {string} - HTML string with highlighted errors
 */
export function generateHighlightedHTML(input, errorPositions) {
    if (!input) return '';
    
    // If no errors, all text is correct (green)
    if (!errorPositions || errorPositions.length === 0) {
        return `<span class="correct">${input}</span>`;
    }
    
    // Build output with character-by-character highlighting
    let output = '';
    const chars = input.split('');
    
    chars.forEach((char, index) => {
        if (errorPositions.includes(index)) {
            // Error character (red)
            output += `<span class="incorrect">${char}</span>`;
        } else {
            // Correct character (green)
            output += `<span class="correct">${char}</span>`;
        }
    });
    
    return output;
}
