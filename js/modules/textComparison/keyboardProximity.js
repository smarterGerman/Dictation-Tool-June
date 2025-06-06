/**
 * Keyboard Proximity Analysis Module
 * Detects common typo patterns based on key proximity
 * on multiple keyboard layouts (QWERTZ, QWERTY, and AZERTY)
 */

/**
 * Defines the German QWERTZ keyboard layout adjacency map
 * Maps each key to its adjacent keys
 */
const QWERTZ_ADJACENCY_MAP = {
  // First row
  '1': ['2', 'q'],
  '2': ['1', '3', 'q', 'w'],
  '3': ['2', '4', 'w', 'e'],
  '4': ['3', '5', 'e', 'r'],
  '5': ['4', '6', 'r', 't'],
  '6': ['5', '7', 't', 'z'],
  '7': ['6', '8', 'z', 'u'],
  '8': ['7', '9', 'u', 'i'],
  '9': ['8', '0', 'i', 'o'],
  '0': ['9', 'ß', 'o', 'p'],
  'ß': ['0', '´', 'p', 'ü'],
  '´': ['ß', 'ü', '+'],
  
  // Second row
  'q': ['1', '2', 'w', 'a'],
  'w': ['2', '3', 'q', 'e', 'a', 's'],
  'e': ['3', '4', 'w', 'r', 's', 'd'],
  'r': ['4', '5', 'e', 't', 'd', 'f'],
  't': ['5', '6', 'r', 'z', 'f', 'g'],
  'z': ['6', '7', 't', 'u', 'g', 'h'],
  'u': ['7', '8', 'z', 'i', 'h', 'j'],
  'i': ['8', '9', 'u', 'o', 'j', 'k'],
  'o': ['9', '0', 'i', 'p', 'k', 'l'],
  'p': ['0', 'ß', 'o', 'ü', 'l', 'ö'],
  'ü': ['ß', 'p', 'ö', 'ä'],
  '+': ['´'],
  
  // Third row
  'a': ['q', 'w', 's', 'y'],
  's': ['w', 'e', 'a', 'd', 'y', 'x'],
  'd': ['e', 'r', 's', 'f', 'x', 'c'],
  'f': ['r', 't', 'd', 'g', 'c', 'v'],
  'g': ['t', 'z', 'f', 'h', 'v', 'b'],
  'h': ['z', 'u', 'g', 'j', 'b', 'n'],
  'j': ['u', 'i', 'h', 'k', 'n', 'm'],
  'k': ['i', 'o', 'j', 'l', 'm', ','],
  'l': ['o', 'p', 'k', 'ö', ',', '.'],
  'ö': ['p', 'ü', 'l', 'ä', '.', '-'],
  'ä': ['ü', 'ö', '-'],
  '#': ['+', 'ä'],
  
  // Fourth row
  'y': ['a', 's', 'x', '<'],
  'x': ['s', 'd', 'y', 'c', '<'],
  'c': ['d', 'f', 'x', 'v'],
  'v': ['f', 'g', 'c', 'b'],
  'b': ['g', 'h', 'v', 'n'],
  'n': ['h', 'j', 'b', 'm'],
  'm': ['j', 'k', 'n', ','],
  ',': ['k', 'l', 'm', '.'],
  '.': ['l', 'ö', ',', '-'],
  '-': ['ö', 'ä', '.']
};

/**
 * Defines the standard QWERTY keyboard layout adjacency map
 * Maps each key to its adjacent keys
 */
const QWERTY_ADJACENCY_MAP = {
  // First row
  '1': ['2', 'q'],
  '2': ['1', '3', 'q', 'w'],
  '3': ['2', '4', 'w', 'e'],
  '4': ['3', '5', 'e', 'r'],
  '5': ['4', '6', 'r', 't'],
  '6': ['5', '7', 't', 'y'],
  '7': ['6', '8', 'y', 'u'],
  '8': ['7', '9', 'u', 'i'],
  '9': ['8', '0', 'i', 'o'],
  '0': ['9', '-', 'o', 'p'],
  '-': ['0', '=', 'p', '['],
  '=': ['-', '[', ']'],
  
  // Second row
  'q': ['1', '2', 'w', 'a'],
  'w': ['2', '3', 'q', 'e', 'a', 's'],
  'e': ['3', '4', 'w', 'r', 's', 'd'],
  'r': ['4', '5', 'e', 't', 'd', 'f'],
  't': ['5', '6', 'r', 'y', 'f', 'g'],
  'y': ['6', '7', 't', 'u', 'g', 'h'],
  'u': ['7', '8', 'y', 'i', 'h', 'j'],
  'i': ['8', '9', 'u', 'o', 'j', 'k'],
  'o': ['9', '0', 'i', 'p', 'k', 'l'],
  'p': ['0', '-', 'o', '[', 'l', ';'],
  '[': ['-', '=', 'p', ']', ';', "'"],
  ']': ['=', '[', "'", '\\'],
  
  // Third row
  'a': ['q', 'w', 's', 'z'],
  's': ['w', 'e', 'a', 'd', 'z', 'x'],
  'd': ['e', 'r', 's', 'f', 'x', 'c'],
  'f': ['r', 't', 'd', 'g', 'c', 'v'],
  'g': ['t', 'y', 'f', 'h', 'v', 'b'],
  'h': ['y', 'u', 'g', 'j', 'b', 'n'],
  'j': ['u', 'i', 'h', 'k', 'n', 'm'],
  'k': ['i', 'o', 'j', 'l', 'm', ','],
  'l': ['o', 'p', 'k', ';', ',', '.'],
  ';': ['p', '[', 'l', "'", '.', '/'],
  "'": ['[', ']', ';', '\\', '/', '.'],
  '\\': [']', "'", '/'],
  
  // Fourth row
  'z': ['a', 's', 'x'],
  'x': ['s', 'd', 'z', 'c'],
  'c': ['d', 'f', 'x', 'v'],
  'v': ['f', 'g', 'c', 'b'],
  'b': ['g', 'h', 'v', 'n'],
  'n': ['h', 'j', 'b', 'm'],
  'm': ['j', 'k', 'n', ','],
  ',': ['k', 'l', 'm', '.'],
  '.': ['l', ';', ',', '/'],
  '/': [';', "'", '.', '\\']
};

/**
 * Defines the French AZERTY keyboard layout adjacency map
 * Maps each key to its adjacent keys
 */
const AZERTY_ADJACENCY_MAP = {
  // First row
  '&': ['é', 'a'],
  'é': ['&', '"', 'a', 'z'],
  '"': ['é', "'", 'z', 'e'],
  "'": ['"', '(', 'e', 'r'],
  '(': ["'", '-', 'r', 't'],
  '-': ['(', 'è', 't', 'y'],
  'è': ['-', '_', 'y', 'u'],
  '_': ['è', 'ç', 'u', 'i'],
  'ç': ['_', 'à', 'i', 'o'],
  'à': ['ç', ')', 'o', 'p'],
  ')': ['à', '=', 'p'],

  // Second row
  'a': ['&', 'é', 'z', 'q'],
  'z': ['é', '"', 'a', 'e', 'q', 's'],
  'e': ['"', "'", 'z', 'r', 's', 'd'],
  'r': ["'", '(', 'e', 't', 'd', 'f'],
  't': ['(', '-', 'r', 'y', 'f', 'g'],
  'y': ['-', 'è', 't', 'u', 'g', 'h'],
  'u': ['è', '_', 'y', 'i', 'h', 'j'],
  'i': ['_', 'ç', 'u', 'o', 'j', 'k'],
  'o': ['ç', 'à', 'i', 'p', 'k', 'l'],
  'p': ['à', ')', 'o', 'l', 'm'],

  // Third row
  'q': ['a', 'z', 's', 'w'],
  's': ['z', 'e', 'q', 'd', 'w', 'x'],
  'd': ['e', 'r', 's', 'f', 'x', 'c'],
  'f': ['r', 't', 'd', 'g', 'c', 'v'],
  'g': ['t', 'y', 'f', 'h', 'v', 'b'],
  'h': ['y', 'u', 'g', 'j', 'b', 'n'],
  'j': ['u', 'i', 'h', 'k', 'n', ','],
  'k': ['i', 'o', 'j', 'l', ',', ';'],
  'l': ['o', 'p', 'k', 'm', ';', ':'],
  'm': ['p', 'l', ':', '!'],

  // Fourth row
  'w': ['q', 's', 'x'],
  'x': ['s', 'd', 'w', 'c'],
  'c': ['d', 'f', 'x', 'v'],
  'v': ['f', 'g', 'c', 'b'],
  'b': ['g', 'h', 'v', 'n'],
  'n': ['h', 'j', 'b', ','],
  ',': ['j', 'k', 'n', ';'],
  ';': ['k', 'l', ',', ':'],
  ':': ['l', 'm', ';', '!'],
  '!': ['m', ':']
};

/**
 * Get the active keyboard layout adjacency map based on configuration
 * 
 * @param {string} layout - The keyboard layout name ('qwertz', 'qwerty', 'azerty')
 * @returns {Object} - The corresponding adjacency map
 */
export function getKeyboardLayout(layout = 'auto') {
  // Default to QWERTZ if not specified (German dictation tool)
  if (layout === 'qwerty') {
    return QWERTY_ADJACENCY_MAP;
  } else if (layout === 'azerty') {
    return AZERTY_ADJACENCY_MAP;
  } else {
    // Default to QWERTZ for German dictation tool
    return QWERTZ_ADJACENCY_MAP;
  }
}

/**
 * Check if two characters are adjacent on the specified keyboard layout
 * 
 * @param {string} char1 - First character
 * @param {string} char2 - Second character
 * @param {string} layout - Keyboard layout to use ('qwertz', 'qwerty', 'azerty', 'auto')
 * @returns {boolean} - True if the keys are adjacent
 */
export function isKeyboardAdjacent(char1, char2, layout = 'auto') {
  // Convert to lowercase for case-insensitive matching
  const c1 = char1.toLowerCase();
  const c2 = char2.toLowerCase();
  
  // Check if char1 and char2 are the same
  if (c1 === c2) return false;
  
  // Get the appropriate keyboard layout map
  const layoutMap = getKeyboardLayout(layout);
  
  // Check both QWERTZ and QWERTY as fallbacks if auto is selected
  if (layout === 'auto') {
    // Try all layouts and return true if any layout shows the keys as adjacent
    return (
      // Check in QWERTZ
      (QWERTZ_ADJACENCY_MAP[c1] && QWERTZ_ADJACENCY_MAP[c1].includes(c2)) ||
      (QWERTZ_ADJACENCY_MAP[c2] && QWERTZ_ADJACENCY_MAP[c2].includes(c1)) ||
      // Check in QWERTY
      (QWERTY_ADJACENCY_MAP[c1] && QWERTY_ADJACENCY_MAP[c1].includes(c2)) ||
      (QWERTY_ADJACENCY_MAP[c2] && QWERTY_ADJACENCY_MAP[c2].includes(c1)) ||
      // Check in AZERTY
      (AZERTY_ADJACENCY_MAP[c1] && AZERTY_ADJACENCY_MAP[c1].includes(c2)) ||
      (AZERTY_ADJACENCY_MAP[c2] && AZERTY_ADJACENCY_MAP[c2].includes(c1))
    );
  }
  
  // Otherwise, use the specified layout
  // Check if char2 is adjacent to char1
  if (layoutMap[c1] && layoutMap[c1].includes(c2)) {
    return true;
  }
  
  // Check if char1 is adjacent to char2
  if (layoutMap[c2] && layoutMap[c2].includes(c1)) {
    return true;
  }
  
  return false;
}

/**
 * Calculate a keyboard proximity cost for Levenshtein calculation
 * Returns a lower cost for substitutions involving adjacent keys
 * 
 * @param {string} char1 - First character
 * @param {string} char2 - Second character
 * @param {string} layout - Keyboard layout to use
 * @returns {number} - Cost: 0.8 for adjacent keys, 1 for non-adjacent keys
 */
export function keyboardProximityCost(char1, char2, layout = 'auto') {
  return isKeyboardAdjacent(char1, char2, layout) ? 0.8 : 1.0;
}

/**
 * German-specific common typo detection
 * Recognizes common typo patterns in German
 * 
 * @param {string} input - Input word
 * @param {string} reference - Reference word
 * @returns {number} - Additional similarity bonus (0-0.2) if pattern detected
 */
export function detectGermanTypoPatterns(input, reference) {
  // Convert to lowercase for case-insensitive matching
  const inputLower = input.toLowerCase();
  const refLower = reference.toLowerCase();
  
  let similarityBonus = 0;
  
  // Pattern 1: 'sch' written as 'sh'
  if (inputLower.includes('sh') && refLower.includes('sch')) {
    similarityBonus = Math.max(similarityBonus, 0.15);
  }
  
  // Pattern 2: Umlauts written as base vowel (a instead of ä, etc.)
  const umlautMap = {
    'ä': 'a', 'ö': 'o', 'ü': 'u',
  };
  
  for (const [umlaut, base] of Object.entries(umlautMap)) {
    if (refLower.includes(umlaut) && inputLower.includes(base)) {
      const umlautIndex = refLower.indexOf(umlaut);
      const baseIndex = inputLower.indexOf(base);
      
      // Check if they appear at similar positions
      if (Math.abs(umlautIndex - baseIndex) <= 2) {
        similarityBonus = Math.max(similarityBonus, 0.15);
      }
    }
  }
  
  // Pattern 3: Single 's' instead of 'ß'
  if (refLower.includes('ß') && (inputLower.includes('s') && !inputLower.includes('ß'))) {
    similarityBonus = Math.max(similarityBonus, 0.1);
  }
  
  // Pattern 4: Double vowels commonly mistaken as single vowels
  const commonDoubles = ['ee', 'aa', 'oo'];
  for (const doubleVowel of commonDoubles) {
    if (refLower.includes(doubleVowel) && !inputLower.includes(doubleVowel)) {
      similarityBonus = Math.max(similarityBonus, 0.1);
    }
  }
  
  return similarityBonus;
}
