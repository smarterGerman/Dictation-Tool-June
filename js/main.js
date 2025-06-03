// Application entry point (initialization and main logic)
import { initPlayer } from './modules/player.js';
import { setupUI } from './modules/ui.js';
import { defaultAudio } from './modules/config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the player with the default audio file
    const audioPlayer = initPlayer(defaultAudio);
    
    // Set up the UI components and event listeners
    setupUI(audioPlayer);
    
    console.log('Dictation Tool initialized successfully');
});
