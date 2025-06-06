# Table of Contents
- [Readme](#readme)
- [Features](#features)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [WebVTT Format](#webvtt-format)
- [Embedding in Teachable](#embedding-in-teachable)
- [Next Steps](#next-steps)
- [Readme Merge](#readme-merge)
- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Project Status](#project-status)
- [Project Architecture](#project-architecture)
- [Implementation Status](#implementation-status)
- [Technical Details](#technical-details)
- [Test Cases](#test-cases)
- [Usage and Integration](#usage-and-integration)
- [Readme Merge Old W New](#readme-merge-old-w-new)
- [Key Principles](#key-principles)
- [Implementation Plan](#implementation-plan)
- [Test Cases from Old System](#test-cases-from-old-system)
- [Benefits of This Approach](#benefits-of-this-approach)
- [Readme Help](#readme-help)
- [1. Core Architecture](#1.-core-architecture)
- [Word Matching System](#word-matching-system)
- [Usage Tips](#usage-tips)
- [Readme Enhanced Matching](#readme-enhanced-matching)
- [New Features](#new-features)
- [Implementation Details](#implementation-details)
- [Testing](#testing)
- [Configuration Options](#configuration-options)
- [Readme Debug Logging](#readme-debug-logging)
- [Enhanced Logging Implementation](#enhanced-logging-implementation)
- [Using the Debug Logs](#using-the-debug-logs)
- [Readme Advanced Comparison](#readme-advanced-comparison)
- [Key Features](#key-features)
- [Components](#components)
- [Integration Points](#integration-points)
- [Configuration](#configuration)
- [Future Enhancements](#future-enhancements)
- [Transformation Fix Readme](#transformation-fix-readme)
- [German Special Character Transformation Fix](#german-special-character-transformation-fix)
- [Implementation Progress](#implementation-progress)
- [Completed Tasks](#completed-tasks)
- [Final Steps](#final-steps)
- [Enhancement Summary](#enhancement-summary)
- [Multi-Keyboard Layout Support for Language Learners](#multi-keyboard-layout-support-for-language-learners)

# Project Documentation (Optimized)


## Readme

# Dictation Tool

A web-based dictation application that plays audio files and allows users to transcribe what they hear. This tool is designed to be embedded in Teachable courses via an iframe.

## Features

### Phase 1: MVP Player (Completed)
- Audio player with standard playback controls (play, pause)
- Progress bar with time display
- Responsive design that works within iframe constraints
- Modular architecture for scalability

### Phase 2.1: VTT Integration & Audio Segmentation (Completed)
- VTT file parsing for segmenting audio
- Sentence-by-sentence playback based on timestamps
- Segment navigation controls (previous, next, replay)

### Phase 2.2: Input Field Integration (Current)
- Text input field that appears after each audio segment
- Automatic focus management when audio pauses
- Storage of user inputs for each segment
- Submit functionality with keyboard support

### Core Features

- **Audio Playback and Segmentation**
  - ✅ Sentence-by-sentence audio playback using WebVTT cues
  - ✅ Navigation controls (previous, next, replay sentence)
  - ✅ Adjustable playback speed

- **Text Input and Comparison**
  - ✅ Advanced word matching regardless of input order
  - ✅ German character handling (umlauts, ß) with multiple input methods
  - ✅ Live feedback with highlighted differences
  - ✅ Click-to-reveal corrections for mistakes

- **User Interface**
  - ✅ Dark mode design optimized for readability
  - ✅ Mobile-responsive layout
  - ✅ Keyboard shortcuts for efficient navigation
  - ✅ Case sensitivity toggle

- **Results and Statistics**
  - ✅ Detailed performance metrics (accuracy, completion percentage)
  - ✅ Word-level error categorization (correct, misspelled, missing, extra)
  - ✅ Time tracking for performance assessment

### Advanced Word Matching System

- **Key Features**
  - ✅ Word-level comparison rather than character-level matching
  - ✅ Out-of-order word matching to handle flexible typing order
  - ✅ Misspelling detection using Levenshtein distance algorithm
  - ✅ German language support with special character handling
  - ✅ Detailed feedback categorizing errors by type

- **Component Flow**
  1. **Text Normalization** - Converts typed German variants to proper characters
  2. **Similarity Scoring** - Calculates word similarity on a 0-1 scale
  3. **Word Matching Process** - Aligns words using similarity scores
  4. **Results Formatting** - Generates structured comparison result object

## Project Structure

```
dictation-tool/
├── index.html              # Main HTML file
├── css/                    # Stylesheet directory
│   ├── main.css            # Core application styles
│   ├── player.css          # Player-specific styles
│   ├── segments.css        # Segment-specific styles
│   ├── input.css           # Input field styles (new)
│   └── responsive.css      # Responsive design styles
├── js/                     # JavaScript directory
│   ├── main.js             # Application entry point
│   ├── modules/            # Functional modules
│   │   ├── config.js       # Configuration options
│   │   ├── player.js       # Audio player functionality
│   │   ├── ui.js           # UI interactions
│   │   ├── vttParser.js    # WebVTT parser
│   │   ├── segmentManager.js # Audio segmentation
│   │   ├── inputManager.js # Input field management (new)
│   │   └── userDataStore.js # User input storage (new)
│   └── utils/
│       ├── helpers.js      # Helper functions
│       └── vttHelpers.js   # VTT-specific helpers (new)
└── assets/                 # Static assets
    ├── audio/              # Audio files directory
    │   └── chap01.mp3      # Example audio file
    ├── vtt/                # WebVTT files directory (new)
    │   └── chap01.vtt      # Transcript with timestamps
    └── images/             # Images directory
```

## Usage

1. Clone this repository
2. Open `index.html` in a web browser or serve with a local web server
3. The player will automatically load the default audio file and its associated VTT file
4. Click the Play button to start playback
5. When a sentence finishes playing, the audio will pause and an input field will appear
6. Type what you heard in the input field and click Submit or press Enter
7. The next sentence will automatically play after submission
8. You can also use the segment navigation controls to move between sentences

## WebVTT Format

The application uses WebVTT files for defining audio segments. Each cue represents a sentence with start and end timestamps:

```
WEBVTT

00:00:00.000 --> 00:00:03.500
This is the first sentence of the dictation.

00:00:04.000 --> 00:00:08.200
Here is the second sentence to transcribe.
```

## Embedding in Teachable

```html
<iframe 
  src="https://yourusername.github.io/dictation-tool/" 
  width="100%" 
  height="300" 
  frameborder="0"
  allowfullscreen>
</iframe>
```

## Next Steps

- Phase 2.3: Implement text comparison with reference text
- Phase 2.4: Enhance user experience with smooth transitions and visual feedback
- Phase 3: Add progress tracking and statistics

## Readme Merge

# German Dictation Tool

A web-based dictation application that plays audio files and allows users to transcribe what they hear. This tool features advanced word matching for German language input and is designed to be embedded in learning platforms like Teachable via an iframe.

## Table of Contents

- [Overview](#overview)
- [Project Status](#project-status)
- [Features](#features)
  - [Core Features](#core-features)
  - [Advanced Word Matching System](#advanced-word-matching-system)
- [Project Architecture](#project-architecture)
  - [File Structure](#file-structure)
  - [Core Components](#core-components)
- [Implementation Status](#implementation-status)
  - [Completed Phases](#completed-phases)
  - [Current Phase](#current-phase)
  - [Upcoming Tasks](#upcoming-tasks)
- [Technical Details](#technical-details)
  - [German Language Support](#german-language-support)
  - [Word Matching Algorithm](#word-matching-algorithm)
  - [Debug Logging Strategy](#debug-logging-strategy)
- [Test Cases](#test-cases)
- [Usage and Integration](#usage-and-integration)
  - [Basic Setup](#basic-setup)
  - [Teachable Integration](#teachable-integration)
  - [Dynamic Lesson Selection](#dynamic-lesson-selection)
- [Future Enhancements](#future-enhancements)

## Overview

The German Dictation Tool helps language learners practice their listening and spelling skills through interactive audio-based exercises. It provides sentence-by-sentence audio playback with advanced text comparison capabilities specifically designed for German language learning, including special character handling and sophisticated error detection.

The Dictation Checker implements a sophisticated text input handling system that allows users to type words in any order with various misspellings while still matching them correctly to their expected positions in reference text. This document details how the system works and how to implement it in a new tool.

## Project Status

### Completed Phases:
- ✅ **Phase 1: MVP Player** - Basic audio playback and controls
- ✅ **Phase 2.1: VTT Integration & Audio Segmentation** - Sentence-by-sentence playback
- ✅ **Phase 2.2: Input Field Integration** - Text input and storage
- ✅ **Phase 3: Advanced Word Matching System** - Core algorithm implementation with German language support
- ✅ **Phase 4: Results Screen Integration** - Final comparison results display

### In Progress:
- 🔄 **Optimization & Refinement** - Performance improvements and UX enhancements

## Project Architecture

### File Structure

```
dictation-tool/
├── index.html              # Main HTML file
├── css/                    # Stylesheet directory
│   ├── main.css            # Core application styles
│   ├── player.css          # Player-specific styles
│   ├── segments.css        # Segment-specific styles
│   ├── input.css           # Input field styles
│   └── responsive.css      # Responsive design styles
├── js/                     # JavaScript directory
│   ├── main.js             # Application entry point
│   ├── modules/            # Functional modules
│   │   ├── config.js       # Configuration options
│   │   ├── player.js       # Audio player functionality
│   │   ├── ui.js           # UI interactions
│   │   ├── vttParser.js    # WebVTT parser
│   │   ├── segmentManager.js # Audio segmentation
│   │   ├── inputManager.js # Input field management
│   │   ├── userDataStore.js # User input storage
│   │   ├── resultsScreen.js # Results display and statistics
│   │   ├── uiManager.js    # UI update and display logic
│   │   └── textComparison/ # Text comparison modules
│   │       ├── index.js            # Main exports
│   │       ├── inputProcessor.js   # Processes user input against reference
│   │       ├── similarityScoring.js # Word similarity calculations
│   │       ├── textNormalizer.js   # Text normalization utilities
│   │       └── wordMatcher.js      # Core word alignment algorithm
│   └── utils/
│       ├── helpers.js      # Helper functions
│       └── vttHelpers.js   # VTT-specific helpers
└── assets/                 # Static assets
    ├── audio/              # Audio files directory
    │   └── [lessonID].mp3  # Audio files named by lesson ID
    ├── vtt/                # WebVTT files directory
    │   └── [lessonID].vtt  # Transcript files with timestamps
    └── images/             # Images directory
```

### Core Components

1. **Text Comparison Engine**
   - ✅ Word alignment algorithm matches input words with reference text
   - ✅ Sophisticated similarity scoring using Levenshtein distance
   - ✅ Special German character normalization
   - ✅ Status categorization: correct, misspelled, missing, or extra words

2. **Audio Management**
   - ✅ WebVTT integration for defining sentence segments
   - ✅ Precise playback control based on timestamps
   - ✅ Automatic pausing after each segment

3. **User Interface**
   - ✅ Interactive input system with real-time feedback
   - ✅ Results screen with comprehensive statistics
   - ✅ Reference-text-only display with appropriate highlighting

## Implementation Status

### Completed Phases

#### Phase 1: MVP Player ✅
- ✅ Audio player with standard playback controls
- ✅ Progress bar with time display
- ✅ Responsive design for iframe integration
- ✅ GitHub Pages deployment

#### Phase 2: Audio Segmentation and Input Integration ✅
- ✅ VTT file parsing for sentence segmentation
- ✅ Sentence-by-sentence playback based on timestamps
- ✅ Text input field that appears after each audio segment
- ✅ Storage of user inputs for each segment

#### Phase 3: Advanced Word Matching ✅

**Core Algorithm Implementation**
- ✅ Module structure setup
- ✅ Text normalization with German special character handling
- ✅ Similarity scoring with Levenshtein distance algorithm
- ✅ Word alignment algorithm for out-of-order typing
- ✅ Input processing module

**UI Integration**
- ✅ Integration with input manager
- ✅ Update of UI feedback system
- ✅ Update of results screen

#### Phase 4: Results Screen Integration ✅
- ✅ Statistics calculation (accuracy, completion percentage)
- ✅ Word-level error categorization
- ✅ Segment-by-segment analysis with highlighted differences
- ✅ Retry and new exercise options

### Current Phase

**Optimization & Refinement**
- 🔄 Performance optimization for longer texts
- 🔄 UX improvements based on user feedback
- 🔄 Mobile experience enhancement
- 🔄 Bug fixes and stability improvements

### Upcoming Tasks

- Add more comprehensive test cases
- Optimize performance for longer text segments
- Add support for additional languages beyond German
- Improve handling of punctuation and special characters

## Technical Details

### German Language Support

The system provides comprehensive support for German special characters:

- **Character Transformations**:
  - `ae/a:/a/` → `ä`
  - `oe/o:/o/` → `ö`
  - `ue/u:/u/` → `ü`
  - `s:/s/` → `ß`

- **Transformation Logic**:
  ```javascript
  // Simplified example
  text = text.replace(/ae/gi, match => isUpperCase(match[0]) ? 'Ä' : 'ä');
  text = text.replace(/oe/gi, match => isUpperCase(match[0]) ? 'Ö' : 'ö');
  text = text.replace(/ue/gi, match => isUpperCase(match[0]) ? 'Ü' : 'ü');
  text = text.replace(/a[:\/]/gi, match => isUpperCase(match[0]) ? 'Ä' : 'ä');
  // etc.
  ```

### Word Matching Algorithm

The system uses a sophisticated algorithm to match input words with reference text:

1. **Normalize Text** - Remove punctuation and normalize special characters
2. **Calculate Similarity Scores** - Compute similarity between each pair of words
3. **Find Best Matches** - Identify optimal alignment between reference and input words
4. **Categorize Results** - Mark words as correct, misspelled, missing, or extra

```javascript
// Process user input against reference text
const result = processInput("Es gibt viel zu tun", "zu gibt Es tun");

// Result structure:
{
  words: [
    { word: 'Es', expected: 'Es', status: 'correct', score: 1.0, position: 2 },
    { word: 'gibt', expected: 'gibt', status: 'correct', score: 1.0, position: 1 },
    { word: null, expected: 'viel', status: 'missing', score: 0, position: -1 },
    { word: 'zu', expected: 'zu', status: 'correct', score: 1.0, position: 0 },
    { word: 'tun', expected: 'tun', status: 'correct', score: 1.0, position: 3 }
  ],
  extraWords: []
}
```

### Debug Logging Strategy

The application includes a comprehensive debug logging system:

- **Thorough Event Logging** - All significant events are logged with context
- **Nested Error Handling** - Robust error handling even in restricted environments
- **Contextual Information** - All logs include relevant context for troubleshooting
- **Critical Path Validation** - Key checkpoints include validation logs

```javascript
// Example of nested try/catch for robust logging
try {
    // Main function logic
} catch (error) {
    try { 
        console.error("Descriptive error message:", error);
    } catch (e) { 
        /* Silence console errors in restricted environments */ 
    }
}
```

## Test Cases

The system has been validated with the following test cases:

### 1. Out-of-order Typing
```
Reference: "Es gibt viel zu tun"
Input: "zu gibt Es tun"
Result: Words correctly matched, "viel" marked as missing
```

### 2. Misspelled Words
```
Reference: "Das Wetter ist schön"
Input: "Das Weter ist schon"
Result: "Weter" and "schon" correctly marked as misspelled
```

### 3. Extra Words
```
Reference: "Die Katze schläft"
Input: "Die kleine Katze schläft gerne"
Result: "kleine" and "gerne" correctly marked as extra words
```

### 4. German Character Variants
```
Reference: "Die Tür ist grün"
Input: "Die Tuer ist gruen"
Result: "Tuer" and "gruen" correctly recognized as equivalent to "Tür" and "grün"
```

Need to validate the implementation using the test cases specified in the README-MERGE-OLD-W-NEW.md file:

### Example 1: Out-of-order Typing
```
Reference text: "Es gibt viel zu tun"
User input: "zu gibt Es tun"
Expected: All words except "viel" marked as correct, "viel" as missing
```

### Example 2: Misspelled Words
```
Reference text: "Das Wetter ist schön"
User input: "Das Weter ist schon"
Expected: "Weter" marked as misspelled, "schon" marked as misspelled
```

### Example 3: Extra Words
```
Reference text: "Die Katze schläft"
User input: "Die kleine Katze schläft gerne"
Expected: "kleine" and "gerne" marked as extra words
```

## Usage and Integration

### Basic Setup
```html
<iframe 
  src="https://yourusername.github.io/dictation-tool/?lesson=lesson01" 
  width="100%" 
  height="600" 
  frameborder="0"
  sandbox="allow-scripts allow-same-origin"
  allowfullscreen>
</iframe>
```

### Teachable Integration

When embedding in Teachable:
1. Add an HTML block to your lesson
2. Insert the iframe code above, replacing `yourusername` with your GitHub username
3. Set appropriate `width` and `height` values
4. Specify the lesson ID in the URL query parameter

### Dynamic Lesson Selection

The application supports multiple lessons with unique audio and transcript pairs:

1. Name your audio files as `[lessonID].mp3` in the `audio/` folder
2. Name your VTT files as `[lessonID].vtt` in the `vtt/` folder
3. When embedding, use the query parameter `lesson=lessonID` to specify which lesson to load

```html
<iframe src="https://yourusername.github.io/dictation-tool/?lesson=course1-lesson05"></iframe>
```

## Readme Merge Old W New

# Implementation Plan: Merging Old and New Word Matching Systems

This plan outlines how to combine the proven algorithms from our old dictation matching system with the better code organization of our new modular system.

## Key Principles

1. **Use existing files** - Modify existing files instead of creating duplicates
2. **Keep what works** - Preserve the algorithms from the old system that worked perfectly
3. **Maintain modular structure** - Keep the clean organization of the new system
4. **Reference text approach** - Show only reference text with appropriate highlighting
5. **Keep hardcoded values** - Maintain the thresholds that are proven to work

## Implementation Plan

### Phase 1: Core Algorithm Implementation (5 days)

#### 1.1 Review Existing Files (1 day)
- Identify all relevant files in both old and new systems
- Document which algorithms need to be ported
- Map old functions to new module structure

#### 1.2 Update Text Normalization (1 day)
- Examine existing `js/modules/textComparison/textNormalizer.js`
- Replace with or merge in the German handling from the old system
- Ensure all special character transformations are preserved

#### 1.3 Update Similarity Scoring (1 day)
- Modify `js/modules/textComparison/similarityScoring.js`
- Implement the proven Levenshtein and scoring logic from old system
- Keep the hardcoded thresholds (e.g., 0.3 minimum match)

#### 1.4 Update Word Matcher (1 day)
- Modify `js/modules/textComparison/wordMatcher.js`
- Port the word alignment algorithm from the old system
- Ensure out-of-order typing works correctly

#### 1.5 Update Input Processor (1 day)
- Modify `js/modules/textComparison/inputProcessor.js`
- Integrate the main processing function from the old system
- Preserve the structure that worked with the UI manager

### Phase 2: UI Integration (5 days)

#### 2.1 Update UI Manager (2 days)
- Modify existing `js/modules/uiManager.js`
- Implement the reference-text-only display approach
- Show reference text with highlighting based on user input
- Add CSS classes for different word statuses

#### 2.2 Update Input Manager (2 days)
- Modify existing `js/modules/inputManager.js`
- Integrate with the updated comparison system
- Implement debounced input processing if not already present

#### 2.3 Update Results Screen (1 day)
- Modify existing results display
- Use the detailed statistics from the word matching system
- Keep consistent with the rest of the UI

## Test Cases from Old System

Use these examples to verify correct functionality:

## Benefits of This Approach

1. **Proven reliability** - Using the algorithms that are known to work
2. **Maintainable codebase** - Preserving the clean modular structure
3. **Appropriate UI** - Showing only reference text with highlighting
4. **No duplication** - Modifying existing files instead of creating new ones
5. **Consistent experience** - Maintaining the behavior users expect

## Readme Help

# HELPME.md - Dictation Checker Text Processing System

## 1. Core Architecture

The text handling system consists of several integrated components:

# German Dictation Tool - Usage Guide

## Word Matching System

The dictation tool uses an advanced word matching system designed specifically for German language learning:

### Key Features

- **Flexible Typing Order**: Words are matched regardless of the order you type them
- **German Character Handling**: Multiple ways to type umlauts and special characters
  - `ae` → `ä`, `oe` → `ö`, `ue` → `ü` 
  - `a:` → `ä`, `o:` → `ö`, `u:` → `ü`
  - `a/` → `ä`, `o/` → `ö`, `u/` → `ü`
  - `s:` or `s/` → `ß`
- **Misspelled Word Detection**: Words with typos are highlighted but still matched to their correct position
- **Short Word Support**: All German words, including short ones (in, an, zu, etc.) are properly matched
- **Partial Word Matching**: As you type, the system shows partial matches

### Feedback Colors

- **Green**: Correctly spelled words
- **Red**: Misspelled characters or words
- **Missing letter indicators**: When a letter is missing from a word, the system shows the correct position

## Usage Tips

1. You can type words in any order - the system will match them correctly
2. For umlauts, type either the letter followed by 'e' (ae), colon (a:), or slash (a/)
3. If you're unsure about spelling, type what you hear - the system will show the correct form
4. Submit your answer when finished with the Enter key or Submit button

## Readme Enhanced Matching

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

You can test the system using:

1. The main application - Regular usage will now use the advanced system
2. `advanced-test.html` - A dedicated test page with various test cases
3. `test.html` - Unit tests for core functionality

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

## Readme Debug Logging

# Debug Logging Strategy for Dictation Tool

## Enhanced Logging Implementation

As part of our ongoing development, we've implemented a comprehensive debug logging strategy throughout the codebase. This document outlines the approach and best practices.

### Logging Principles

1. **Thorough Event Logging**: All significant events (segment changes, audio playback, user interactions) are logged with relevant contextual information.

2. **Nested Error Handling**: We use nested try/catch blocks to ensure robust error handling even in restricted environments:

```javascript
try {
    // Main function logic
} catch (error) {
    try { 
        console.error("Descriptive error message:", error);
    } catch (e) { 
        /* Silence console errors in restricted environments */ 
    }
}
```

3. **Contextual Information**: All logs include relevant context (segment numbers, current state, etc.) to aid in troubleshooting:

```javascript
console.log(`Segment ${currentSegment.index + 1} of ${totalSegments}, isLast: ${currentSegment.isLast}`);
```

4. **Critical Path Validation**: Key checkpoints in the application flow include validation logs:

```javascript
console.log('Last segment completed, showing results screen');
console.log('Input submitted for segment ' + segmentIndex);
```

### Implementation Locations

- **Audio Events**: Playback start/end and seeking operations
- **Segment Navigation**: Tracking segment changes and boundary detection
- **Input Processing**: Capturing user input and transformation results
- **Event Dispatching**: Logging when critical events are fired
- **Error States**: Detailed error message capture for debugging

### Benefits

1. Easier troubleshooting of timing and race condition issues
2. Better visibility into the application flow
3. Simplified debugging in production environments
4. Clear tracking of user paths through the application

## Using the Debug Logs

When troubleshooting issues:

1. Open the browser console (F12 or Ctrl+Shift+I)
2. Look for logs showing the sequence of events
3. Check for any error messages or warnings
4. Validate that expected events are firing in the correct order

For production deployment, these logs can be conditionally disabled with a config setting if needed.

## Readme Advanced Comparison

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

## Future Enhancements

Potential future enhancements:
- Phonetic matching for words that sound similar
- Language-specific rule configurations
- Machine learning for personalized feedback
- Adaptive difficulty based on user performance

## Transformation Fix Readme



## German Special Character Transformation Fix

This update addresses an issue where the German umlaut transformations (like "ae" → "ä", "a:" → "ä") work correctly in a local server but fail when the dictation tool is embedded in Teachable via an iframe.

### Issues Fixed

1. **Iframe Sandbox Restrictions**
   - Added robust error handling to work within Teachable's sandbox restrictions
   - Implemented defensive coding to prevent JavaScript errors from breaking functionality

2. **Cursor Position Management**
   - Improved handling of cursor position after text transformation
   - Added fallbacks when `setSelectionRange()` fails in restricted environments

3. **Error-Resistant Transformation**
   - Split transformation into specialized functions with individual error handling
   - Each transformation phase can fail independently without affecting others

4. **Console Access**
   - Made all console logging optional with try-catch blocks
   - Prevents issues when console access is restricted in iframe environments

### Installation Instructions

1. Make sure the new files are in place:
   - `js/modules/inputManager.js.new`
   - `js/modules/textComparison.js.new`

2. Run the installation script:
   ```bash
   chmod +x install-fix.sh
   ./install-fix.sh
   ```

3. Test the application in a Teachable iframe environment

### Testing

To verify the transformation works, enter the following text in the input field:
- "Muenchen" should transform to "München"
- "scho:n" should transform to "schön"
- "gru/n" should transform to "grün"
- "strasse" should transform to "straße"

### Troubleshooting

If issues persist:
1. Check browser console for any errors (if accessible)
2. Verify iframe sandbox attributes include `allow-scripts` and `allow-same-origin`
3. Restore backups from the `backups/` directory if needed

### Reverting Changes

To revert to the original files:
```bash
cp backups/YYYYMMDD/inputManager.js.bak js/modules/inputManager.js
cp backups/YYYYMMDD/textComparison.js.bak js/modules/textComparison.js
```
(Replace YYYYMMDD with the appropriate backup date folder)

## Implementation Progress

# Implementation Progress: Merging Old and New Word Matching Systems

## Completed Tasks

### Phase 1: Core Algorithm Implementation

#### 1.1 Review Existing Files ✓
- Identified all relevant files in both old and new systems
- Documented algorithms to be ported
- Mapped old functions to new module structure

#### 1.2 Update Text Normalization ✓
- Updated `js/modules/textComparison/textNormalizer.js`
- Implemented German special character transformations
- Added segment change tracking

#### 1.3 Update Similarity Scoring ✓
- Updated `js/modules/textComparison/similarityScoring.js`
- Implemented proven Levenshtein distance algorithm
- Added overall text similarity calculation

### Phase 2: Enhanced German Word Matching ✓

#### 2.1 Keyboard Proximity Analysis ✓
- Created `js/modules/textComparison/keyboardProximity.js` with multiple keyboard layout maps:
  - German QWERTZ layout
  - US/International QWERTY layout
  - French AZERTY layout
- Implemented multi-layout adjacency detection for international users
- Enhanced Levenshtein with proximity-based substitution costs
- Added keyboard layout auto-detection functionality

#### 2.2 Length-Based Threshold Adjustments ✓
- Implemented dynamic thresholds for words of different lengths
- Added configuration options for fine-tuning threshold adjustments
- Updated word matching to use length-appropriate similarity thresholds

#### 2.3 German Typo Pattern Detection ✓
- Added detection of common German-specific typo patterns
- Implemented bonuses for recognized patterns such as "sch/sh", umlaut variants
- Created pattern-specific adjustments to similarity scores

#### 1.4 Update Word Matcher ✓
- Updated `js/modules/textComparison/wordMatcher.js`
- Implemented word alignment algorithms
- Added text match determination function

#### 1.5 Update Input Processor ✓
- Updated `js/modules/textComparison/inputProcessor.js`
- Integrated processing function with error highlighting
- Connected segment change notifications

### Phase 2: UI Integration

#### 2.1 Update UI Manager ✓
- Updated `js/modules/uiManager.js`
- Implemented reference-text-only display approach
- Added highlighting based on user input status

#### 2.2 Update Input Manager ✓
- Updated `js/modules/inputManager.js` 
- Integrated with updated comparison system
- Added proper segment change notification
- Fixed reference text display issues

#### 2.3 Update Results Screen ✓
- Updated `js/modules/resultsScreen.js`
- Integrated with enhanced text comparison system
- Used detailed statistics for result display

## Final Steps

The implementation needs to be tested with the example cases from the old system:

#### Example 1: Out-of-order Typing
```
Reference text: "Es gibt viel zu tun"
User input: "zu gibt Es tun"
Expected: All words except "viel" marked as correct, "viel" as missing
```

#### Example 2: Misspelled Words
```
Reference text: "Das Wetter ist schön"
User input: "Das Weter ist schon"
Expected: "Weter" marked as misspelled, "schon" marked as misspelled
```

#### Example 3: Extra Words
```
Reference text: "Die Katze schläft"
User input: "Die kleine Katze schläft gerne"
Expected: "kleine" and "gerne" marked as extra words
```

### Future Improvements

1. Add more comprehensive test cases
2. Optimize performance for longer text segments
3. Add support for additional languages beyond German
4. Improve handling of punctuation and special characters

## Enhancement Summary

# German Dictation Tool Enhancement Summary

## Multi-Keyboard Layout Support for Language Learners

We've enhanced the German dictation tool to better support international language learners using different keyboard layouts:

### 1. Multiple Keyboard Layout Detection

- Added support for three major keyboard layouts:
  - **QWERTZ** (German layout)
  - **QWERTY** (US/International layout)
  - **AZERTY** (French layout)

- Implemented auto-detection functionality to identify which keyboard layout the user is likely using based on their typo patterns
- Added configuration option to manually select a specific keyboard layout if desired

- Improved the scoring system to account for word length when determining similarity thresholds
- Implemented a dynamic formula that provides more lenient thresholds for longer words
- Created detailed analysis and documentation explaining how word length affects similarity scoring

- Added recognition of common German language typo patterns
- Implemented special handling for:
  - "sch" vs "sh" substitutions
  - Umlaut variations (ä/a, ö/o, ü/u)
  - Eszett (ß) alternatives
  - Double vowel omissions

### Testing and Documentation

- Created an interactive testing page (enhanced-matching-test.html) that visualizes the effects of these improvements
- Added keyboard layout analysis tools to help diagnose which layout is being used
- Provided comprehensive documentation of all features
- Created word length analysis tools to better understand similarity scoring patterns

### Benefits for Language Learners

1. **Keyboard Flexibility**: Students can practice German from anywhere with any keyboard
2. **Improved Accuracy**: Better recognition of intended words despite typing errors
3. **More Intuitive Feedback**: Length-appropriate scoring gives fairer feedback for longer words
4. **German-Specific Intelligence**: Special handling for the unique aspects of German orthography

### Configuration Options

All new features can be toggled on/off through the configuration system:

```javascript
// Text Comparison configurations
export const textComparisonConfig = {
    // Core settings
    minimumMatchThreshold: 0.3,
    language: 'de',
    
    // New features
    useKeyboardProximity: true,
    useLengthBasedThresholds: true,
    useGermanTypoPatterns: true,
    
    // Keyboard settings
    keyboardLayout: 'auto',  // 'qwertz', 'qwerty', 'azerty' or 'auto'
    adjacentKeyCost: 0.8,
    
    // Length adjustment settings
    maxLengthAdjustment: 0.1,
    lengthAdjustmentFactor: 0.01
};
```
