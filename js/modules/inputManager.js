/**
 * Module for managing user input fields and focus
 */
import { config } from './config.js';
import { getCurrentSegment, getAllSegments } from './segmentManager.js';
import { saveUserInput, getUserInput } from './userDataStore.js';
import { compareTexts, generateHighlightedHTML, transformSpecialCharacters } from './textComparison.js';

// Add protection against multiple rapid Enter key presses
let isProcessingEnter = false;

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
        try {
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
            if (playerContainer) {
                playerContainer.appendChild(inputContainer);
                
                // Add event listeners
                setupInputEventListeners();
            }
        } catch (error) {
            try {
                console.error("Error creating input elements:", error);
            } catch (e) { /* Silence console errors */ }
        }
    }
}

/**
 * Set up event listeners for the input field and submit button
 */
function setupInputEventListeners() {
    try {
        const inputField = document.getElementById(config.inputFieldId);
        const submitButton = document.getElementById(config.submitBtnId);
        const highlightContainer = document.getElementById('highlight-container');
        
        if (inputField && submitButton) {
            // Submit button click
            try {
                submitButton.addEventListener('click', handleSubmit);
            } catch (e) {
                try { console.error("Error setting up submit button listener:", e); } catch (e) { /* Silence console errors */ }
            }
            
            // Enter key in textarea (with shift+enter for new line)
            try {
                inputField.addEventListener('keydown', (e) => {
                    try {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            
                            // Stop accidental double-triggering
                            if (isProcessingEnter) {
                                console.log('Already processing an Enter keypress, ignoring');
                                return;
                            }
                            
                            isProcessingEnter = true;
                            handleSubmit();
                            
                            // Reset the flag after a delay
                            setTimeout(() => {
                                isProcessingEnter = false;
                            }, 800); // Prevent multiple Enter presses within 0.8 seconds
                        }
                    } catch (keyError) {
                        try { console.error("Error handling keydown:", keyError); } catch (e) { /* Silence console errors */ }
                        isProcessingEnter = false; // Reset flag on error
                    }
                });
            } catch (e) {
                try { console.error("Error setting up keydown listener:", e); } catch (e) { /* Silence console errors */ }
            }
            
            // Input changes (real-time saving, transformation, and comparison)
            try {
                inputField.addEventListener('input', () => {
                    handleInputEvent(inputField, highlightContainer);
                });
            } catch (e) {
                try { console.error("Error setting up input listener:", e); } catch (e) { /* Silence console errors */ }
            }
        }
    } catch (error) {
        try { console.error("Error in setupInputEventListeners:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Handle the input event with robust error handling
 * @param {HTMLInputElement} inputField - The input field element 
 * @param {HTMLElement} highlightContainer - The container for highlighted text
 */
function handleInputEvent(inputField, highlightContainer) {
    try {
        // Default values in case of errors
        let rawInput = "";
        let transformedInput = "";
        let cursorPosition = 0;
        
        // Step 1: Get the current raw input value
        try {
            if (inputField && typeof inputField.value === 'string') {
                rawInput = inputField.value;
            }
        } catch (valueError) { 
            try { console.warn("Could not get input value:", valueError); } catch (e) { /* Silence console errors */ }
        }
        
        // Step 2: Save cursor position before transformation
        try {
            if (inputField && typeof inputField.selectionStart === 'number') {
                cursorPosition = inputField.selectionStart;
            } else {
                cursorPosition = rawInput.length; // Default to end of text
            }
        } catch (cursorError) {
            cursorPosition = rawInput.length; // Default to end of text
            try { console.warn("Could not get cursor position:", cursorError); } catch (e) { /* Silence console errors */ }
        }
        
        // Step 3: Apply transformation for special characters
        try {
            transformedInput = transformSpecialCharacters(rawInput);
        } catch (transformError) {
            transformedInput = rawInput; // Fall back to raw input
            try { console.error("Character transformation failed:", transformError); } catch (e) { /* Silence console errors */ }
        }
        
        // Step 4: Update the input field if transformation changed anything
        if (transformedInput !== rawInput) {
            try {
                inputField.value = transformedInput;
                
                // Step 5: Restore cursor position
                try {
                    if (typeof inputField.setSelectionRange === 'function') {
                        const newPosition = calculateNewCursorPosition(rawInput, transformedInput, cursorPosition);
                        inputField.setSelectionRange(newPosition, newPosition);
                    }
                } catch (selectionError) {
                    try { console.warn("Could not restore cursor position:", selectionError); } catch (e) { /* Silence console errors */ }
                }
            } catch (updateError) {
                try { console.error("Could not update input with transformed text:", updateError); } catch (e) { /* Silence console errors */ }
            }
        }
        
        // Step 6: Process current segment
        try {
            const currentSegment = getCurrentSegment();
            if (currentSegment) {
                // Step 7: Save the transformed input
                try {
                    saveUserInput(currentSegment.index, transformedInput);
                } catch (saveError) {
                    try { console.error("Failed to save user input:", saveError); } catch (e) { /* Silence console errors */ }
                }
                
                // Step 8: Update visual state based on content
                try {
                    if (transformedInput.trim() !== '') {
                        inputField.classList.add('has-content');
                    } else {
                        inputField.classList.remove('has-content');
                    }
                } catch (classError) {
                    try { console.warn("Failed to update input field class:", classError); } catch (e) { /* Silence console errors */ }
                }
                
                // Step 9: Update real-time highlighting
                try {
                    if (highlightContainer) {
                        updateHighlighting(transformedInput, currentSegment.cue.text, highlightContainer);
                    }
                } catch (highlightError) {
                    try { console.error("Failed to update highlighting:", highlightError); } catch (e) { /* Silence console errors */ }
                }
                
                // Step 10: Check for auto-advance on match
                try {
                    const comparison = compareTexts(transformedInput, currentSegment.cue.text);
                    if (comparison.isMatch) {
                        // Wait a short moment before auto-advancing
                        setTimeout(() => {
                            try {
                                // Only auto-advance if still matched
                                const currentInput = inputField.value || "";
                                const newComparison = compareTexts(currentInput, currentSegment.cue.text);
                                if (newComparison.isMatch) {
                                    handleSubmit();
                                }
                            } catch (autoAdvanceError) {
                                try { console.error("Error in auto-advance:", autoAdvanceError); } catch (e) { /* Silence console errors */ }
                            }
                        }, 1000); // 1 second delay
                    }
                } catch (comparisonError) {
                    try { console.error("Failed to compare texts:", comparisonError); } catch (e) { /* Silence console errors */ }
                }
            }
        } catch (segmentError) {
            try { console.error("Failed to process current segment:", segmentError); } catch (e) { /* Silence console errors */ }
        }
    } catch (error) {
        try { console.error("Critical error in handleInputEvent:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Handle the end of a segment playback
 * @param {CustomEvent} e - Custom event with segment details
 */
function handleSegmentEnded(e) {
    try {
        const { index, cue, isLastSegment } = e.detail;
        
        console.log(`Segment ${index + 1} ended, isLastSegment: ${isLastSegment}`);
        
        // If this is the last segment, check if we should show results instead
        if (isLastSegment) {
            console.log('Last segment ended, input manager will not show input field');
            return;
        }
        
        // Show the input field for non-last segments
        showInputField();
        
        // Load any existing input for this segment
        try {
            loadExistingInput(index);
        } catch (loadError) {
            try { console.error("Failed to load existing input:", loadError); } catch (e) { /* Silence console errors */ }
        }
        
        // Set focus to the input field
        setFocus();
    } catch (error) {
        try { console.error("Error in handleSegmentEnded:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Load existing input for a segment if available
 * @param {number} segmentIndex - The index of the segment
 */
function loadExistingInput(segmentIndex) {
    try {
        const inputField = document.getElementById(config.inputFieldId);
        if (inputField) {
            const savedInput = getUserInput(segmentIndex);
            
            if (savedInput) {
                inputField.value = savedInput;
                inputField.classList.add('has-content');
            } else {
                inputField.value = '';
                inputField.classList.remove('has-content');
            }
        }
    } catch (error) {
        try { console.error("Error in loadExistingInput:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Update the highlighted text based on comparison results
 * @param {string} userInput - Current user input
 * @param {string} referenceText - Reference text to compare against
 * @param {HTMLElement} container - Container element to update
 */
function updateHighlighting(userInput, referenceText, container) {
    try {
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
    } catch (error) {
        try { console.error("Error in updateHighlighting:", error); } catch (e) { /* Silence console errors */ }
        return { isMatch: false, errorPositions: [] };
    }
}

/**
 * Handle the submit action
 */
function handleSubmit() {
    try {
        const currentSegment = getCurrentSegment();
        const inputField = document.getElementById(config.inputFieldId);
        
        if (currentSegment && inputField) {
            console.log(`Handling submit for segment ${currentSegment.index + 1}, isLast: ${currentSegment.isLast}`);
            
            // Always apply transformations before submitting
            const rawInput = inputField.value || "";
            let transformedInput = rawInput;
            
            try {
                transformedInput = transformSpecialCharacters(rawInput);
                
                // Update the field with the fully transformed text
                if (transformedInput !== rawInput) {
                    inputField.value = transformedInput;
                }
            } catch (transformError) {
                try { console.error("Error transforming input on submit:", transformError); } catch (e) { /* Silence console errors */ }
            }
            
            try {
                // Save the transformed input
                saveUserInput(currentSegment.index, transformedInput);
            } catch (saveError) {
                try { console.error("Error saving user input on submit:", saveError); } catch (e) { /* Silence console errors */ }
            }
            
            try {
                // Compare texts for accuracy and determine if correct
                const comparison = compareTexts(transformedInput, currentSegment.cue.text);
                
                // Include comparison results in the event and flag if this is the last segment
                const submitEvent = new CustomEvent('inputSubmitted', {
                    detail: { 
                        index: currentSegment.index,
                        text: transformedInput,
                        rawText: rawInput,
                        transformedText: comparison.transformedInput,
                        isCorrect: comparison.isMatch,
                        errorPositions: comparison.errorPositions,
                        referenceText: currentSegment.cue.text,
                        isLastSegment: currentSegment.isLast
                    }
                });
                
                document.dispatchEvent(submitEvent);
                
                // If this is the last segment, also trigger the showResults event directly
                if (currentSegment.isLast) {
                    console.log('Last segment submitted, dispatching showResults event');
                    setTimeout(() => {
                        document.dispatchEvent(new CustomEvent('showResults'));
                    }, 500);
                }
            } catch (comparisonError) {
                try { console.error("Error comparing texts on submit:", comparisonError); } catch (e) { /* Silence console errors */ }
            }
            
            // Hide input field after submission
            hideInputField();
        }
    } catch (error) {
        try { console.error("Error in handleSubmit:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Show the input field
 */
export function showInputField() {
    try {
        const inputContainer = document.getElementById(config.inputContainerId);
        if (inputContainer) {
            inputContainer.style.display = 'block';
        }
    } catch (error) {
        try { console.error("Error showing input field:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Hide the input field
 */
export function hideInputField() {
    try {
        const inputContainer = document.getElementById(config.inputContainerId);
        if (inputContainer) {
            inputContainer.style.display = 'none';
        }
    } catch (error) {
        try { console.error("Error hiding input field:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Set focus to the input field
 */
export function setFocus() {
    try {
        const inputField = document.getElementById(config.inputFieldId);
        if (inputField) {
            setTimeout(() => {
                try {
                    inputField.focus();
                } catch (focusError) {
                    try { console.warn("Could not focus input field:", focusError); } catch (e) { /* Silence console errors */ }
                }
            }, config.autoFocusDelay); // Small delay to ensure DOM is ready
        }
    } catch (error) {
        try { console.error("Error in setFocus:", error); } catch (e) { /* Silence console errors */ }
    }
}

/**
 * Get the current value in the input field
 * @returns {string} - The current input value
 */
export function getCurrentInputValue() {
    try {
        const inputField = document.getElementById(config.inputFieldId);
        return inputField ? inputField.value : '';
    } catch (error) {
        try { console.error("Error getting input value:", error); } catch (e) { /* Silence console errors */ }
        return '';
    }
}

/**
 * Clear the input field
 */
export function clearInput() {
    try {
        const inputField = document.getElementById(config.inputFieldId);
        if (inputField) {
            inputField.value = '';
            inputField.classList.remove('has-content');
        }
    } catch (error) {
        try { console.error("Error clearing input:", error); } catch (e) { /* Silence console errors */ }
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
    try {
        // Simple approach: if text before cursor has been transformed, adjust cursor accordingly
        const beforeCursor = oldText.substring(0, oldPosition);
        const transformedBeforeCursor = transformSpecialCharacters(beforeCursor);
        
        // New position is the length of the transformed text up to the cursor
        return transformedBeforeCursor.length;
    } catch (error) {
        try { console.error("Error calculating cursor position:", error); } catch (e) { /* Silence console errors */ }
        return newText.length; // Fall back to end of text
    }
}

/**
 * Test special character transformations
 * This function can be called from the console to verify transformations
 */
window.testTransformations = function() {
    try {
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
            try {
                const result = transformSpecialCharacters(test);
                console.log(`${test} → ${result}`);
            } catch (testError) {
                console.error(`Test failed for "${test}":`, testError);
            }
        });
        console.log('=================================');
    } catch (error) {
        console.error("Error in test transformations:", error);
    }
};
