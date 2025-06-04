/**
 * Module for managing audio segments based on VTT cues
 */
import { config } from './config.js';
import { formatTime } from '../utils/helpers.js';

// Store the current timeupdate handler reference
let currentTimeUpdateHandler = null;

// Track active playback state
let isCurrentlyPlaying = false;

// Add protection against rapid segment advancement
let lastAdvanceTime = 0;

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
    // Prevent playback if we're already playing
    if (isCurrentlyPlaying) {
        console.log('Already playing a segment, ignoring request');
        return;
    }

    if (!segmentState.cues || segmentState.cues.length === 0) {
        console.error('No cues available to play');
        return;
    }
    
    const currentCue = segmentState.cues[segmentState.currentIndex];
    console.log(`Starting segment ${segmentState.currentIndex + 1} at ${currentCue.startTime.toFixed(2)}`);
    
    // Remove any previous listener
    if (currentTimeUpdateHandler) {
        audio.removeEventListener('timeupdate', currentTimeUpdateHandler);
        currentTimeUpdateHandler = null;
    }
    
    // Create new handler
    currentTimeUpdateHandler = () => {
        // Only check end time if we're still playing the same segment
        // Log for debugging
        console.log(`Segment ${segmentState.currentIndex + 1}: Current time: ${audio.currentTime.toFixed(2)}, End time: ${currentCue.endTime.toFixed(2)}`);
        
        if (audio.currentTime >= currentCue.endTime - config.segmentTimeTolerance) {
            console.log(`Ending segment ${segmentState.currentIndex + 1} at time ${audio.currentTime.toFixed(2)}`);
            
            // Set flag that we've ended this segment
            isCurrentlyPlaying = false;
            
            audio.pause();
            segmentState.isPlaying = false;
            
            // Remove the listener to prevent multiple firings
            if (currentTimeUpdateHandler) {
                audio.removeEventListener('timeupdate', currentTimeUpdateHandler);
                currentTimeUpdateHandler = null;
            }
            
            // Check if this was the last segment
            const isLastSegment = segmentState.currentIndex === segmentState.cues.length - 1;
            
            // Dispatch segment ended event
            const event = new CustomEvent('segmentEnded', {
                detail: { 
                    index: segmentState.currentIndex,
                    cue: currentCue,
                    isLastSegment: isLastSegment
                }
            });
            document.dispatchEvent(event);
            
            // If this was the last segment, also dispatch the showResults event
            // if (isLastSegment) {
            //    console.log('Last segment ended naturally, showing results');
            //    document.dispatchEvent(new CustomEvent('showResults'));
            // } 
        }
    };
    
    // Add proper error handling for seeking
    try {
        audio.currentTime = currentCue.startTime;
        
        // Set flag that we're now playing
        isCurrentlyPlaying = true;
        
        // Register new handler
        audio.addEventListener('timeupdate', currentTimeUpdateHandler);
        
        // Play with error handling
        audio.play().catch(error => {
            console.error(`Failed to play segment ${segmentState.currentIndex + 1}:`, error);
            isCurrentlyPlaying = false;
        });
        
        segmentState.isPlaying = true;
        
    } catch (error) {
        console.error(`Failed to seek to ${currentCue.startTime} for segment ${segmentState.currentIndex + 1}:`, error);
        isCurrentlyPlaying = false;
    }
}

/**
 * Move to the next segment
 * @param {HTMLAudioElement} audio - The audio element
 * @returns {boolean} - True if moved to next segment, false if already at last segment
 */
export function nextSegment(audio) {
    // Stop the current audio playback immediately
    audio.pause();
    
    // Clear any active timeupdate handler
    if (currentTimeUpdateHandler) {
        audio.removeEventListener('timeupdate', currentTimeUpdateHandler);
        currentTimeUpdateHandler = null;
    }
    
    // Prevent too-rapid advancements
    const now = Date.now();
    if (now - lastAdvanceTime < 800) { // 0.8 second cooldown
        console.log('Ignoring rapid segment advancement request');
        return false;
    }
    
    // Update the timestamp
    lastAdvanceTime = now;
    
    // Check if we're already at the last segment
    if (segmentState.currentIndex >= segmentState.cues.length - 1) {
        console.log('Already at the last segment, dispatching showResults event');
        // Dispatch event to show results
        document.dispatchEvent(new CustomEvent('showResults'));
        return false;
    }
    
    // Advance to next segment
    segmentState.currentIndex++;
    updateSegmentIndicator();
    
    // Check if this is now the last segment after advancing
    const isLastSegment = segmentState.currentIndex === segmentState.cues.length - 1;
    if (isLastSegment) {
        console.log('Advanced to final segment');
    }
    
    playCurrentSegment(audio);
    return true;
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
