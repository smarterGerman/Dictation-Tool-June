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
    inputField.addEventListener('input', function inputHandler() {
        // Full try-catch wrapper to ensure the handler doesn't break in any environment
        try {
            // Get the current raw input value with defensive coding
            let rawInput = "";
            try {
                rawInput = inputField.value || "";
            } catch (valueError) {
                // If we can't get the value, use an empty string and continue
                console.error("Failed to get input value:", valueError);
            }
            
            // Save cursor position before transformation
            let cursorPosition = rawInput.length; // Default to end of text
            try {
                // This might fail in some iframe contexts
                if (typeof inputField.selectionStart === 'number') {
                    cursorPosition = inputField.selectionStart;
                }
            } catch (cursorError) {
                // Already using default position, log error if console is available
                try {
                    console.log("Cursor position detection failed:", cursorError);
                } catch (e) {/* Silently fail if console logging isn't available */}
            }
            
            // Apply transformation for special characters - ALWAYS do this
            // Use defensive coding pattern to handle potential errors
            let transformedInput = rawInput;
            try {
                transformedInput = transformSpecialCharacters(rawInput);
            } catch (transformError) {
                // If transformation fails, use original input
                try {
                    console.error("Character transformation failed:", transformError);
                } catch (e) {/* Silently fail if console logging isn't available */}
            }
            
            // Update the input field if transformation changed anything
            if (transformedInput !== rawInput) {
                try {
                    // Update the field with transformed text
                    inputField.value = transformedInput;
                    
                    // Safely restore cursor position - using try-catch to avoid potential errors
                    try {
                        if (typeof inputField.setSelectionRange === 'function') {
                            const newPosition = calculateNewCursorPosition(rawInput, transformedInput, cursorPosition);
                            inputField.setSelectionRange(newPosition, newPosition);
                        }
                    } catch (selectionError) {
                        // If setting selection range fails, we'll just continue without it
                        try {
                            console.log("Cursor position restoration not supported in this environment");
                        } catch (e) {/* Silently fail if console logging isn't available */}
                    }
                } catch (updateError) {
                    // If updating the field value fails, log the error if possible
                    try {
                        console.error("Failed to update input field with transformed text:", updateError);
                    } catch (e) {/* Silently fail if console logging isn't available */}
                }
            }
            
            // Process current segment with error handling
            try {
                const currentSegment = getCurrentSegment();
                if (currentSegment) {
                    try {
                        // Save the transformed input with error handling
                        saveUserInput(currentSegment.index, transformedInput);
                    } catch (saveError) {
                        try { 
                            console.error("Failed to save user input:", saveError);
                        } catch (e) {/* Silently fail if console logging isn't available */}
                    }
                    
                    try {
                        // Add/remove has-content class based on content
                        if (transformedInput.trim() !== '') {
                            inputField.classList.add('has-content');
                        } else {
                            inputField.classList.remove('has-content');
                        }
                    } catch (classError) {
                        try {
                            console.error("Failed to update input field class:", classError);
                        } catch (e) {/* Silently fail if console logging isn't available */}
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
