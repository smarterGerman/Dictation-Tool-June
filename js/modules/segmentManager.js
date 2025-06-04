/**
 * Module for managing audio segments based on VTT cues
 */
import { config } from './config.js';
import { formatTime } from '../utils/helpers.js';

// State for segment management
const segmentState = {
    cues: [], // Array of VTT cue objects
    currentIndex: 0, // Current cue index
    isPlaying: false
};

/**
 * Initialize the segment manager with VTT cues
 * @param {Array} cues - Array of cue objects from VTT parser
 */
export function initSegmentManager(cues) {
    segmentState.cues = cues;
    segmentState.currentIndex = 0;
    segmentState.isPlaying = false;
    
    updateSegmentIndicator();
    
    return segmentState;
}

/**
 * Play the current segment
 * @param {HTMLAudioElement} audio - The audio element
 */
export function playCurrentSegment(audio) {
    if (!segmentState.cues || segmentState.cues.length === 0) {
        console.error('No cues available to play');
        return;
    }
    
    const currentCue = segmentState.cues[segmentState.currentIndex];
    
    // Set audio time to start of current cue
    audio.currentTime = currentCue.startTime;
    
    // Add event listener for timeupdate to handle segment end
    const handleTimeUpdate = () => {
        // Check if current time has passed the end of the cue (with small tolerance)
        if (audio.currentTime >= currentCue.endTime - config.segmentTimeTolerance) {
            audio.pause();
            segmentState.isPlaying = false;
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            
            // Dispatch an event that the segment has ended
            const event = new CustomEvent('segmentEnded', {
                detail: { 
                    index: segmentState.currentIndex,
                    cue: currentCue
                }
            });
            document.dispatchEvent(event);
        }
    };
    
    // Start playing and set up listener
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.play();
    segmentState.isPlaying = true;
}

/**
 * Move to the next segment
 * @param {HTMLAudioElement} audio - The audio element
 * @returns {boolean} - True if moved to next segment, false if already at last segment
 */
export function nextSegment(audio) {
    if (segmentState.currentIndex < segmentState.cues.length - 1) {
        segmentState.currentIndex++;
        updateSegmentIndicator();
        playCurrentSegment(audio);
        return true;
    }
    return false;
}

/**
 * Move to the previous segment
 * @param {HTMLAudioElement} audio - The audio element
 * @returns {boolean} - True if moved to previous segment, false if already at first segment
 */
export function previousSegment(audio) {
    if (segmentState.currentIndex > 0) {
        segmentState.currentIndex--;
        updateSegmentIndicator();
        playCurrentSegment(audio);
        return true;
    }
    return false;
}

/**
 * Replay the current segment
 * @param {HTMLAudioElement} audio - The audio element
 */
export function replayCurrentSegment(audio) {
    playCurrentSegment(audio);
}

/**
 * Jump to a specific segment
 * @param {HTMLAudioElement} audio - The audio element
 * @param {number} index - Index of the segment to jump to
 * @returns {boolean} - True if jump was successful, false otherwise
 */
export function jumpToSegment(audio, index) {
    if (index >= 0 && index < segmentState.cues.length) {
        segmentState.currentIndex = index;
        updateSegmentIndicator();
        playCurrentSegment(audio);
        return true;
    }
    return false;
}

/**
 * Get the current segment information
 * @returns {Object} - Current segment information or null if no segments
 */
export function getCurrentSegment() {
    if (!segmentState.cues || segmentState.cues.length === 0) {
        return null;
    }
    
    const currentCue = segmentState.cues[segmentState.currentIndex];
    
    return {
        index: segmentState.currentIndex,
        total: segmentState.cues.length,
        cue: currentCue,
        text: currentCue.text,
        isFirst: segmentState.currentIndex === 0,
        isLast: segmentState.currentIndex === segmentState.cues.length - 1
    };
}

/**
 * Get all segments
 * @returns {Array} - All cue segments
 */
export function getAllSegments() {
    return segmentState.cues;
}

/**
 * Update the segment indicator in the UI
 */
function updateSegmentIndicator() {
    const indicatorElement = document.getElementById(config.segmentIndicatorId);
    if (!indicatorElement) return;
    
    const current = segmentState.currentIndex + 1;
    const total = segmentState.cues.length;
    
    indicatorElement.textContent = `Segment ${current} of ${total}`;
}
