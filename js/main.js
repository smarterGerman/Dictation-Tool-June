// Application entry point (initialization and main logic)
import { initPlayer } from './modules/player.js';
import { setupUI } from './modules/ui.js';
import { defaultAudio, defaultVTT } from './modules/config.js';
import { parseVTT } from './modules/vttParser.js';
import { initSegmentManager } from './modules/segmentManager.js';
import { initInputManager } from './modules/inputManager.js';
import { initUserDataStore } from './modules/userDataStore.js';
import { initResultsScreen } from './modules/resultsScreen.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load and parse VTT file
        console.log('Loading VTT file:', defaultVTT);
        const cues = await parseVTT(defaultVTT);
        console.log('VTT cues loaded:', cues.length);
        
        // Initialize the player with the default audio file
        const audioPlayer = initPlayer(defaultAudio);
        
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
        
        console.log('Dictation Tool initialized successfully');
        
        // Track if all segments are complete
        let completedSegments = new Set();
        
        // Listen for input submitted events
        document.addEventListener('inputSubmitted', function(e) {
            const { index, text, isCorrect } = e.detail;
            console.log(`Input submitted for segment ${index + 1}:`, text, isCorrect ? '(correct)' : '(incorrect)');
            
            // Mark this segment as completed
            completedSegments.add(index);
            
            // If all segments are completed, show the results screen
            if (completedSegments.size === cues.length) {
                setTimeout(() => {
                    resultsScreen.showResults();
                }, 500);
                return;
            }
            
            // If not at the last segment, auto-play the next segment
            if (index < cues.length - 1) {
                setTimeout(() => {
                    const nextBtn = document.getElementById('next-segment-btn');
                    if (nextBtn) nextBtn.click();
                }, 100);
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
            // Show the results screen
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
