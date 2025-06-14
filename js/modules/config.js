// Configuration options and constants
export const defaultAudio = 'assets/audio/chap01.mp3';
export const defaultVTT = 'assets/vtt/chap01.vtt';

// Text Comparison configurations
export const textComparisonConfig = {
    minimumMatchThreshold: 0.3, // Minimum score to consider a match
    caseSensitive: false,       // Whether to consider case in matching
    strictPunctuation: false,   // Whether punctuation affects matching
    language: 'de',             // Default language (German)
    showMisspellingDetails: true, // Whether to show detailed feedback for misspellings
    
    // New features
    useKeyboardProximity: true, // Whether to use keyboard proximity for similarity
    useLengthBasedThresholds: true, // Whether to adjust thresholds based on word length
    useGermanTypoPatterns: true, // Whether to detect common German typo patterns
    
    // Keyboard proximity settings
    keyboardLayout: 'auto',     // Keyboard layout: 'qwertz', 'qwerty', 'azerty' or 'auto'
    adjacentKeyCost: 0.8,       // Cost for adjacent key substitutions (lower = more similar)
    
    // Length-based threshold adjustments
    maxLengthAdjustment: 0.1,   // Maximum threshold reduction based on length
    lengthAdjustmentFactor: 0.01 // Adjustment factor per character
};

export const config = {
    playerContainerId: 'player-container',
    audioPlayerId: 'audio-player',
    controlsId: 'controls',
    playBtnId: 'play-btn',
    pauseBtnId: 'pause-btn',
    progressBarId: 'progress-bar',
    progressId: 'progress',
    timeDisplayId: 'time-display',
    
    // Segment configurations for VTT integration
    segmentContainerId: 'segment-container',
    prevSegmentBtnId: 'prev-segment-btn',
    nextSegmentBtnId: 'next-segment-btn',
    replaySegmentBtnId: 'replay-segment-btn',
    segmentIndicatorId: 'segment-indicator',
    
    // Input field configurations
    inputContainerId: 'input-container',
    inputFieldId: 'transcription-input',
    submitBtnId: 'submit-button',
    highlightContainerId: 'highlight-container',
    
    // Results screen configurations
    resultsContainerId: 'results-container',
    retryBtnId: 'retry-btn',
    newExerciseBtnId: 'new-exercise-btn',
    
    // Text comparison options
    minMatchPercentage: 90, // Minimum percentage for a match to be considered correct
    autoAdvanceDelay: 1000, // Delay in ms before auto-advancing to next segment when correct
    
    // Default tolerance for segment boundaries (in seconds)
    segmentTimeTolerance: 0.05, // Reduced tolerance to prevent premature ending
    
    // Delay before automatically focusing the input field (ms)
    autoFocusDelay: 100,
    
    // Progress bar seeking behavior
    seekToSegmentStart: true, // When true, clicking on progress bar jumps to start of the closest segment
    
    // New timing configurations
    segmentAdvanceDelay: 200,      // ms to wait before playing next segment
    segmentAdvanceCooldown: 800,   // ms cooldown between segment advances
    keyPressCooldown: 500          // ms cooldown between Enter key processing
};
