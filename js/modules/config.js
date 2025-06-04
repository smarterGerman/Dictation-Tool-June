// Configuration options and constants
export const defaultAudio = 'assets/audio/chap01.mp3';
export const defaultVTT = 'assets/vtt/chap01.vtt';

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
    
    // New timing configurations
    segmentAdvanceDelay: 200,      // ms to wait before playing next segment
    segmentAdvanceCooldown: 800,   // ms cooldown between segment advances
    keyPressCooldown: 500          // ms cooldown between Enter key processing
};
