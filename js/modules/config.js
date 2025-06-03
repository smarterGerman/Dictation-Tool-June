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
    
    // New configurations for VTT integration
    segmentContainerId: 'segment-container',
    prevSegmentBtnId: 'prev-segment-btn',
    nextSegmentBtnId: 'next-segment-btn',
    replaySegmentBtnId: 'replay-segment-btn',
    segmentIndicatorId: 'segment-indicator',
    
    // Input field configurations
    inputContainerId: 'input-container',
    inputFieldId: 'transcription-input',
    submitBtnId: 'submit-button',
    
    // Default tolerance for segment boundaries (in seconds)
    segmentTimeTolerance: 0.2,
    
    // Delay before automatically focusing the input field (ms)
    autoFocusDelay: 100
};
