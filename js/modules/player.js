// Audio player functionality (play, pause, etc.)
import { config } from './config.js';
import { formatTime } from '../utils/helpers.js';
import { findSegmentAtTime, jumpToSegment } from './segmentManager.js';

/**
 * Initialize the audio player with the specified audio source
 * @param {string} audioSrc - Path to the audio file
 * @returns {HTMLAudioElement} - The audio element
 */
export function initPlayer(audioSrc) {
    const audioContainer = document.getElementById(config.audioPlayerId);
    
    // Create audio element
    const audio = document.createElement('audio');
    audio.id = 'audio-element';
    audio.src = audioSrc;
    audio.preload = 'auto';  // Change from 'metadata' to 'auto' for better loading
    
    // Add error handler for audio playback issues
    audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        console.error('Error code:', audio.error ? audio.error.code : 'unknown');
        console.error('Error message:', audio.error ? audio.error.message : 'unknown');
    });
    
    // Force audio to begin loading
    audio.load();
    
    // Add track element for VTT (optional, mostly for browsers that support native tracks)
    const track = document.createElement('track');
    track.kind = 'metadata';
    track.src = audioSrc.replace('audio/', 'vtt/').replace('.mp3', '.vtt');
    track.default = true;
    audio.appendChild(track);
    
    // Make sure container is empty before appending
    audioContainer.innerHTML = '';
    audioContainer.appendChild(audio);
    
    return audio;
}

/**
 * Update the progress bar based on audio's current time
 * @param {HTMLAudioElement} audio - The audio element
 */
export function updateProgress(audio) {
    const progressBar = document.getElementById(config.progressId);
    const timeDisplay = document.getElementById(config.timeDisplayId);
    
    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    
    // Update progress bar width
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update time display
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

/**
 * Set the audio time based on progress bar click position
 * @param {HTMLAudioElement} audio - The audio element
 * @param {Event} e - Click event
 * @param {Array} [cues] - Optional array of segment cues
 */
export function setAudioProgress(audio, e, cues) {
    // First, check if we clicked directly on a segment element
    const clickedElement = e.target;
    console.log('Clicked element:', clickedElement.className, clickedElement.title || 'no title');
    
    // If we clicked on a segment-region or segment-marker, extract segment info directly
    if (clickedElement.className === 'segment-region' || clickedElement.className === 'segment-marker') {
        // Extract segment number from the title attribute (format: "Segment X" or "Start of segment X")
        const titleText = clickedElement.title || '';
        const segmentMatch = titleText.match(/segment (\d+)/i);
        
        if (segmentMatch && segmentMatch[1]) {
            // Convert to zero-based index
            const segmentIndex = parseInt(segmentMatch[1], 10) - 1;
            
            console.log(`Direct click on ${clickedElement.className} for segment ${segmentIndex + 1}`);
            
            // Jump to the segment
            jumpToSegment(audio, segmentIndex);
            return;
        }
    }
    
    // If we didn't click directly on a segment element, or couldn't extract the segment number,
    // fall back to the current calculation method
    const progressBar = document.getElementById(config.progressBarId);
    if (!progressBar) {
        console.error(`Progress bar element with ID '${config.progressBarId}' not found`);
        return;
    }
    
    // Get the absolute position of the progress bar
    const rect = progressBar.getBoundingClientRect();
    
    // Calculate click position relative to the entire progress bar
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Calculate percentage and target time
    const clickPosition = clickX / width;
    const targetTime = clickPosition * audio.duration;
    
    console.log(`Progress bar clicked at ${clickX.toFixed(0)}px / ${width.toFixed(0)}px = ${clickPosition.toFixed(2)} of duration ${audio.duration.toFixed(2)}s`);
    console.log(`Calculated target time: ${targetTime.toFixed(2)}s`);
    
    // Find which segment this time belongs to
    const segmentIndex = findSegmentAtTime(targetTime);
    
    if (segmentIndex !== undefined && segmentIndex >= 0) {
        console.log(`Progress bar clicked - Position corresponds to segment ${segmentIndex + 1}`);
        
        // Jump to the beginning of the identified segment
        jumpToSegment(audio, segmentIndex);
        
        // Don't auto-play unless it was already playing
        if (audio.paused) {
            console.log('Audio was paused - leaving it paused after segment jump');
        }
        
        return;
    }
    
    // Fallback if segmentIndex wasn't found for some reason
    console.log(`Progress bar clicked - Setting time to ${targetTime.toFixed(2)}`);
    audio.currentTime = targetTime;
}

/**
 * Load a new audio file
 * @param {HTMLAudioElement} audio - The audio element
 * @param {string} audioSrc - Path to the audio file
 */
export function loadAudio(audio, audioSrc) {
    audio.src = audioSrc;
    audio.load();
}

/**
 * Create visual segment markers in the progress bar
 * @param {Array} cues - Array of cue objects 
 * @param {number} totalDuration - Total duration of the audio in seconds
 */
export function createSegmentMarkers(cues, totalDuration) {
    if (!cues || cues.length === 0 || !totalDuration) {
        console.log('No cues or duration provided for segment markers');
        return;
    }
    
    const progressBar = document.getElementById(config.progressBarId);
    if (!progressBar) {
        console.error('Progress bar element not found');
        return;
    }
    
    // Clear existing markers
    const existingMarkers = progressBar.querySelectorAll('.segment-marker, .segment-region');
    existingMarkers.forEach(marker => marker.remove());
    
    console.log(`Creating segment markers for ${cues.length} segments`);
    
    // Add new markers
    cues.forEach((cue, index) => {
        // Create a marker at the start of each segment (except the first one)
        if (index > 0) {
            const marker = document.createElement('div');
            marker.className = 'segment-marker';
            const position = (cue.startTime / totalDuration) * 100;
            marker.style.left = `${position}%`;
            marker.title = `Start of segment ${index + 1}`;
            progressBar.appendChild(marker);
        }
        
        // Create a subtle region background for each segment
        const region = document.createElement('div');
        region.className = 'segment-region';
        const startPosition = (cue.startTime / totalDuration) * 100;
        const endPosition = (cue.endTime / totalDuration) * 100;
        region.style.left = `${startPosition}%`;
        region.style.width = `${endPosition - startPosition}%`;
        region.title = `Segment ${index + 1}`;
        progressBar.appendChild(region);
    });
    
    console.log('Segment markers created');
}

/**
 * Update the progress bar width
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total duration of the audio in seconds
 */
function updateProgressBar(currentTime, duration) {
    try {
        const progressBarElement = document.querySelector('.progress-bar-fill') || 
                                   document.getElementById('progress-bar');
        
        // Check if the progress bar element exists
        if (!progressBarElement) {
            // Only log warning once to avoid console spam
            if (!window._progressBarWarningShown) {
                console.warn('Progress bar element not found. Make sure the element with class "progress-bar-fill" or ID "progress-bar" exists in the HTML.');
                window._progressBarWarningShown = true;
            }
            return;
        }
        
        // Calculate progress percentage
        const progress = (currentTime / duration) * 100;
        progressBarElement.style.width = `${progress}%`;
    } catch (error) {
        console.error('Error updating progress bar:', error);
    }
}
