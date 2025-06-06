/**
 * Browser-compatible version of the keyboard proximity module
 * This is a simplified version for use in the test page
 */

// Define keyboard layouts
const KEYBOARD_LAYOUTS = {
  qwertz: {
    'z': ['t', 'u', 'h', 'g'],
    't': ['r', 'z', 'g', 'f'],
    'b': ['v', 'g', 'h', 'n'],
    'n': ['b', 'h', 'j', 'm'],
    // Add more keys as needed for testing
  },
  qwerty: {
    'y': ['t', 'u', 'h', 'g'],
    't': ['r', 'y', 'g', 'f'],
    'b': ['v', 'g', 'h', 'n'],
    'n': ['b', 'h', 'j', 'm'],
    // Add more keys as needed for testing
  },
  azerty: {
    'a': ['q', 'z', 'é', '&'],
    'z': ['a', 'e', 's', 'é'],
    'b': ['v', 'g', 'h', 'n'],
    'n': ['b', 'h', 'j', ','],
    // Add more keys as needed for testing
  }
};

// Expose a global keyboard module
window.keyboardModule = {
  /**
   * Check if two characters are adjacent on the specified keyboard layout
   */
  isKeyboardAdjacent(char1, char2, layout = 'qwertz') {
    // Convert to lowercase for case-insensitive matching
    const c1 = char1.toLowerCase();
    const c2 = char2.toLowerCase();
    
    // Check if char1 and char2 are the same
    if (c1 === c2) return false;
    
    // If we're checking all layouts (auto)
    if (layout === 'auto') {
      return (
        this.isKeyboardAdjacent(c1, c2, 'qwertz') ||
        this.isKeyboardAdjacent(c1, c2, 'qwerty') ||
        this.isKeyboardAdjacent(c1, c2, 'azerty')
      );
    }
    
    // Get the appropriate keyboard layout
    const layoutMap = KEYBOARD_LAYOUTS[layout] || KEYBOARD_LAYOUTS.qwertz;
    
    // Check if keys are adjacent
    return (layoutMap[c1] && layoutMap[c1].includes(c2)) || 
           (layoutMap[c2] && layoutMap[c2].includes(c1));
  }
};
