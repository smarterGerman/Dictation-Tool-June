/**
 * Module for storing and managing user input data
 */

// Storage for user inputs (indexed by segment)
const userInputStore = {
    inputs: [], // Array of strings, one per segment
    metadata: {
        lastUpdated: null,
        totalSegments: 0
    }
};

/**
 * Initialize the user data store with the specified number of segments
 * @param {number} totalSegments - The total number of segments
 */
export function initUserDataStore(totalSegments) {
    userInputStore.inputs = new Array(totalSegments).fill('');
    userInputStore.metadata.totalSegments = totalSegments;
    userInputStore.metadata.lastUpdated = Date.now();
    
    return userInputStore;
}

/**
 * Save user input for a specific segment
 * @param {number} segmentIndex - The index of the segment
 * @param {string} text - The user input text
 * @returns {boolean} - True if saved successfully
 */
export function saveUserInput(segmentIndex, text) {
    if (segmentIndex >= 0 && segmentIndex < userInputStore.inputs.length) {
        userInputStore.inputs[segmentIndex] = text;
        userInputStore.metadata.lastUpdated = Date.now();
        return true;
    }
    return false;
}

/**
 * Get user input for a specific segment
 * @param {number} segmentIndex - The index of the segment
 * @returns {string} - The user input text or empty string if not found
 */
export function getUserInput(segmentIndex) {
    if (segmentIndex >= 0 && segmentIndex < userInputStore.inputs.length) {
        return userInputStore.inputs[segmentIndex];
    }
    return '';
}

/**
 * Get all user inputs
 * @returns {Array<string>} - Array of all user inputs
 */
export function getAllUserInputs() {
    return [...userInputStore.inputs];
}

/**
 * Check if all segments have input
 * @returns {boolean} - True if all segments have input
 */
export function isInputComplete() {
    return userInputStore.inputs.every(input => input.trim() !== '');
}

/**
 * Get completion percentage (segments with input / total segments)
 * @returns {number} - Percentage of completion (0-100)
 */
export function getCompletionPercentage() {
    const filledSegments = userInputStore.inputs.filter(input => input.trim() !== '').length;
    return Math.round((filledSegments / userInputStore.metadata.totalSegments) * 100);
}

/**
 * Clear all user inputs
 */
export function clearAllInputs() {
    userInputStore.inputs = new Array(userInputStore.metadata.totalSegments).fill('');
    userInputStore.metadata.lastUpdated = Date.now();
}

/**
 * Save user data to local storage (optional for persistence between sessions)
 * @param {string} storageKey - Key to use for localStorage
 */
export function saveToLocalStorage(storageKey = 'dictationUserData') {
    try {
        const dataToSave = {
            inputs: userInputStore.inputs,
            metadata: {
                ...userInputStore.metadata,
                savedAt: Date.now()
            }
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

/**
 * Load user data from local storage (optional for persistence between sessions)
 * @param {string} storageKey - Key to use for localStorage
 * @returns {boolean} - True if loaded successfully
 */
export function loadFromLocalStorage(storageKey = 'dictationUserData') {
    try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            userInputStore.inputs = parsedData.inputs;
            userInputStore.metadata = {
                ...parsedData.metadata,
                loadedAt: Date.now()
            };
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return false;
    }
}
