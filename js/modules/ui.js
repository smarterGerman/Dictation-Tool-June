// UI interactions and DOM manipulation
import { config } from './config.js';
import { updateProgress, setAudioProgress } from './player.js';

/**
 * Set up UI components and event listeners
 * @param {HTMLAudioElement} audio - The audio element
 */
export function setupUI(audio) {
    const playBtn = document.getElementById(config.playBtnId);
    const pauseBtn = document.getElementById(config.pauseBtnId);
    const progressBar = document.getElementById(config.progressBarId);
    
    // Play button event
    playBtn.addEventListener('click', () => {
        audio.play();
    });
    
    // Pause button event
    pauseBtn.addEventListener('click', () => {
        audio.pause();
    });
    
    // Time/progress update
    audio.addEventListener('timeupdate', () => {
        updateProgress(audio);
    });
    
    // Click on progress bar
    progressBar.addEventListener('click', (e) => {
        setAudioProgress(audio, e);
    });
    
    // When audio ends
    audio.addEventListener('ended', () => {
        console.log('Audio playback completed');
    });
    
    // Add loading indicator
    audio.addEventListener('loadstart', () => {
        console.log('Loading audio...');
    });
    
    // When metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        updateProgress(audio);
        console.log('Audio metadata loaded');
    });
    
    // Handle errors
    audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        alert('Failed to load audio file. Please check the path and try again.');
    });
}
