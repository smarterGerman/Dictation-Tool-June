/**
 * Input Manager Module
 * Handles user input processing and integration with text comparison
 */

import { saveUserInput, getUserInput } from './userDataStore.js';
import { getCurrentSegment, nextSegment, jumpToSegment } from './segmentManager.js';
import { config } from './config.js';
import { 
    transformSpecialCharacters, 
    processInput,
    processInputWithCharacterTracking, 
    notifySegmentChange 
} from './textComparison/index.js';
import { updateInputDisplay, updatePlaceholders, generatePlaceholdersForReference, createDualInputDisplay, updateRawInputDisplay, updateReferenceMappingDisplay, isCompleteMatch } from './uiManager.js';

// Track input state
let inputField = null;
let highlightContainer = null;
let segmentEnded = false;
let currentInputTimer = null;
let currentPlaceholderContainer = null;
let currentTextComparisonContainer = null;  // Add this line
let dualInputDisplays = null;
// Flag to prevent multiple rapid submissions
let isProcessingSubmission = false;

/**
 * Check if the current segment is the last segment
 * @returns {boolean} - True if current segment is the last one
 */
function isLastSegment() {
    const segment = getCurrentSegment();
    return segment ? segment.isLast : false;
}

/**
 * Initialize the input manager
 */
export function initInputManager() {
    // Find the input field and highlight container
    inputField = document.getElementById(config.inputFieldId);
    highlightContainer = document.getElementById(config.highlightContainerId);
    
    if (inputField) {
        // Use a debounced approach to input handling for better performance
        inputField.addEventListener('input', debounce(handleInputEvent, 50));
        
        // Listen for key presses to handle special controls
        inputField.addEventListener('keydown', handleKeyDown);
        
        // Add event listener for Enter key to submit input
        inputField.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitUserInput();
            }
        });
    } else {
        console.error('Input field element not found!');
    }
    
    // Add event listeners for segment events
    document.addEventListener('segmentEnded', handleSegmentEnded);
    document.addEventListener('segmentStarted', handleSegmentStarted);
    
    // Initialize input field with event handlers
    setupInputField();
    
    // Return public interface
    return {
        clearCurrentInput,
        hideInputField  // This references the function that needs to be implemented
    };
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in ms
 * @return {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Handle user input events with debouncing
 * @param {Event} event - Input event
 */
function handleInputEvent(event) {
    // Track performance
    const startTime = performance.now();
    
    const userInput = inputField.value || '';
    const segment = getCurrentSegment();
    
    if (!segment) return;
    
    const referenceText = segment.text;
    
    // Save user input for this segment
    saveUserInput(segment.index, userInput);
    
    // Update input field appearance
    if (userInput.trim()) {
        inputField.classList.add('has-content');
    } else {
        inputField.classList.remove('has-content');
    }

    // Immediate update to raw input display
    if (dualInputDisplays && dualInputDisplays.rawInputDisplay) {
        updateRawInputDisplay(dualInputDisplays.rawInputDisplay, userInput);
    }

    // Debounced update to reference mapping display
    if (dualInputDisplays && dualInputDisplays.referenceMapRow) {
        clearTimeout(currentInputTimer);
        currentInputTimer = setTimeout(() => {
            const result = processInputWithCharacterTracking(referenceText, userInput);
            updateReferenceMappingDisplay(dualInputDisplays.referenceMapRow, result, referenceText);
            // Also update placeholders for legacy UI if needed
            if (currentPlaceholderContainer) {
                updatePlaceholders(result, currentPlaceholderContainer);
            }
            // Log performance metrics
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            if (processingTime > 20) {
               // console.debug(`Character-by-character processing time: ${processingTime.toFixed(2)}ms`);
            }
        }, 50);
    }

    // If segment has ended and input matches well enough, auto-advance
    const shouldAutoAdvance = config.autoAdvanceOnMatch && segmentEnded;
    const currentSegment = getCurrentSegment();
    const isLastSegment = currentSegment && currentSegment.isLast;

    if (shouldAutoAdvance && !isLastSegment) {
        const result = updateHighlighting(userInput, referenceText);
        
        // Auto-advance if accuracy is good enough and there's been sufficient input
        if (result && 
            result.isMatch && 
            userInput.length > (referenceText.length * 0.5)) {
            
            clearTimeout(currentInputTimer);
            currentInputTimer = setTimeout(() => {
                const audio = document.getElementById(config.audioPlayerId);
                nextSegment(audio);
            }, config.autoAdvanceDelay);
        }
    }
    
    // Log performance metrics
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    if (processingTime > 20) {
        console.debug(`Character-by-character processing time: ${processingTime.toFixed(2)}ms`);
    }
}

/**
 * Handle key down events
 * @param {KeyboardEvent} event - Key event
 */
function handleKeyDown(event) {
    // Tab to advance segments
    if (event.key === 'Tab') {
        event.preventDefault();
        
        if (event.shiftKey) {
            // Previous segment - Update function call
            const audio = document.getElementById(config.audioPlayerId);
            const currentSegment = getCurrentSegment();
            if (currentSegment) {
                // Use jumpToSegment instead of playSegment
                jumpToSegment(audio, currentSegment.index);
            }
        } else {
            // Next segment
            if (!isLastSegment()) {
                // Get the audio element
                const audio = document.getElementById(config.audioPlayerId);
                nextSegment(audio);
            }
        }
    }
}

/**
 * Update the highlighted text based on comparison results
 * Using advanced word matching algorithm for better accuracy
 * @param {string} userInput - Current user input
 * @param {string} referenceText - Reference text to compare against (optional)
 * @param {HTMLElement} container - Container element to update (optional)
 * @returns {Object} - Comparison result
 */
function updateHighlighting(userInput, referenceText, container) {
    try {
        // If referenceText is not provided, get it from the current segment
        if (!referenceText) {
            const segment = getCurrentSegment();
            referenceText = segment ? segment.text : '';
        }
        
        if (!container) {
            container = document.getElementById(config.highlightContainerId);
        }
        
        if (!container) return null;
        
        // Apply transformations to ensure consistency
        const transformedInput = transformSpecialCharacters(userInput);
        
        try {
            // Process input with character-level tracking for better display
            const result = processInputWithCharacterTracking(referenceText, transformedInput);
            
            // Add the raw input text for display purposes
            result.inputText = transformedInput;
            
            // Update placeholders based on comparison results
            if (currentPlaceholderContainer) {
                updatePlaceholders(result, currentPlaceholderContainer);
            }
            
            return result;
        } catch (error) {
            console.error("Error processing input:", error);
            return { isMatch: false };
        }
    } catch (error) {
        console.error("Error in updateHighlighting:", error);
        return { isMatch: false };
    }
}

/**
 * Handle segment ended event
 * @param {Object} event - Segment end event
 */
export function handleSegmentEnded(event) {
    try {
        segmentEnded = true;
        
        // Notify the text comparison system about segment change
        notifySegmentChange();
        
        if (inputField) {
            inputField.focus();
        }
        
        // Re-run highlighting to check for auto-advance
        if (inputField && inputField.value) {
            handleInputEvent({ target: inputField });
        }
    } catch (error) {
        console.error("Error in handleSegmentEnded:", error);
    }
}

/**
 * Handle segment started event
 * @param {Object} event - Segment start event
 */
export function handleSegmentStarted(event) {
    try {
        segmentEnded = false;
        clearTimeout(currentInputTimer);
        
        // Make sure the input container is visible
        const inputContainer = document.getElementById(config.inputContainerId);
        if (inputContainer) {
            inputContainer.style.display = 'block';
        }
        
        // Set up the segment UI
        setupSegmentUI(event.detail.index);
        
        // Restore any previously entered input for this segment
        const segment = getCurrentSegment();
        if (segment) {
            const savedInput = getUserInput(segment.index);
            if (inputField) {
                inputField.value = savedInput || '';
                inputField.focus();
            }
        }
    } catch (error) {
        console.error("Error in handleSegmentStarted:", error);
    }
}

/**
 * Setup the UI for a new segment
 * @param {number} segmentIndex - Index of the segment
 */
function setupSegmentUI(segmentIndex) {
    const segment = getCurrentSegment();
    const referenceText = segment.text;
    const highlightContainer = document.getElementById(config.highlightContainerId);
    
    // Clear previous content
    highlightContainer.innerHTML = '';
    
    // Generate dual input display (raw + reference mapping)
    dualInputDisplays = createDualInputDisplay(highlightContainer);
    
    // Make the highlight container clickable to focus input
    highlightContainer.addEventListener('click', () => {
        if (inputField) {
            inputField.focus();
        }
    });
    
    // Focus the input field immediately
    if (inputField) {
        inputField.focus();
    }
}

/**
 * Hide the input field (called when navigating between segments)
 */
function hideInputField() {
    if (inputField) {
        const inputContainer = document.getElementById(config.inputContainerId);
        if (inputContainer) {
            inputContainer.style.display = 'none';
        }
    }
}

// Make sure the function is properly exported as part of the public interface
export function clearCurrentInput() {
    if (inputField) {
        inputField.value = '';
        handleInputEvent({ target: inputField });
    }
}

/**
 * Submit user input and advance to next segment
 */
function submitUserInput() {
    if (!inputField || isProcessingSubmission) return;
    
    // Prevent multiple rapid submissions
    isProcessingSubmission = true;
    
    try {
        const userInput = inputField.value.trim();
        const currentSegment = getCurrentSegment();
        
        if (!currentSegment) {
            isProcessingSubmission = false;
            return;
        }
        
        // Process the input and compare with reference text
        const result = processInput(currentSegment.text, userInput);
        const isCorrect = isCompleteMatch(result);
        
        // Save user input
        saveUserInput(currentSegment.index, userInput);
        
        // Clear the input field
        inputField.value = '';
        
        // Clear any displayed highlights
        updateHighlighting('', currentSegment.text);
        
        // IMPORTANT: Only dispatch the event and let the listener in main.js handle navigation
        // Do NOT click the next button here (removing that code)
        document.dispatchEvent(new CustomEvent('inputSubmitted', {
            detail: {
                index: currentSegment.index,
                text: userInput,
                isCorrect: isCorrect
            }
        }));
        
        // Reset processing flag after a delay
        setTimeout(() => {
            isProcessingSubmission = false;
        }, 500);
        
    } catch (error) {
        console.error('Error submitting input:', error);
        isProcessingSubmission = false;
    }
}

/**
 * Initialize input field with event handlers
 * @param {Object} options - Configuration options
 */
function setupInputField(options = {}) {
    // Setup already exists in the initInputManager function
    // This is just ensuring we don't call an undefined function
    
    // Get input elements
    const submitBtn = document.getElementById(config.submitBtnId);
    
    // Add submit button click handler if it exists
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            submitUserInput();
        });
    }
    
    // Initial focus
    if (inputField) {
        setTimeout(() => {
            inputField.focus();
        }, 100);
    }
}
/**
 * Handle user input events
 * @param {Event} event - Input event
 */
function handleUserInput(event) {
  const userInput = inputField.value;
  const result = processInput(userInput, referenceText); // CORRECT ORDER!
  
  // Update UI with results
  updateDisplay(result);
}