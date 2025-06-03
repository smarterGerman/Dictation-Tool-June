// Application entry point (initialization and main logic)
import { initPlayer } from './modules/player.js';
import { setupUI } from './modules/ui.js';
import { defaultAudio, defaultVTT } from './modules/config.js';
import { parseVTT } from './modules/vttParser.js';
import { initSegmentManager } from './modules/segmentManager.js';
import { initInputManager } from './modules/inputManager.js';
import { initUserDataStore } from './modules/userDataStore.js';

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
        
        // Set up the UI components and event listeners
        setupUI(audioPlayer, segmentState, inputManager);
        
        console.log('Dictation Tool initialized successfully');
        
        // Listen for input submitted events
        document.addEventListener('inputSubmitted', function(e) {
            const { index, text } = e.detail;
            console.log(`Input submitted for segment ${index + 1}:`, text);
            
            // If not at the last segment, auto-play the next segment
            if (index < cues.length - 1) {
                setTimeout(() => {
                    const nextBtn = document.getElementById('next-segment-btn');
                    if (nextBtn) nextBtn.click();
                }, 100);
            }
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
