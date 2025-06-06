/**
 * Text Normalization Module
 * Handles normalizing text for more accurate comparison,
 * with special handling for German language characters.
 */

// Add protection against auto-advancement too soon after segment change
let lastSegmentAdvanceTime = 0;

/**
 * Notify the text normalization system about a segment change
 * Called when segments are advanced to prevent unwanted auto-advancement
 */
export function notifySegmentChange() {
    lastSegmentAdvanceTime = Date.now();
}

/**
 * Get the time since the last segment change in milliseconds
 * Used to prevent auto-advancement too soon after changing segments
 * 
 * @returns {number} - Milliseconds since last segment change
 */
export function getTimeSinceSegmentChange() {
    return Date.now() - lastSegmentAdvanceTime;
}

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
        let needsTransformation = false;
        
        // Check if this word needs special character transformation
        needsTransformation = /[aouAOU][e:\/]|s[s:\/]|B[a-zäöüß]|[a-zäöüß]B|sh/.test(input);
        
        if (!needsTransformation) {
            // Skip unnecessary processing and logging for words that don't need transformation
            return input;
        }
        
        // Apply transformations in a specific order for best results
        // 1. First transform letter+e patterns
        result = transformLetterE(result);
        console.log('After transformLetterE:', result);
        
        // 2. Then transform colon patterns
        result = transformColon(result);
        console.log('After transformColon:', result);
        
        // 3. Then transform slash patterns
        result = transformSlash(result);
        console.log('After transformSlash:', result);
        
        // 4. Finally transform eszett
        result = transformEszett(result);
        console.log('After transformEszett:', result);
        
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
    if (!text) return text;
    
    console.log('ℹ️ transformLetterE input:', text);
    
    // Log intermediate transformations:
    let result = text;
    
    result = result.replace(/ae/g, 'ä');
    console.log('After ae→ä:', result);
    
    result = result.replace(/oe/g, 'ö');
    console.log('After oe→ö:', result); 
    
    result = result.replace(/ue/g, 'ü');
    console.log('After ue→ü:', result);
    
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
    
    // Pattern 4: Replace "straBe" with "straße" (and other common words with ß)
    result = result.replace(/straBe/g, 'straße');
    result = result.replace(/StraBe/g, 'Straße');
    result = result.replace(/STRABE/g, 'STRAßE');
    
    // You can add more common German words with ß here as needed
    result = result.replace(/groBe/g, 'große');
    result = result.replace(/GroBe/g, 'Große');
    result = result.replace(/weiBe/g, 'weiße');
    result = result.replace(/WeiBe/g, 'Weiße');
    
    return result;
}

/**
 * Normalizes a word for comparison by removing punctuation,
 * converting to lowercase, and handling special characters
 * 
 * @param {string} word - Word to normalize
 * @return {string} - Normalized word
 */
export function normalizeWord(word) {
  if (!word) return '';
  
  // First transform special characters
  const transformed = transformSpecialCharacters(word);
  
  // Then normalize for comparison
  return transformed.toLowerCase()
    .replace(/[.,;:!?()[\]{}'"–—-]/g, '')
    .trim();
}

/**
 * Normalizes text for processing by converting special character
 * combinations to their proper form and removing punctuation
 * 
 * @param {string} text - Full text to normalize
 * @return {string} - Normalized text
 */
export function normalizeText(text) {
  if (!text) return '';
  
  // First transform special characters
  const transformed = transformSpecialCharacters(text);
  
  // Then normalize for comparison
  return transformed
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}'"–—-]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .trim();
}
