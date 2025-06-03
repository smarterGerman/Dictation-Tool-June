I want to build a minimal web-based dictation app that plays an audio file and displays its transcript, which can be embedded in a Teachable course via an <iframe>. 

## GENERAL PRINCIPLES
I want to start developing a very simple application, but it will grow over time. So I want to structure the project with scalability and mainteinance in mind.
Probably using modules (ES6), surely separating folders and files based on functionalities.

## Phase 1: MVP Player with Teachable Integration

### Objectives
- Create a minimal audio player that plays mp3 from a folder in the application (in the github page folders)
- Successfully deploy to GitHub Pages
- Verify Teachable iframe integration works properly

### Technical Implementation
- Use HTML5 audio element with basic controls
- Create simple responsive layout that works within iframe constraints
- Set up GitHub Pages deployment from main branch

### Testing
- Verify iframe embedding in Teachable test environment

### Success Criteria
- Audio plays correctly within Teachable course
- Basic controls function properly
- Layout displays correctly 

## Phase 2

Add the transcript and test if I can display it.

## Phase 3

Start adding other features (track control, check of text accuracy, etc.).