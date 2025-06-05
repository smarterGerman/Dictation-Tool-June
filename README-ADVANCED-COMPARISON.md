# Advanced Word Matching System

This module provides sophisticated text comparison functionality for the dictation tool, focusing on handling German language features, out-of-order word typing, misspellings, missing words, and extra words.

## Key Features

- **Word-level comparison** rather than character-level
- **Out-of-order word matching** - Words are matched regardless of their position in the sentence
- **Sophisticated misspelling detection** using Levenshtein distance
- **Special handling for German characters** (umlauts, ß)
- **Visual feedback** for different types of errors (misspelled, missing, extra words)
- **Detailed statistics** on a user's performance

## Components

### 1. Text Normalizer
- `textNormalizer.js` - Functions for normalizing text input with special attention to German characters
  - `normalizeText(text)` - Normalizes a full text string
  - `normalizeWord(word)` - Normalizes a single word for comparison

### 2. Similarity Scoring
- `similarityScoring.js` - Functions for calculating similarity between words
  - `calculateSimilarityScore(expected, actual)` - Calculates a similarity score between 0-1
  - `levenshteinDistance(str1, str2)` - Calculates edit distance between strings

### 3. Word Matcher
- `wordMatcher.js` - Core algorithm for aligning words
  - `findBestWordMatches(expectedWords, actualWords)` - Finds optimal alignment between expected and actual words

### 4. Input Processor
- `inputProcessor.js` - Processes input and coordinates the comparison
  - `processInput(referenceText, userInput)` - Main function to process and compare texts

## Integration Points

The system integrates with the existing application in these key areas:

1. **Input Manager** - Live feedback during typing
2. **Results Screen** - Enhanced statistics and detailed error feedback
3. **UI Manager** - Word-level highlighting and visual feedback

## Configuration

Configuration options are available in `config.js` under `textComparisonConfig`:

```javascript
export const textComparisonConfig = {
    minimumMatchThreshold: 0.3, // Minimum score to consider a match
    caseSensitive: false,       // Whether to consider case in matching
    strictPunctuation: false,   // Whether punctuation affects matching
    language: 'de'              // Default language (German)
};
```

## Testing

You can test the system using:

1. The main application - Regular usage will now use the advanced system
2. `advanced-test.html` - A dedicated test page with various test cases
3. `test.html` - Unit tests for core functionality

## Future Enhancements

Potential future enhancements:
- Phonetic matching for words that sound similar
- Language-specific rule configurations
- Machine learning for personalized feedback
- Adaptive difficulty based on user performance
