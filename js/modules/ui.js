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
        // The setAudioProgress function will handle finding and jumping to the right segment
        setAudioProgress(audio, e, segmentState.cues);
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
        const inputContainer = document.getElementById(config.inputContainerId);
        if (inputContainer) {
            inputContainer.style.display = 'none';
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
    const finishBtn = document.getElementById('finish-exercise-btn');
    
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
             console.log('NEXT button clicked, skipping to next segment');
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

    // Add finish button event listener
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            // Hide any visible input field when finishing
            const inputContainer = document.getElementById(config.inputContainerId);
            if (inputContainer) {
                inputContainer.style.display = 'none';
            }
            
            // Dispatch finish exercise event
            document.dispatchEvent(new Event('finishExercise'));
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
    
    // Create finish button
    const finishBtn = document.createElement('button');
    finishBtn.id = 'finish-exercise-btn';
    finishBtn.className = 'control-btn finish-btn';
    finishBtn.textContent = '✓ Finish';
    finishBtn.title = 'Finish exercise and view results';
    
    // Create segment indicator
    const segmentIndicator = document.createElement('div');
    segmentIndicator.id = config.segmentIndicatorId;
    segmentIndicator.className = 'segment-indicator';
    segmentIndicator.textContent = 'Segment 1 of 1';
    
    // Append buttons to container
    segmentContainer.appendChild(prevBtn);
    segmentContainer.appendChild(replayBtn);
    segmentContainer.appendChild(nextBtn);
    segmentContainer.appendChild(finishBtn);
    segmentContainer.appendChild(segmentIndicator);
    
    // Append segment container after the regular controls
    controlsDiv.parentNode.insertBefore(segmentContainer, controlsDiv.nextSibling);
    
    return segmentContainer;
}

/**
 * Add an exit button to the player controls
 * Allows users to end the dictation early and see results
 */
export function addExitButton() {
    console.log('Adding exit button to player controls');
    const playerContainer = document.getElementById(config.playerContainerId);
    if (!playerContainer) return;
    
    // Create exit button if it doesn't exist
    let exitBtn = document.getElementById('exit-btn');
    if (!exitBtn) {
        exitBtn = document.createElement('button');
        exitBtn.id = 'exit-btn';
        exitBtn.className = 'control-btn exit-btn';
        exitBtn.innerHTML = '&times;'; // × symbol
        exitBtn.title = 'Exit dictation and see results';
        
        // Add to player container
        playerContainer.appendChild(exitBtn);
        
        // Add click event - dispatch finishExercise event
        exitBtn.addEventListener('click', () => {
            console.log('Exit button clicked, finishing exercise');
            document.dispatchEvent(new Event('finishExercise'));
        });
        
        console.log('Exit button added successfully');
    }
}

// Ensure the next button is always enabled (remove any disabled state)
function updateControlButtons() {
    const nextBtn = document.getElementById('next-segment-btn');
    if (nextBtn) {
        nextBtn.disabled = false; // Always enable the next button
    }
}
