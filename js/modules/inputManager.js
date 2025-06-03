/**
 * Module for managing user input fields and focus
 */
import { config } from './config.js';
import { getCurrentSegment } from './segmentManager.js';
import { saveUserInput, getUserInput } from './userDataStore.js';

/**
 * Initialize the input manager
 */
export function initInputManager() {
    // Make sure the input container exists
    createInputElements();
    
    // Listen for segment ended events
    document.addEventListener('segmentEnded', handleSegmentEnded);
    
    // Return input manager public methods
    return {
        showInputField,
        hideInputField,
        setFocus,
        getCurrentInputValue,
        clearInput
    };
}

/**
 * Create the input field elements if they don't exist
 */
function createInputElements() {
    // Check if input container already exists
    let inputContainer = document.getElementById(config.inputContainerId);
    
    // If it doesn't exist, create it
    if (!inputContainer) {
        inputContainer = document.createElement('div');
        inputContainer.id = config.inputContainerId;
        inputContainer.className = 'input-container';
        
        // Create the input field
        const inputField = document.createElement('textarea');
        inputField.id = config.inputFieldId;
        inputField.className = 'transcription-input';
        inputField.placeholder = 'Type what you heard...';
        inputField.setAttribute('autocomplete', 'off');
        inputField.setAttribute('autocorrect', 'off');
        inputField.setAttribute('spellcheck', 'false');
        
        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.id = config.submitBtnId;
        submitButton.className = 'control-btn submit-btn';
        submitButton.textContent = 'Submit';
        
        // Add elements to container
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(submitButton);
        
        // Add container to the player
        const playerContainer = document.getElementById(config.playerContainerId);
        playerContainer.appendChild(inputContainer);
        
        // Add event listeners
        setupInputEventListeners();
    }
}

/**
 * Set up event listeners for the input field and submit button
 */
function setupInputEventListeners() {
    const inputField = document.getElementById(config.inputFieldId);
    const submitButton = document.getElementById(config.submitBtnId);
    
    // Submit button click
    submitButton.addEventListener('click', handleSubmit);
    
    // Enter key in textarea (with shift+enter for new line)
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });
    
    // Input changes (real-time saving)
    inputField.addEventListener('input', () => {
        const currentSegment = getCurrentSegment();
        if (currentSegment) {
            saveUserInput(currentSegment.index, inputField.value);
            
            // Add/remove has-content class based on content
            if (inputField.value.trim() !== '') {
                inputField.classList.add('has-content');
            } else {
                inputField.classList.remove('has-content');
            }
        }
    });
}

/**
 * Handle the end of a segment playback
 * @param {CustomEvent} e - Custom event with segment details
 */
function handleSegmentEnded(e) {
    const { index, cue } = e.detail;
    
    // Show the input field
    showInputField();
    
    // Load any existing input for this segment
    loadExistingInput(index);
    
    // Set focus to the input field
    setFocus();
}

/**
 * Load existing input for a segment if available
 * @param {number} segmentIndex - The index of the segment
 */
function loadExistingInput(segmentIndex) {
    const inputField = document.getElementById(config.inputFieldId);
    const savedInput = getUserInput(segmentIndex);
    
    if (savedInput) {
        inputField.value = savedInput;
        inputField.classList.add('has-content');
    } else {
        inputField.value = '';
        inputField.classList.remove('has-content');
    }
}

/**
 * Handle the submit action
 */
function handleSubmit() {
    const currentSegment = getCurrentSegment();
    const inputField = document.getElementById(config.inputFieldId);
    
    if (currentSegment) {
        // Save the current input
        saveUserInput(currentSegment.index, inputField.value);
        
        // Dispatch submit event
        const submitEvent = new CustomEvent('inputSubmitted', {
            detail: { 
                index: currentSegment.index,
                text: inputField.value
            }
        });
        document.dispatchEvent(submitEvent);
        
        // Hide input field after submission
        hideInputField();
    }
}

/**
 * Show the input field
 */
export function showInputField() {
    const inputContainer = document.getElementById(config.inputContainerId);
    if (inputContainer) {
        inputContainer.style.display = 'block';
    }
}

/**
 * Hide the input field
 */
export function hideInputField() {
    const inputContainer = document.getElementById(config.inputContainerId);
    if (inputContainer) {
        inputContainer.style.display = 'none';
    }
}

/**
 * Set focus to the input field
 */
export function setFocus() {
    const inputField = document.getElementById(config.inputFieldId);
    if (inputField) {
        setTimeout(() => {
            inputField.focus();
        }, config.autoFocusDelay); // Small delay to ensure DOM is ready
    }
}

/**
 * Get the current value in the input field
 * @returns {string} - The current input value
 */
export function getCurrentInputValue() {
    const inputField = document.getElementById(config.inputFieldId);
    return inputField ? inputField.value : '';
}

/**
 * Clear the input field
 */
export function clearInput() {
    const inputField = document.getElementById(config.inputFieldId);
    if (inputField) {
        inputField.value = '';
        inputField.classList.remove('has-content');
    }
}
