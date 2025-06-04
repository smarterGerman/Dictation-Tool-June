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
    
    try {
        // Try-catch to handle any unexpected errors in the transformation process
        let result = input;
        
        // Apply transformations in a specific order for best results
        // 1. First transform letter+e patterns
        result = transformLetterE(result);
        
        // 2. Then transform colon patterns
        result = transformColon(result);
        
        // 3. Then transform slash patterns
        result = transformSlash(result);
        
        // 4. Finally transform eszett
        result = transformEszett(result);
        
        // Safer logging without stringification that might cause issues in some browsers
        if (result !== input && typeof console !== 'undefined') {
            try {
                console.log("Transformation applied:", input, "→", result);
            } catch (logError) {
                // Silently fail if logging causes issues
            }
        }
        
        return result;
    } catch (err) {
        // Fallback in case of any error - return original input
        console.error("Error in transformation:", err);
        return input;
    }
}

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
