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

## Project Status

### Completed Phases:
- ✅ **Phase 1: MVP Player** - Basic audio playback and controls
- ✅ **Phase 2.1: VTT Integration & Audio Segmentation** - Sentence-by-sentence playback
- ✅ **Phase 2.2: Input Field Integration** - Text input and storage
- ✅ **Phase 3: Advanced Word Matching System** - Core algorithm implementation with German language support
- ✅ **Phase 4: Results Screen Integration** - Final comparison results display

### In Progress:
- 🔄 **Optimization & Refinement** - Performance improvements and UX enhancements

## Features

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