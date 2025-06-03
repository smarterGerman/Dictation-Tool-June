// UI interactions and DOM manipulation
import { config } from './config.js';
import { updateProgress, setAudioProgress } from './player.js';
import { playCurrentSegment, nextSegment, previousSegment, replayCurrentSegment } from './segmentManager.js';

/**
 * Set up UI components and event listeners
 * @param {HTMLAudioElement} audio - The audio element
 * @param {Object} segmentState - The segment state object
 * @param {Object} inputManager - The input manager object
 */
export function setupUI(audio, segmentState, inputManager) {
    const playBtn = document.getElementById(config.playBtnId);
    const pauseBtn = document.getElementById(config.pauseBtnId);
    const progressBar = document.getElementById(config.progressBarId);
    
    // Setup segment navigation buttons
    setupSegmentControls(audio);
    
    // Play button event
    playBtn.addEventListener('click', () => {
        playCurrentSegment(audio);
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
    
    // Listen for segment ended event
    document.addEventListener('segmentEnded', (e) => {
        console.log('Segment ended:', e.detail);
        // When a segment ends, the inputManager will handle showing the input field
        // due to its own segmentEnded event listener
    });
    
    // Listen for input submitted events to handle segment transitions
    document.addEventListener('inputSubmitted', (e) => {
        // Hide the input field when moving to the next segment
        if (inputManager) {
            inputManager.hideInputField();
        }
    });
}

/**
 * Setup segment control buttons and their event listeners
 * @param {HTMLAudioElement} audio - The audio element
 */
function setupSegmentControls(audio) {
    // Create segment navigation controls if they don't exist
    if (!document.getElementById(config.segmentContainerId)) {
        createSegmentControls();
    }
    
    // Set up event listeners for segment controls
    const prevBtn = document.getElementById(config.prevSegmentBtnId);
    const nextBtn = document.getElementById(config.nextSegmentBtnId);
    const replayBtn = document.getElementById(config.replaySegmentBtnId);
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // Hide any visible input field when changing segments
            const inputContainer = document.getElementById(config.inputContainerId);
            if (inputContainer) {
                inputContainer.style.display = 'none';
            }
            previousSegment(audio);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Hide any visible input field when changing segments
            const inputContainer = document.getElementById(config.inputContainerId);
            if (inputContainer) {
                inputContainer.style.display = 'none';
            }
            nextSegment(audio);
        });
    }
    
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            // Hide any visible input field when replaying
            const inputContainer = document.getElementById(config.inputContainerId);
            if (inputContainer) {
                inputContainer.style.display = 'none';
            }
            replayCurrentSegment(audio);
        });
    }
}

/**
 * Create segment controls and add them to the DOM
 */
function createSegmentControls() {
    const controlsDiv = document.getElementById(config.controlsId);
    
    // Create segment controls container
    const segmentContainer = document.createElement('div');
    segmentContainer.id = config.segmentContainerId;
    segmentContainer.className = 'segment-controls';
    
    // Create segment navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.id = config.prevSegmentBtnId;
    prevBtn.className = 'control-btn segment-btn';
    prevBtn.textContent = '◄ Prev';
    prevBtn.title = 'Previous segment';
    
    const replayBtn = document.createElement('button');
    replayBtn.id = config.replaySegmentBtnId;
    replayBtn.className = 'control-btn segment-btn';
    replayBtn.textContent = '↻ Replay';
    replayBtn.title = 'Replay current segment';
    
    const nextBtn = document.createElement('button');
    nextBtn.id = config.nextSegmentBtnId;
    nextBtn.className = 'control-btn segment-btn';
    nextBtn.textContent = 'Next ►';
    nextBtn.title = 'Next segment';
    
    // Create segment indicator
    const segmentIndicator = document.createElement('div');
    segmentIndicator.id = config.segmentIndicatorId;
    segmentIndicator.className = 'segment-indicator';
    segmentIndicator.textContent = 'Segment 1 of 1';
    
    // Append buttons to container
    segmentContainer.appendChild(prevBtn);
    segmentContainer.appendChild(replayBtn);
    segmentContainer.appendChild(nextBtn);
    segmentContainer.appendChild(segmentIndicator);
    
    // Append segment container after the regular controls
    controlsDiv.parentNode.insertBefore(segmentContainer, controlsDiv.nextSibling);
    
    return segmentContainer;
}
