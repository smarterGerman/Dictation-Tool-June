/**
 * Module for managing audio segments based on VTT cues
 */
import { config } from './config.js';
import { formatTime } from '../utils/helpers.js';
import { generatePlaceholdersForReference, updatePlaceholders } from './uiManager.js';

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
        // console.log(`Segment ${segmentState.currentIndex + 1}: Current time: ${audio.currentTime.toFixed(2)}, End time: ${currentCue.endTime.toFixed(2)}`);
        
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
        
        // Dispatch segment started event
        const startEvent = new CustomEvent('segmentStarted', {
            detail: { 
                index: segmentState.currentIndex,
                cue: segmentState.cues[segmentState.currentIndex]
            }
        });
        document.dispatchEvent(startEvent);
        
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
    // First pause any playing audio and clear handlers
    audio.pause();
    
    if (currentTimeUpdateHandler) {
        audio.removeEventListener('timeupdate', currentTimeUpdateHandler);
        currentTimeUpdateHandler = null;
    }
    
    // Reset the playing state flag
    isCurrentlyPlaying = false;
    
    // Check if we're already at the last segment
    if (segmentState.currentIndex >= segmentState.cues.length - 1) {
        console.log('At last segment and Next clicked - showing results');
        document.dispatchEvent(new CustomEvent('showResults'));
        return;
    }
    
    // If not at the last segment, proceed with normal advancement
    segmentState.currentIndex++;
    updateSegmentIndicator();
    
    // Add a small delay before playing to avoid race condition
    setTimeout(() => {
        playCurrentSegment(audio);
    }, 50);
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
 * Find the segment index at a specific time
 * @param {number} time - The time position in seconds
 * @returns {number} - The index of the segment containing this time
 */
export function findSegmentAtTime(time) {
    console.log(`Finding segment for time ${time.toFixed(2)}s`);
    console.log(`Total segments: ${segmentState.cues.length}`);
    
    // Log a few segments for debugging
    if (segmentState.cues.length > 0) {
        console.log(`First segment: ${segmentState.cues[0].startTime.toFixed(2)}s - ${segmentState.cues[0].endTime.toFixed(2)}s`);
        
        if (segmentState.cues.length > 1) {
            console.log(`Second segment: ${segmentState.cues[1].startTime.toFixed(2)}s - ${segmentState.cues[1].endTime.toFixed(2)}s`);
        }
        
        if (segmentState.cues.length > 5) {
            console.log(`Sixth segment: ${segmentState.cues[5].startTime.toFixed(2)}s - ${segmentState.cues[5].endTime.toFixed(2)}s`);
        }
    }
    
    for (let i = 0; i < segmentState.cues.length; i++) {
        const cue = segmentState.cues[i];
        console.log(`Checking segment ${i+1}: ${cue.startTime.toFixed(2)}s - ${cue.endTime.toFixed(2)}s against time ${time.toFixed(2)}s`);
        
        if (time >= cue.startTime && time < cue.endTime) {
            console.log(`Found exact match: segment ${i+1}`);
            return i;
        }
    }
    
    // If not found within any segment exactly, find the closest segment
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    for (let i = 0; i < segmentState.cues.length; i++) {
        const cue = segmentState.cues[i];
        const distanceToStart = Math.abs(time - cue.startTime);
        const distanceToEnd = Math.abs(time - cue.endTime);
        const minDistance = Math.min(distanceToStart, distanceToEnd);
        
        if (minDistance < closestDistance) {
            closestDistance = minDistance;
            closestIndex = i;
        }
    }
    
    console.log(`Selected closest segment: ${closestIndex+1} (distance: ${closestDistance.toFixed(2)}s)`);
    return closestIndex;
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

/**
 * Display the current segment with reference text
 * @param {number} segmentIndex - The index of the segment to display
 */
export function displaySegment(segmentIndex) {
    const segment = segmentState.cues[segmentIndex];
    const referenceText = segment.text;
    
    // Get your reference text container
    const referenceContainer = document.querySelector('.reference-container'); // Update selector as needed
    
    // Clear previous content
    referenceContainer.innerHTML = '';
    
    // Generate and add placeholder container
    const placeholderContainer = generatePlaceholdersForReference(referenceText);
    referenceContainer.appendChild(placeholderContainer);
    
    // Store reference to the container for updates
    currentPlaceholderContainer = placeholderContainer;
    
    // Update the segment display (if you have any specific display logic)
    updateSegmentDisplay(segment);
}

/**
 * Update the segment display UI
 * @param {Object} segment - The segment object containing cue data
 */
function updateSegmentDisplay(segment) {
    // Implement your segment display update logic here
    // This function is a placeholder for any additional UI updates needed
    console.log(`Displaying segment: ${segment.text}`);
}
