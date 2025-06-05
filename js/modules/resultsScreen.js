/**
 * Module for creating and managing the results screen
 * Integrates with the enhanced text comparison system
 */
import { config } from './config.js';
import { getAllSegments } from './segmentManager.js';
import { getAllUserInputs } from './userDataStore.js';
import { 
  generateResultHTML,
  processInput 
} from './textComparison/index.js'; 
import { calculateStats, updateInputDisplay, isCompleteMatch, generateResultHTML as generateHTML } from './uiManager.js';

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
    const comparisonResults = [];
    
    // Process each segment
    segments.forEach((segment, index) => {
        const referenceText = segment.text;
        const userInput = userInputs[index] || '';
        
        if (userInput.trim() !== '') {
            completedSegments++;
            
            try {
                // Try to use the advanced comparison system first
                const advancedResult = processInput(referenceText, userInput);
                comparisonResults.push(advancedResult);
                
                // Count characters for compatibility with existing code
                totalChars += referenceText.length;
                errorCount += advancedResult.words.filter(w => w.status !== 'correct').length;
                correctChars += advancedResult.words.filter(w => w.status === 'correct').length;
            } catch (e) {
                console.error("Advanced comparison failed for segment", index, e);
                
                // Fall back to legacy comparison system
                // Use the enhanced text comparison system
                const comparison = processInput(referenceText, userInput);
                
                // Count characters
                totalChars += referenceText.length;
                errorCount += comparison.errorPositions.length;
                correctChars += referenceText.length - comparison.errorPositions.length;
            }
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
    
    // Try to compute advanced stats if we have comparison results
    let advancedMetrics = null;
    if (comparisonResults && comparisonResults.length > 0) {
        try {
            advancedMetrics = calculateStats(comparisonResults);
        } catch (e) {
            console.error("Failed to calculate advanced metrics:", e);
        }
    }
    
    return {
        totalSegments: segments.length,
        completedSegments,
        completionPercentage: Math.round(completionPercentage),
        totalChars,
        correctChars,
        errorCount,
        accuracy: Math.round(accuracy * 10) / 10,
        totalTimeMs,
        formattedTime,
        advancedMetrics,
        hasAdvancedMetrics: !!advancedMetrics
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
    // Header and stats sections (as in previous suggestion)
    let html = `
        <div class="results-header">
            <h2>Exercise Results</h2>
        </div>
    `;
    
    // Calculate statistics using the old system's structure
    const calculatedStats = calculateStatistics(segments, userInputs);
    
    // Add stats display
    html += `
        <div class="results-stats">
            <div class="stat-item">
                <div class="stat-title">Completion</div>
                <div class="stat-value ${getCompletionClass(calculatedStats.completionPercentage)}">${calculatedStats.completionPercentage}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-title">Accuracy</div>
                <div class="stat-value ${getAccuracyClass(calculatedStats.accuracy)}">${calculatedStats.accuracy}%</div>
            </div>
            ${calculatedStats.hasAdvancedMetrics ? `
            <div class="stat-item">
                <div class="stat-title">Word Stats</div>
                <div class="stat-sub-item">Correct Words: <span class="word-correct">${calculatedStats.advancedMetrics.correctWords}</span></div>
                <div class="stat-sub-item">Misspelled: <span class="word-misspelled">${calculatedStats.advancedMetrics.misspelledWords}</span></div>
                <div class="stat-sub-item">Missing: <span class="word-missing">${calculatedStats.advancedMetrics.missingWords}</span></div>
                <div class="stat-sub-item">Extra: <span class="word-extra">${calculatedStats.advancedMetrics.extraWords}</span></div>
            </div>` : `
            <div class="stat-item">
                <div class="stat-title">Mistakes</div>
                <div class="stat-value ${getErrorClass(calculatedStats.errorCount)}">${calculatedStats.errorCount}</div>
            </div>`}
            <div class="stat-item">
                <div class="stat-title">Time</div>
                <div class="stat-value">${calculatedStats.formattedTime}</div>
            </div>
        </div>
    `;
    
    // Generate the segments section - focus on reference text with highlighting
    html += '<div class="results-segments">';
    
    segments.forEach((segment, index) => {
        const userInput = userInputs[index] || '';
        if (userInput.trim() === '') return;
        
        try {
            // Use the advanced comparison system
            const comparisonResult = processInput(segment.text, userInput);
            
            // Only show segments with errors
            const hasErrors = comparisonResult.words.some(w => w.status !== 'correct') || 
                           (comparisonResult.extraWords && comparisonResult.extraWords.length > 0);
                        
            if (hasErrors) {
                // Show the segment with reference text as the primary content
                html += `
                    <div class="segment-result">
                        <div class="segment-header">
                            <span>Segment ${index + 1}</span>
                        </div>
                        <div class="segment-content">
                            <div class="reference-text">`;
                
                // Highlight reference text based on comparison
                comparisonResult.words.forEach(word => {
                    if (word.status === 'correct') {
                        html += `<span class="word-correct">${word.expected}</span> `;
                    } else if (word.status === 'misspelled') {
                        html += `<span class="word-misspelled" title="User typed: ${word.word}">${word.expected}</span> `;
                    } else if (word.status === 'missing') {
                        html += `<span class="word-missing">${word.expected}</span> `;
                    }
                });
                
                html += `</div>`;
                
                // Show extra words if any
                if (comparisonResult.extraWords && comparisonResult.extraWords.length > 0) {
                    html += `<div class="extra-words-container">Extra words: `;
                    comparisonResult.extraWords.forEach(extraWord => {
                        html += `<span class="word-extra">${extraWord.word}</span> `;
                    });
                    html += `</div>`;
                }
                
                html += `</div></div>`;
            }
        } catch (e) {
            console.error("Advanced comparison failed for segment", index, e);
            // Fallback implementation
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
