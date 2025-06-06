# Enhanced German Word Matching

This document describes three key enhancements to the German dictation tool's word matching algorithm, designed to improve the experience for German language learners worldwide.

## New Features

### 1. Keyboard Proximity Analysis

The system analyzes input considering multiple keyboard layouts to accommodate learners using different keyboard configurations:

- **Multiple Layout Support**: 
  - **QWERTZ** (German Standard Layout)
  - **QWERTY** (US/International Layout)
  - **AZERTY** (French Layout)

- **Auto-Detection**: Automatically detects the most likely keyboard layout based on typo patterns
- **Adjacent Key Detection**: Recognizes when users hit neighboring keys (e.g., typing 'f' instead of 'g')
- **Reduced Penalty**: Typos involving adjacent keys receive a lower penalty (0.8 instead of 1.0), improving match quality

#### Layout-Specific Examples

```
QWERTZ LAYOUT:
"schreiben" mistyped as "schreinen" (n is adjacent to b)
"Universität" mistyped as "Universirät" (r is adjacent to t)

QWERTY LAYOUT:
"schreiben" mistyped as "schreiven" (v is adjacent to b)
"Universität" mistyped as "Universiräy" (y is adjacent to t)

AZERTY LAYOUT:
"schreiben" mistyped as "schrei en" (space is adjacent to b)
"quizzen" mistyped as "auizzen" (a is adjacent to q)
```

### 2. Length-Based Threshold Adjustments

The system now applies different similarity thresholds based on word length:

- **More Lenient for Longer Words**: Longer words receive lower thresholds since more characters mean more opportunities for typos
- **Dynamic Formula**: `threshold = baseThreshold - (wordLength * 0.01)`, with minimum and maximum caps
- **Configurable**: Adjustment factors can be modified in `config.js`

```javascript
// Example: 
// Short word (3-4 chars): Uses standard threshold (0.3)
// Medium word (5-10 chars): Gradually more lenient
// Long word (>10 chars): Can use threshold as low as 0.2
```

### 3. German-Specific Typo Pattern Detection

The system recognizes common German-specific typing patterns:

- **"sch" written as "sh"**: A common shorthand/typo with German words
- **Umlauts written as base vowels**: Recognition of 'a' for 'ä', 'o' for 'ö', etc.
- **"ß" written as "s" or "ss"**: Common substitutions for the sharp S
- **Double vowel omissions**: Missing one of double vowels (e.g., 'ee', 'aa')

```javascript
// Example: typing "Strasse" instead of "Straße"
// Will receive a similarity bonus of up to 0.15
```

## Implementation Details

The enhancements are implemented across the following files:

- `keyboardProximity.js`: Contains the QWERTZ keyboard map and proximity functions
- `similarityScoring.js`: Enhanced with proximity-aware Levenshtein distance and length-based thresholds
- `wordMatcher.js`: Updated to use dynamic thresholds based on word length
- `config.js`: Added new configuration options to enable/disable features

## Testing

A dedicated test page is available to showcase these features:

- **File**: `enhanced-matching-test.html`
- **Features**: Individual and combined tests for all three enhancements
- **Toggle Controls**: Enable/disable features to compare results

Additionally, unit tests are provided in:

- `tests/keyboardProximityTests.js`: Automated tests for all new features

## Configuration Options

New options in `config.js`:

```javascript
// Text Comparison configurations
export const textComparisonConfig = {
    // ...existing options...
    
    // Feature toggles
    useKeyboardProximity: true,    // Enable keyboard proximity for similarity
    useLengthBasedThresholds: true, // Enable length-based thresholds
    useGermanTypoPatterns: true,   // Enable German typo pattern detection
    
    // Keyboard proximity settings
    keyboardLayout: 'auto',        // Keyboard layout: 'qwertz', 'qwerty', 'azerty' or 'auto' 
    adjacentKeyCost: 0.8,          // Cost for adjacent key substitutions
    
    // Length-based threshold adjustments
    maxLengthAdjustment: 0.1,      // Maximum threshold reduction
    lengthAdjustmentFactor: 0.01   // Adjustment factor per character
};
```
