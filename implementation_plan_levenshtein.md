# Advanced Word Matching System Implementation Plan

This document outlines the implementation plan for integrating the sophisticated word matching system described in [dictation-matching-system.md](dictation-matching-system.md) into our existing dictation application.

## Phase 1: Core Algorithm Implementation

### 1.1 Module Structure Setup (2 days)

#### Create New Files
- `js/modules/textComparison/wordMatcher.js` - Core algorithm for word matching
- `js/modules/textComparison/similarityScoring.js` - Similarity calculation functions
- `js/modules/textComparison/textNormalizer.js` - Text normalization utilities
- `js/modules/textComparison/index.js` - Main export file

#### Implementation Details
```javascript
// js/modules/textComparison/index.js
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
```

### 1.2 Text Normalization Module (1 day)

#### Key Functions
- `normalizeText(text)`: General text normalization
- `normalizeWord(word)`: Word-level normalization
- Special handling for German characters (umlauts, ß)

#### Implementation Details
```javascript
// js/modules/textComparison/textNormalizer.js
/**
 * Normalizes a word for comparison
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
 * Normalizes text for processing
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
```

### 1.3 Similarity Scoring Module (2 days)

#### Key Functions
- `calculateSimilarityScore(expected, actual)`: Main scoring function
- `levenshteinDistance(str1, str2)`: Distance calculation algorithm

#### Configuration
- Add configurable threshold in `js/modules/config.js`
```javascript
// Add to existing config.js
export const textComparisonConfig = {
  minimumMatchThreshold: 0.3, // Minimum score to consider a match
  caseSensitive: false,       // Whether to consider case in matching
  strictPunctuation: false    // Whether punctuation affects matching
};
```

#### Implementation Details
```javascript
// js/modules/textComparison/similarityScoring.js
import { textComparisonConfig } from '../config.js';

/**
 * Calculates similarity between two words
 * @param {string} expected - Word from reference text
 * @param {string} actual - Word from user input
 * @return {number} - Score between 0 and 1
 */
export function calculateSimilarityScore(expected, actual) {
  // Implementation as in dictation-matching-system.md
  // ...
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @return {number} - Edit distance
 */
export function levenshteinDistance(str1, str2) {
  // Implementation as in dictation-matching-system.md
  // ...
}
```

### 1.4 Word Alignment Algorithm (3 days)

#### Key Functions
- `findBestWordMatches(expectedWords, actualWords)`: Main matching algorithm

#### Implementation Details
```javascript
// js/modules/textComparison/wordMatcher.js
import { calculateSimilarityScore } from './similarityScoring.js';
import { textComparisonConfig } from '../config.js';

/**
 * Finds the best matches between expected words and actual user input
 * @param {string[]} expectedWords - Array of words from the reference text
 * @param {string[]} actualWords - Array of words from user input
 * @return {Object[]} - Array of match objects with alignment information
 */
export function findBestWordMatches(expectedWords, actualWords) {
  // Implementation as in dictation-matching-system.md
  // ...
}
```

### 1.5 Input Processing Module (2 days)

#### Key Functions
- `processInput(referenceText, userInput)`: Main processing function

#### Implementation Details
```javascript
// js/modules/textComparison/inputProcessor.js
import { normalizeText } from './textNormalizer.js';
import { findBestWordMatches } from './wordMatcher.js';

/**
 * Processes user input and aligns it with reference text
 * @param {string} referenceText - The expected text
 * @param {string} userInput - The text entered by the user
 * @return {Object} - Alignment results with word status
 */
export function processInput(referenceText, userInput) {
  // Implementation as in dictation-matching-system.md
  // ...
}
```

### 1.6 Unit Tests (2 days)

#### Test Files
- `js/tests/textNormalizer.test.js`
- `js/tests/similarityScoring.test.js`
- `js/tests/wordMatcher.test.js`
- `js/tests/inputProcessor.test.js`

#### Test Examples
```javascript
// js/tests/wordMatcher.test.js
import { findBestWordMatches } from '../modules/textComparison/wordMatcher.js';

// Test cases using the examples from dictation-matching-system.md
const testCases = [
  {
    name: 'Out-of-order typing',
    expected: ['Es', 'gibt', 'viel', 'zu', 'tun'],
    actual: ['zu', 'gibt', 'Es', 'tun'],
    // Expected results...
  },
  // Additional test cases...
];

// Run tests and log results
```

## Phase 2: Integration with Existing UI

### 2.1 Integrate with Input Manager (2 days)

#### Key Tasks
- Update `js/modules/inputManager.js` to use new comparison system
- Replace existing text comparison calls with new system

#### Implementation Details
```javascript
// js/modules/inputManager.js
import { processInput } from './textComparison/index.js';

// Find the current input handling logic
// Replace with:
function handleUserInput(input, referenceText) {
  const comparisonResult = processInput(referenceText, input);
  updateInputDisplay(comparisonResult);
  return comparisonResult;
}
```

### 2.2 Update UI Feedback System (3 days)

#### New CSS Classes
Add to `css/text-comparison.css`:
```css
/* Add new styles */
.word-correct { color: green; }
.word-misspelled { color: orange; text-decoration: underline wavy red; }
.word-missing { color: red; text-decoration: line-through; }
.word-extra { color: purple; font-style: italic; }
```

#### Implementation Details
```javascript
// js/modules/uiManager.js (create if it doesn't exist)
import { processInput } from './textComparison/index.js';

/**
 * Updates the UI with comparison results
 * @param {Object} comparisonResult - Result from processInput
 * @param {HTMLElement} containerElement - Container for displaying results
 */
export function updateInputDisplay(comparisonResult, containerElement) {
  // Clear previous content
  containerElement.innerHTML = '';
  
  // Add expected words with appropriate styling
  comparisonResult.words.forEach(wordResult => {
    const wordElement = document.createElement('span');
    wordElement.textContent = wordResult.word || wordResult.expected;
    
    // Apply appropriate class based on status
    switch (wordResult.status) {
      case 'correct':
        wordElement.classList.add('word-correct');
        break;
      case 'misspelled':
        wordElement.classList.add('word-misspelled');
        wordElement.setAttribute('title', `Expected: ${wordResult.expected}`);
        break;
      case 'missing':
        wordElement.classList.add('word-missing');
        break;
    }
    
    containerElement.appendChild(wordElement);
    containerElement.appendChild(document.createTextNode(' '));
  });
  
  // Add extra words if any
  if (comparisonResult.extraWords.length > 0) {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('extra-words-container');
    
    const extraLabel = document.createElement('span');
    extraLabel.textContent = 'Extra words: ';
    extraContainer.appendChild(extraLabel);
    
    comparisonResult.extraWords.forEach(extraWord => {
      const wordElement = document.createElement('span');
      wordElement.textContent = extraWord.word;
      wordElement.classList.add('word-extra');
      extraContainer.appendChild(wordElement);
      extraContainer.appendChild(document.createTextNode(' '));
    });
    
    containerElement.appendChild(extraContainer);
  }
}
```

### 2.3 Update Results Screen (2 days)

#### Key Tasks
- Modify `js/modules/resultsScreen.js` to use the new comparison system
- Add detailed statistics based on word matching results

#### Implementation Details
```javascript
// js/modules/resultsScreen.js
import { processInput } from './textComparison/index.js';

/**
 * Calculate statistics from comparison results
 * @param {Array} segmentResults - Array of results for each segment
 * @return {Object} - Statistics object
 */
function calculateStats(segmentResults) {
  let totalWords = 0;
  let correctWords = 0;
  let misspelledWords = 0;
  let missingWords = 0;
  let extraWords = 0;
  
  segmentResults.forEach(result => {
    result.words.forEach(word => {
      totalWords++;
      if (word.status === 'correct') correctWords++;
      else if (word.status === 'misspelled') misspelledWords++;
      else if (word.status === 'missing') missingWords++;
    });
    extraWords += result.extraWords.length;
  });
  
  return {
    totalWords,
    correctWords,
    misspelledWords,
    missingWords,
    extraWords,
    accuracy: (correctWords / totalWords * 100).toFixed(1)
  };
}

/**
 * Renders the results screen with detailed statistics
 * @param {Array} segmentResults - Results for each segment
 * @param {HTMLElement} containerElement - Results container
 */
export function renderResults(segmentResults, containerElement) {
  const stats = calculateStats(segmentResults);
  
  // Create statistics summary
  const summaryElement = document.createElement('div');
  summaryElement.classList.add('results-summary');
  summaryElement.innerHTML = `
    <h2>Results Summary</h2>
    <div class="stat-item">Accuracy: <span class="stat-value">${stats.accuracy}%</span></div>
    <div class="stat-item">Correct Words: <span class="stat-value">${stats.correctWords}/${stats.totalWords}</span></div>
    <div class="stat-item">Misspelled Words: <span class="stat-value">${stats.misspelledWords}</span></div>
    <div class="stat-item">Missing Words: <span class="stat-value">${stats.missingWords}</span></div>
    <div class="stat-item">Extra Words: <span class="stat-value">${stats.extraWords}</span></div>
  `;
  
  containerElement.appendChild(summaryElement);
  
  // Add detailed segment results
  // ...
}
```

### 2.4 Performance Optimization (2 days)

#### Key Tasks
- Add debouncing for live comparison during typing
- Optimize for longer texts

#### Implementation Details
```javascript
// js/utils/performance.js
/**
 * Creates a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @return {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
```

Update input handler:
```javascript
// js/modules/inputManager.js
import { debounce } from '../utils/performance.js';
import { processInput } from './textComparison/index.js';

// Create debounced version of comparison function
const debouncedProcessInput = debounce((input, referenceText, callback) => {
  const result = processInput(referenceText, input);
  callback(result);
}, 300); // 300ms debounce

// Use in event listeners
inputElement.addEventListener('input', (e) => {
  debouncedProcessInput(e.target.value, referenceText, updateInputDisplay);
});
```

## Integration Timeline

### Week 1: Core Algorithm
- Days 1-2: Set up module structure and text normalization
- Days 3-4: Implement similarity scoring and word alignment
- Day 5: Implement input processing and begin unit tests

### Week 2: UI Integration
- Days 1-2: Complete unit tests and integrate with input manager
- Days 3-4: Update UI feedback system
- Day 5: Update results screen and finalize integration

### Week 3: Testing & Optimization
- Days 1-2: Add performance optimizations
- Days 3-4: Comprehensive testing with real scenarios
- Day 5: Bug fixes and polish

## Technical Considerations

1. **Backward Compatibility**
   - Ensure the new system works with existing VTT files
   - Maintain compatibility with current input storage system

2. **Performance**
   - Use debouncing for live feedback to prevent UI lag
   - Consider lazy initialization of complex components

3. **Accessibility**
   - Ensure error highlighting is accessible to screen readers
   - Add appropriate ARIA attributes to dynamic content

4. **Mobile Support**
   - Test touch interactions with the new feedback system
   - Ensure responsive layout works with highlighting

## Testing Strategy

1. **Unit Tests**
   - Test each core algorithm function independently
   - Use test cases from dictation-matching-system.md examples

2. **Integration Tests**
   - Verify integration with input manager
   - Test results screen with various input scenarios

3. **End-to-End Tests**
   - Test complete flow from audio playback to results
   - Verify iframe embedding still works correctly

4. **User Testing**
   - Have real users test with different typing styles
   - Collect feedback on the accuracy of word matching