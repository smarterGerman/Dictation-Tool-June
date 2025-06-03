# Dictation Tool

A web-based dictation application that plays audio files and allows users to transcribe what they hear. This tool is designed to be embedded in Teachable courses via an iframe.

## Features

### Phase 1: MVP Player (Completed)
- Audio player with standard playback controls (play, pause)
- Progress bar with time display
- Responsive design that works within iframe constraints
- Modular architecture for scalability

### Phase 2.1: VTT Integration & Audio Segmentation (Current)
- VTT file parsing for segmenting audio
- Sentence-by-sentence playback based on timestamps
- Segment navigation controls (previous, next, replay)

## Project Structure

```
dictation-tool/
├── index.html              # Main HTML file
├── css/                    # Stylesheet directory
│   ├── main.css            # Core application styles
│   ├── player.css          # Player-specific styles
│   ├── segments.css        # Segment-specific styles (new)
│   └── responsive.css      # Responsive design styles
├── js/                     # JavaScript directory
│   ├── main.js             # Application entry point
│   ├── modules/            # Functional modules
│   │   ├── config.js       # Configuration options
│   │   ├── player.js       # Audio player functionality
│   │   ├── ui.js           # UI interactions
│   │   ├── vttParser.js    # WebVTT parser (new)
│   │   └── segmentManager.js # Audio segmentation (new)
│   └── utils/
│       ├── helpers.js      # Helper functions
│       └── vttHelpers.js   # VTT-specific helpers (new)
└── assets/                 # Static assets
    ├── audio/              # Audio files directory
    │   └── chap01.mp3      # Example audio file
    ├── vtt/                # WebVTT files directory (new)
    │   └── chap01.vtt      # Transcript with timestamps
    └── images/             # Images directory
```

## Usage

1. Clone this repository
2. Open `index.html` in a web browser or serve with a local web server
3. The player will automatically load the default audio file and its associated VTT file
4. Use the segment navigation controls to move between sentences

## WebVTT Format

The application uses WebVTT files for defining audio segments. Each cue represents a sentence with start and end timestamps:

```
WEBVTT

00:00:00.000 --> 00:00:03.500
This is the first sentence of the dictation.

00:00:04.000 --> 00:00:08.200
Here is the second sentence to transcribe.
```

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

## Next Steps

- Phase 2.2: Add text input field that appears after each segment
- Phase 2.3: Implement text comparison with reference text
- Phase 2.4: Enhance user experience with smooth transitions and visual feedback