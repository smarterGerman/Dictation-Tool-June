# Dictation Tool

A web-based dictation application that plays audio files and allows users to practice transcription. This tool is designed to be embedded in Teachable courses via an iframe.

## Features (Phase 1)

- Audio player with standard playback controls (play, pause)
- Progress bar with time display
- Responsive design that works within iframe constraints
- Modular architecture for scalability

## Project Structure

```
dictation-tool/
├── index.html              # Main HTML file
├── css/                    # Stylesheet directory
│   ├── main.css            # Core application styles
│   ├── player.css          # Player-specific styles
│   └── responsive.css      # Responsive design styles
├── js/                     # JavaScript directory
│   ├── main.js             # Application entry point
│   ├── modules/            # Functional modules
│   │   ├── config.js       # Configuration options
│   │   ├── player.js       # Audio player functionality
│   │   └── ui.js           # UI interactions
│   └── utils/
│       └── helpers.js      # Helper functions
└── assets/                 # Static assets
    ├── audio/              # Audio files directory
    │   └── chap01.mp3      # Example audio file
    └── images/             # Images directory
```

## Usage

1. Clone this repository
2. Open `index.html` in a web browser
3. The player will automatically load the default audio file

## Embedding in Teachable

```html
<iframe 
  src="https://yourusername.github.io/dictation-tool/" 
  width="100%" 
  height="300" 
  frameborder="0"
  allowfullscreen>
</iframe>
```

## Future Phases

- Phase 2: Add transcript display functionality
- Phase 3: Implement additional features (track control, accuracy checking, etc.)