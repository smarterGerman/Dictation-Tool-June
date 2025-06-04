/**
 * Module for managing user input fields and focus
 */
import { config } from './config.js';
import { getCurrentSegment, getAllSegments } from './segmentManager.js';
import { saveUserInput, getUserInput } from './userDataStore.js';
import { compareTexts, generateHighlightedHTML, transformSpecialCharacters } from './textComparison.js';

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
        
        // Create the highlight container for displaying real-time comparison
        const highlightContainer = document.createElement('div');
        highlightContainer.id = 'highlight-container';
        highlightContainer.className = 'highlight-container';
        
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
        inputContainer.appendChild(highlightContainer);
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
    const highlightContainer = document.getElementById('highlight-container');
    
    // Submit button click
    submitButton.addEventListener('click', handleSubmit);
    
    // Enter key in textarea (with shift+enter for new line)
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });
    
    // Input changes (real-time saving, transformation, and comparison)
    inputField.addEventListener('input', () => {
        // Get the current raw input value
        const rawInput = inputField.value;
        
        // Save cursor position before transformation
        const cursorPosition = inputField.selectionStart;
        
        // Apply transformation for special characters - ALWAYS do this
        const transformedInput = transformSpecialCharacters(rawInput);
        
        // Update the input field if transformation changed anything
        if (transformedInput !== rawInput) {
            console.log('Transformed input:', rawInput, '→', transformedInput);
            
            // Update the field with transformed text
            inputField.value = transformedInput;
            
            // Restore cursor position - adjusted for transformation changes
            inputField.setSelectionRange(
                calculateNewCursorPosition(rawInput, transformedInput, cursorPosition),
                calculateNewCursorPosition(rawInput, transformedInput, cursorPosition)
            );
        }
        
        const currentSegment = getCurrentSegment();
        if (currentSegment) {
            // Save the transformed input
            saveUserInput(currentSegment.index, transformedInput);
            
            // Add/remove has-content class based on content
            if (transformedInput.trim() !== '') {
                inputField.classList.add('has-content');
            } else {
                inputField.classList.remove('has-content');
            }
            
            // Real-time comparison and highlighting
            updateHighlighting(transformedInput, currentSegment.cue.text, highlightContainer);
            
            // Check if input matches reference and auto-advance if correct
            const comparison = compareTexts(transformedInput, currentSegment.cue.text);
            if (comparison.isMatch) {
                // Wait a short moment before auto-advancing to next segment
                setTimeout(() => {
                    // Only auto-advance if the match is still true (user hasn't changed input)
                    const currentInput = inputField.value;
                    const newComparison = compareTexts(currentInput, currentSegment.cue.text);
                    if (newComparison.isMatch) {
                        handleSubmit();
                    }
                }, 1000); // Wait 1 second before auto-advancing
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
 * Update the highlighted text based on comparison results
 * @param {string} userInput - Current user input
 * @param {string} referenceText - Reference text to compare against
 * @param {HTMLElement} container - Container element to update
 */
function updateHighlighting(userInput, referenceText, container) {
    if (!container) {
        container = document.getElementById('highlight-container');
    }
    
    if (!container) return;
    
    // Always apply transformations to ensure consistency
    const transformedInput = transformSpecialCharacters(userInput);
    
    // Compare texts and get results
    const comparison = compareTexts(transformedInput, referenceText);
    
    // Generate HTML with highlighted errors
    const highlightedHTML = generateHighlightedHTML(
        comparison.transformedInput || transformedInput, 
        comparison.errorPositions
    );
    
    // Update the container
    container.innerHTML = highlightedHTML;
    
    return comparison;
}

/**
 * Handle the submit action
 */
function handleSubmit() {
    const currentSegment = getCurrentSegment();
    const inputField = document.getElementById(config.inputFieldId);
    
    if (currentSegment) {
        // Always apply transformations before submitting
        const rawInput = inputField.value;
        const transformedInput = transformSpecialCharacters(rawInput);
        
        // Update the field with the fully transformed text
        if (transformedInput !== rawInput) {
            inputField.value = transformedInput;
        }
        
        // Save the transformed input
        saveUserInput(currentSegment.index, transformedInput);
        
        // Compare texts for accuracy and determine if correct
        const comparison = compareTexts(transformedInput, currentSegment.cue.text);
        
        // Include comparison results in the event
        const submitEvent = new CustomEvent('inputSubmitted', {
            detail: { 
                index: currentSegment.index,
                text: transformedInput,
                rawText: rawInput,
                transformedText: comparison.transformedInput,
                isCorrect: comparison.isMatch,
                errorPositions: comparison.errorPositions,
                referenceText: currentSegment.cue.text
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

/**
 * Calculate the new cursor position after text transformation
 * @param {string} oldText - Text before transformation
 * @param {string} newText - Text after transformation
 * @param {number} oldPosition - Original cursor position
 * @returns {number} - New cursor position
 */
function calculateNewCursorPosition(oldText, newText, oldPosition) {
    // Simple approach: if text before cursor has been transformed, adjust cursor accordingly
    const beforeCursor = oldText.substring(0, oldPosition);
    const transformedBeforeCursor = transformSpecialCharacters(beforeCursor);
    
    // New position is the length of the transformed text up to the cursor
    return transformedBeforeCursor.length;
}

/**
 * Test special character transformations
 * This function can be called from the console to verify transformations
 */
window.testTransformations = function() {
    const testCases = [
        'ba:rlin',
        'shoener',
        'scho:n',
        'scho/n',
        'straBe',
        'strass',
        'strase'
    ];
    
    console.log('===== TESTING TRANSFORMATIONS =====');
    testCases.forEach(test => {
        const result = transformSpecialCharacters(test);
        console.log(`${test} → ${result}`);
    });
    console.log('=================================');
};
