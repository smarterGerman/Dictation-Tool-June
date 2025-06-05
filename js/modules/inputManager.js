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
    notifySegmentChange 
} from './textComparison/index.js';
import { updateInputDisplay, updatePlaceholders, generatePlaceholdersForReference } from './uiManager.js';

// Track input state
let inputField = null;
let highlightContainer = null;
let segmentEnded = false;
let currentInputTimer = null;
let currentPlaceholderContainer = null;
let currentTextComparisonContainer = null;  // Add this line

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
    } else {
        console.error('Input field element not found!');
    }
    
    // Add event listeners for segment events
    document.addEventListener('segmentEnded', handleSegmentEnded);
    document.addEventListener('segmentStarted', handleSegmentStarted);
    
    // Return public interface
    return {
        clearCurrentInput
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
    
    // Update highlighting based on comparison
    updateHighlighting(userInput, referenceText, highlightContainer);
    
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
            // Process input with advanced algorithm
            const result = processInput(referenceText, transformedInput);
            
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
        
        // Load any existing input for this segment
        const segmentIndex = event.segmentIndex || 0;
        loadExistingInput(segmentIndex);
        
        // Give focus to input field
        if (inputField) {
            inputField.focus();
        }
        
        // Setup UI for the new segment
        setupSegmentUI(segmentIndex);
    } catch (error) {
        console.error("Error in handleSegmentStarted:", error);
    }
}

/**
 * Load existing user input for a segment
 * @param {number} segmentIndex - Index of the segment
 */
function loadExistingInput(segmentIndex) {
    try {
        if (inputField) {
            const savedInput = getUserInput(segmentIndex);
            
            if (savedInput) {
                inputField.value = savedInput;
                inputField.classList.add('has-content');
                
                // Update highlighting with saved input
                const segment = getCurrentSegment();
                if (segment) {
                    updateHighlighting(savedInput, segment.text, highlightContainer);
                }
            } else {
                inputField.value = '';
                inputField.classList.remove('has-content');
            }
        }
    } catch (error) {
        console.error("Error in loadExistingInput:", error);
    }
}

/**
 * Clear input for current segment
 */
export function clearCurrentInput() {
    if (inputField) {
        inputField.value = '';
        inputField.classList.remove('has-content');
        
        // Clear the highlighting
        const segment = getCurrentSegment();
        if (segment && highlightContainer) {
            updateHighlighting('', segment.text, highlightContainer);
        }
        
        // Save the cleared state
        const currentIndex = segment ? segment.index : 0;
        saveUserInput(currentIndex, '');
        
        // Focus back on input field
        inputField.focus();
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
    
    // Generate placeholder container
    const placeholderContainer = generatePlaceholdersForReference(referenceText);
    highlightContainer.appendChild(placeholderContainer);
    
    // Store reference for later updates
    currentPlaceholderContainer = placeholderContainer;
    
    // Make the placeholder container clickable to focus input
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
