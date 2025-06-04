// Audio player functionality (play, pause, etc.)
import { config } from './config.js';
import { formatTime } from '../utils/helpers.js';

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
    audio.preload = 'metadata';
    
    // Add error handler for audio playback issues
    audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        console.error('Error code:', audio.error ? audio.error.code : 'unknown');
        console.error('Error message:', audio.error ? audio.error.message : 'unknown');
    });
    
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
 */
export function setAudioProgress(audio, e) {
    const progressBar = document.getElementById(config.progressBarId);
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration || 0;
    
    audio.currentTime = (clickX / width) * duration;
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
