/**
 * State Manager Module
 * Provides centralized state management for the dictation tool
 */
import { createLogger } from './logger.js';

const logger = createLogger('stateManager');

// Default state structure
const DEFAULT_STATE = {
  comparison: {
    input: '',
    reference: '',
    result: null,
    alignments: {},
    lastUpdateTime: null
  },
  ui: {
    currentView: 'input',
    isProcessing: false,
    highlightMode: 'standard',
    errorState: null
  },
  audio: {
    isPlaying: false,
    currentSegment: null,
    volume: 1.0,
    playbackRate: 1.0
  },
  session: {
    startTime: null,
    attemptCount: 0,
    correctWordCount: 0,
    misspelledWordCount: 0,
    segmentsCompleted: []
  }
};

// Current state
let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Listeners for state changes
const listeners = {
  comparison: [],
  ui: [],
  audio: [],
  session: [],
  all: []
};

/**
 * Get the current state
 * @param {string} [section] - Optional section of state to retrieve
 * @returns {Object} The requested state section or full state
 */
function getState(section) {
  if (section && state[section]) {
    return JSON.parse(JSON.stringify(state[section]));
  }
  return JSON.parse(JSON.stringify(state));
}

/**
 * Update state by merging changes
 * @param {string} section - Section of state to update
 * @param {Object} changes - Changes to merge into that section
 * @returns {boolean} Success flag
 */
function updateState(section, changes) {
  if (!section || !changes || !state[section]) {
    logger.error('Invalid state update', { section, changes });
    return false;
  }

  try {
    // Create new state object with changes
    const newSectionState = {
      ...state[section],
      ...changes
    };

    // Update state
    state = {
      ...state,
      [section]: newSectionState
    };

    // Call listeners
    notifyListeners(section);
    return true;
  } catch (error) {
    logger.error('Error updating state', { error, section, changes });
    return false;
  }
}

/**
 * Reset state to defaults
 * @param {string} [section] - Optional section to reset, or all if omitted
 */
function resetState(section) {
  if (section && state[section]) {
    state[section] = JSON.parse(JSON.stringify(DEFAULT_STATE[section]));
    notifyListeners(section);
  } else {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    Object.keys(listeners).forEach(key => notifyListeners(key));
  }
  logger.info('State reset', { section: section || 'all' });
}

/**
 * Subscribe to state changes
 * @param {string} section - Section to subscribe to, or 'all' for any change
 * @param {Function} callback - Function to call on state change
 * @returns {Function} Unsubscribe function
 */
function subscribe(section, callback) {
  if (typeof callback !== 'function') {
    logger.error('Invalid subscriber callback', { section });
    return () => {};
  }

  if (!listeners[section]) {
    logger.error('Invalid state section for subscription', { section });
    return () => {};
  }

  // Add listener
  listeners[section].push(callback);

  // Return unsubscribe function
  return () => {
    const index = listeners[section].indexOf(callback);
    if (index !== -1) {
      listeners[section].splice(index, 1);
    }
  };
}

/**
 * Notify all relevant listeners of state changes
 * @param {string} section - Section that changed
 */
function notifyListeners(section) {
  // Get the current version of the state section
  const currentState = getState(section);

  // Notify section-specific listeners
  if (listeners[section]) {
    listeners[section].forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        logger.error('Error in state listener', { error, section });
      }
    });
  }

  // Notify global listeners
  listeners.all.forEach(listener => {
    try {
      listener(getState());
    } catch (error) {
      logger.error('Error in global state listener', { error });
    }
  });
}

// Public API
export default {
  getState,
  updateState,
  resetState,
  subscribe
};
