// Application entry point (initialization and main logic)
import { initPlayer, createSegmentMarkers } from './modules/player.js';
import { setupUI, addExitButton } from './modules/ui.js';
import { defaultAudio, defaultVTT } from './modules/config.js';
import { parseVTT } from './modules/vttParser.js';
import { initSegmentManager } from './modules/segmentManager.js';
import { initInputManager } from './modules/inputManager.js';
import { initUserDataStore } from './modules/userDataStore.js';
import { initResultsScreen } from './modules/resultsScreen.js';
import { notifySegmentChange } from './modules/textComparison.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load and parse VTT file
        console.log('Loading VTT file:', defaultVTT);
        const cues = await parseVTT(defaultVTT);
        console.log('VTT cues loaded:', cues.length);
        
        // Initialize the player with the default audio file
        const audioPlayer = initPlayer(defaultAudio);
        
        // Create segment markers when audio metadata is loaded
        audioPlayer.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded, creating segment markers');
            // Create visual markers on the progress bar
            createSegmentMarkers(cues, audioPlayer.duration);
        });
        
        // Initialize the segment manager with cues
        const segmentState = initSegmentManager(cues);
        
        // Initialize the user data store
        const userDataStore = initUserDataStore(cues.length);
        
        // Initialize the input manager
        const inputManager = initInputManager();
        
        // Initialize the results screen
        const resultsScreen = initResultsScreen();
        
        // Set up the UI components and event listeners
        setupUI(audioPlayer, segmentState, inputManager);
        
        // Add exit button for early dictation completion
        addExitButton();
        
        console.log('Dictation Tool initialized successfully');
        
                // Track if all segments are complete
        let completedSegments = new Set();
        
        // Expose utility functions for developers via console
        window.dictationUtils = {
            toggleAdvancedComparison: (enabled) => {
                if (typeof enabled !== 'boolean') {
                    console.log(`Advanced comparison is currently ${inputManager.setAdvancedComparison ? 'enabled' : 'disabled'}`);
                    return;
                }
                
                if (inputManager.setAdvancedComparison) {
                    inputManager.setAdvancedComparison(enabled);
                    console.log(`Advanced comparison ${enabled ? 'enabled' : 'disabled'}`);
                } else {
                    console.log('Cannot toggle advanced comparison - input manager not properly initialized');
                }
            }
        };
        
        // Add protection against multiple rapid input submissions
        let isProcessingInput = false;
        
        // Listen for input submitted events
        document.addEventListener('inputSubmitted', function(e) {
            // Prevent multiple rapid submissions
            if (isProcessingInput) {
                console.log('Already processing input submission, ignoring');
                return;
            }
            
            isProcessingInput = true;
            
            try {
                const { index, text, isCorrect } = e.detail;
                console.log(`Input submitted for segment ${index + 1}:`, text, isCorrect ? '(correct)' : '(incorrect)');
                
                // Get the current segment to check if it's the last one
                const currentSegment = segmentState.currentIndex;
                const isLastSegment = currentSegment >= cues.length - 1;
                console.log(`Current segment: ${currentSegment + 1} of ${cues.length}, Is last: ${isLastSegment}`);
                
                // Notify the text comparison system about the segment change
                notifySegmentChange();
                
                // Mark this segment as completed
                completedSegments.add(index);
                
                // Show results screen in three cases:
                // 1. All segments are completed
                // 2. This is the last segment
                // 3. We've reached the end of the exercise
                if (completedSegments.size === cues.length || isLastSegment || currentSegment === cues.length - 1) {
                    console.log('Last segment completed or all segments done, showing results screen');
                    setTimeout(() => {
                        resultsScreen.showResults();
                    }, 500);
                    return;
                }
                
                // If not at the last segment, auto-play the next segment
                if (index < cues.length - 1) {
                    console.log(`Advancing to next segment (${index + 2} of ${cues.length})`);
                    setTimeout(() => {
                        const nextBtn = document.getElementById('next-segment-btn');
                        if (nextBtn) nextBtn.click();
                    }, 100);
                }
            } finally {
                // Reset flag after a delay
                setTimeout(() => {
                    isProcessingInput = false;
                }, 1000);
            }
        });
        
        // Listen for retry exercise event
        document.addEventListener('retryExercise', function() {
            // Reset completed segments
            completedSegments = new Set();
            
            // Clear user inputs
            userDataStore.clearAllInputs();
            
            // Go back to first segment
            const firstSegmentIndex = 0;
            audioPlayer.currentTime = cues[firstSegmentIndex].startTime;
            segmentState.currentIndex = firstSegmentIndex;
            
            // Play the first segment
            document.getElementById('play-btn').click();
        });
        
        // Listen for new exercise event
        document.addEventListener('newExercise', function() {
            // For now, just reload the page (in a real app, we would load a different exercise)
            window.location.reload();
        });
        
        // Listen for finish exercise event (when user clicks the Finish button)
        document.addEventListener('finishExercise', function() {
            // Notify text comparison about a segment change to prevent auto-advance issues
            notifySegmentChange();
            
            // Show the results screen
            setTimeout(() => {
                resultsScreen.showResults();
            }, 500);
        });
        
        // Direct event listener for showing results from any source
        document.addEventListener('showResults', function() {
            console.log('showResults event received, displaying results screen');
            setTimeout(() => {
                resultsScreen.showResults();
            }, 500);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        document.getElementById('player-container').innerHTML = `
            <div class="error-message">
                <h2>Error loading dictation tool</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
});
