/**
 * Module for creating and managing the results screen
 */
import { config } from './config.js';
import { getAllSegments } from './segmentManager.js';
import { getAllUserInputs } from './userDataStore.js';
import { compareTexts } from './textComparison.js';

// Store timing information for statistics
let exerciseStartTime = null;
let exerciseEndTime = null;
let segmentTimes = [];

/**
 * Initialize the results screen
 * @returns {Object} - Public methods for the results screen
 */
export function initResultsScreen() {
    // Create the results container if it doesn't exist
    createResultsContainer();
    
    // Set exercise start time
    exerciseStartTime = Date.now();
    
    // Return public methods
    return {
        showResults,
        hideResults,
        trackSegmentTime
    };
}

/**
 * Create the results container if it doesn't exist
 */
function createResultsContainer() {
    // Check if results container already exists
    let resultsContainer = document.getElementById('results-container');
    
    // If it doesn't exist, create it
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'results-container';
        resultsContainer.className = 'results-container';
        
        // Add it to the player container
        const playerContainer = document.getElementById(config.playerContainerId);
        playerContainer.appendChild(resultsContainer);
    }
}

/**
 * Show the results screen with user statistics
 */
export function showResults() {
    // Set exercise end time
    exerciseEndTime = Date.now();
    
    // Get the results container
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    // Get all segments and user inputs
    const segments = getAllSegments();
    const userInputs = getAllUserInputs();
    
    // Calculate statistics
    const stats = calculateStatistics(segments, userInputs);
    
    // Generate HTML for results screen
    resultsContainer.innerHTML = generateResultsHTML(stats, segments, userInputs);
    
    // Show the results container
    resultsContainer.style.display = 'block';
    
    // Add event listeners to result buttons
    setupResultEventListeners();
}

/**
 * Hide the results screen
 */
export function hideResults() {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

/**
 * Track time spent on a segment
 * @param {number} segmentIndex - The index of the segment
 * @param {number} timeMs - Time in milliseconds spent on this segment
 */
export function trackSegmentTime(segmentIndex, timeMs) {
    segmentTimes[segmentIndex] = timeMs;
}

/**
 * Calculate statistics for the exercise
 * @param {Array} segments - Array of all segments
 * @param {Array} userInputs - Array of user inputs
 * @returns {Object} - Statistics object
 */
function calculateStatistics(segments, userInputs) {
    let totalChars = 0;
    let correctChars = 0;
    let errorCount = 0;
    let completedSegments = 0;
    
    // Process each segment
    segments.forEach((segment, index) => {
        const referenceText = segment.text;
        const userInput = userInputs[index] || '';
        
        if (userInput.trim() !== '') {
            completedSegments++;
            
            // Compare texts
            const comparison = compareTexts(userInput, referenceText);
            
            // Count characters
            totalChars += referenceText.length;
            errorCount += comparison.errorPositions.length;
            correctChars += referenceText.length - comparison.errorPositions.length;
        }
    });
    
    // Calculate total time
    const totalTimeMs = exerciseEndTime - exerciseStartTime;
    const totalTimeSeconds = Math.round(totalTimeMs / 1000);
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Calculate accuracy
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
    
    // Calculate completion percentage
    const completionPercentage = (completedSegments / segments.length) * 100;
    
    return {
        totalSegments: segments.length,
        completedSegments,
        completionPercentage: Math.round(completionPercentage),
        totalChars,
        correctChars,
        errorCount,
        accuracy: Math.round(accuracy * 10) / 10,
        totalTimeMs,
        formattedTime
    };
}

/**
 * Generate HTML for the results screen
 * @param {Object} stats - Statistics object
 * @param {Array} segments - Array of all segments
 * @param {Array} userInputs - Array of user inputs
 * @returns {string} - HTML for the results screen
 */
function generateResultsHTML(stats, segments, userInputs) {
    // Generate the header and stats section
    let html = `
        <div class="results-header">
            <h2>Exercise Results</h2>
        </div>
        <div class="results-stats">
            <div class="stat-item">
                <div class="stat-title">Completion</div>
                <div class="stat-value ${getCompletionClass(stats.completionPercentage)}">${stats.completionPercentage}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Accuracy</div>
                <div class="stat-value ${getAccuracyClass(stats.accuracy)}">${stats.accuracy}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Mistakes</div>
                <div class="stat-value ${getErrorClass(stats.errorCount)}">${stats.errorCount}</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Time</div>
                <div class="stat-value">${stats.formattedTime}</div>
            </div>
        </div>
    `;
    
    // Generate the segments section
    html += '<div class="results-segments">';
    
    // Only show completed segments with errors
    segments.forEach((segment, index) => {
        const userInput = userInputs[index] || '';
        if (userInput.trim() === '') return;
        
        const comparison = compareTexts(userInput, segment.text);
        
        // Only show segments with errors
        if (comparison.errorPositions.length > 0) {
            const segmentNumber = index + 1;
            const highlightedInput = generateHighlightedHTML(
                comparison.transformedInput || userInput,
                comparison.errorPositions
            );
            
            html += `
                <div class="segment-result">
                    <div class="segment-header">
                        <span>Segment ${segmentNumber}</span>
                    </div>
                    <div class="segment-content">
                        <div class="highlight-container">${highlightedInput}</div>
                    </div>
                    <div class="segment-reference">${segment.text}</div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    // Add action buttons
    html += `
        <div class="results-actions">
            <button id="retry-btn" class="result-btn retry-btn">Retry Exercise</button>
            <button id="new-exercise-btn" class="result-btn new-exercise-btn">New Exercise</button>
        </div>
    `;
    
    return html;
}

/**
 * Generate highlighted HTML for the results screen
 * @param {string} input - User input text
 * @param {Array} errorPositions - Array of error positions
 * @returns {string} - HTML with highlighted errors
 */
function generateHighlightedHTML(input, errorPositions) {
    if (!input) return '';
    
    // If no errors, all text is correct (green)
    if (!errorPositions || errorPositions.length === 0) {
        return `<span class="correct">${input}</span>`;
    }
    
    // Build output with character-by-character highlighting
    let output = '';
    const chars = input.split('');
    
    chars.forEach((char, index) => {
        if (errorPositions.includes(index)) {
            // Error character (red)
            output += `<span class="incorrect">${char}</span>`;
        } else {
            // Correct character (green)
            output += `<span class="correct">${char}</span>`;
        }
    });
    
    return output;
}

/**
 * Set up event listeners for result screen buttons
 */
function setupResultEventListeners() {
    const retryBtn = document.getElementById('retry-btn');
    const newExerciseBtn = document.getElementById('new-exercise-btn');
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            // Hide results and reset exercise
            hideResults();
            
            // Dispatch retry event
            document.dispatchEvent(new Event('retryExercise'));
        });
    }
    
    if (newExerciseBtn) {
        newExerciseBtn.addEventListener('click', () => {
            // Hide results
            hideResults();
            
            // Dispatch new exercise event
            document.dispatchEvent(new Event('newExercise'));
        });
    }
}

/**
 * Get CSS class based on completion percentage
 * @param {number} percentage - Completion percentage
 * @returns {string} - CSS class
 */
function getCompletionClass(percentage) {
    if (percentage >= 90) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
}

/**
 * Get CSS class based on accuracy percentage
 * @param {number} accuracy - Accuracy percentage
 * @returns {string} - CSS class
 */
function getAccuracyClass(accuracy) {
    if (accuracy >= 95) return 'good';
    if (accuracy >= 80) return 'average';
    return 'poor';
}

/**
 * Get CSS class based on error count
 * @param {number} errors - Number of errors
 * @returns {string} - CSS class
 */
function getErrorClass(errors) {
    if (errors <= 3) return 'good';
    if (errors <= 10) return 'average';
    return 'poor';
}
