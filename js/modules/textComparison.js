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
    
    console.log("Before transformation:", JSON.stringify(input));
    
    let result = input;
    
    // Apply transformations
    result = transformUmlauts(result);
    result = transformEszett(result);
    
    // Only log if something changed
    if (result !== input) {
        console.log("After transformation:", JSON.stringify(result));
        console.log("Transformations applied:", 
            input.split('').map((char, i) => 
                char !== result[i] ? `${char}${input[i+1] === 'e' ? 'e' : input[i+1] === ':' ? ':' : input[i+1] === '/' ? '/' : ''} → ${result[i]}` : null
            ).filter(Boolean).join(', ')
        );
    }
    
    return result;
}

/**
 * Transform umlaut alternative writings to proper umlauts
 * @param {string} text - The input text
 * @returns {string} - Text with transformed umlauts
 */
function transformUmlauts(text) {
    // Fix 1: Ensure colon notation works properly (a: → ä, o: → ö, u: → ü)
    text = text.replace(/a:/g, 'ä');
    text = text.replace(/o:/g, 'ö');
    text = text.replace(/u:/g, 'ü');
    text = text.replace(/A:/g, 'Ä');
    text = text.replace(/O:/g, 'Ö');
    text = text.replace(/U:/g, 'Ü');
    
    // Fix 2: Ensure letter+e notation works (ae → ä, oe → ö, ue → ü)
    text = text.replace(/ae/g, 'ä');
    text = text.replace(/oe/g, 'ö');
    text = text.replace(/ue/g, 'ü');
    text = text.replace(/Ae/g, 'Ä');
    text = text.replace(/Oe/g, 'Ö');
    text = text.replace(/Ue/g, 'Ü');
    
    // Fix 3: Ensure slash notation works (a/ → ä, o/ → ö, u/ → ü)
    text = text.replace(/a\//g, 'ä');
    text = text.replace(/o\//g, 'ö');
    text = text.replace(/u\//g, 'ü');
    text = text.replace(/A\//g, 'Ä');
    text = text.replace(/O\//g, 'Ö');
    text = text.replace(/U\//g, 'Ü');
    
    return text;
}

/**
 * Transform eszett alternative writings to proper eszett (ß)
 * @param {string} text - The input text
 * @returns {string} - Text with transformed eszett
 */
function transformEszett(text) {
    // Replace "ss" with "ß"
    return text.replace(/ss/g, 'ß');
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
