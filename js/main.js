// Application entry point (initialization and main logic)
import { initPlayer } from './modules/player.js';
import { setupUI } from './modules/ui.js';
import { defaultAudio, defaultVTT } from './modules/config.js';
import { parseVTT } from './modules/vttParser.js';
import { initSegmentManager } from './modules/segmentManager.js';

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
        
        // Set up the UI components and event listeners
        setupUI(audioPlayer, segmentState);
        
        console.log('Dictation Tool initialized successfully');
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
