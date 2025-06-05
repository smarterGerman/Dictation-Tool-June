I want to build a minimal web-based dictation app that plays an audio file and allows users to transcribe what they hear, which can be embedded in a Teachable course via an <iframe>. 

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

## Phase 2: Sentence-by-Sentence Dictation System

### Phase 2.1: VTT Integration & Basic Audio Segmentation

#### Objectives
- Set up VTT file structure and loading
- Implement basic audio segmentation based on timestamps
- Add controls to navigate between segments

#### Technical Implementation
- Create sample VTT files with proper formatting
- Build VTT parser module to extract timestamps and text
- Modify audio player to support segment-based navigation
- Add basic next/previous segment controls

#### Success Criteria
- VTT files are properly parsed
- Audio plays in segments based on timestamps
- Navigation controls work correctly

### Phase 2.2: Input Field Integration

#### Objectives
- Add text input functionality
- Implement automatic focus management
- Store user inputs for each segment

#### Technical Implementation
- Create text input UI components
- Bö
- Implement data structure to store user inputs per segment
- Add event handlers for input submission

#### Success Criteria
- Input field appears when audio pauses
- Focus automatically shifts to input field
- User input is stored correctly for each segment

### Phase 2.3: Text Comparison & Feedback

#### Objectives
- Implement text comparison algorithm
- Add visual feedback for errors
- Create summary view of results

#### Technical Implementation
- Build string comparison module
- Implement highlighting system for errors
- Create summary component for overall results
- Add navigation to review all answers

#### Success Criteria
- Differences between user input and reference are highlighted
- Error detection works correctly
- Summary shows overall performance

### Phase 2.4: User Experience Refinement

#### Objectives
- Improve interaction flow
- Add progress indicators
- Enhance responsive design for all components
- Polish visual feedback

#### Technical Implementation
- Add smooth transitions between states
- Implement progress indicators
- Refine styling and layout for all screen sizes
- Ensure iframe compatibility

#### Success Criteria
- Seamless user experience from start to finish
- Clear visual feedback throughout the process
- Responsive design works in all contexts
- All functionality works when embedded in Teachable

## Phase 3: Progress Tracking and Statistics

### Objectives
- Implement session-based progress tracking
- Provide statistics on user performance
- Save user progress for returning to incomplete sessions

### Technical Implementation
- Create local storage system for saving progress
- Develop statistics module for calculating accuracy metrics
- Design UI components for displaying progress and statistics
- Implement session resumption functionality

### Technical Details
1. **Storage Module**:
   - Create module for managing local storage of user progress
   - Implement save/load functionality for partial sessions

2. **Statistics Module**:
   - Track metrics like accuracy percentage, common mistakes, completion time
   - Generate visual representations of performance data

3. **UI Components**:
   - Add progress bar showing completion status
   - Create statistics dashboard
   - Implement session control buttons (save, resume, restart)

### Testing
- Verify progress is correctly saved and loaded
- Test statistics calculations for accuracy
- Ensure UI components display correctly

### Success Criteria
- User progress is maintained between sessions
- Accurate statistics are provided on completion
- UI clearly shows progress status

## Phase 4: Enhanced Features

### Objectives
- Add difficulty levels (adjusting playback speed, retry limits)
- Implement multiple audio track support with selection menu
- Create custom scoring systems
- Add pronunciation guides for difficult words

### Technical Implementation
- Enhance audio player with speed controls
- Build track selection interface
- Develop advanced scoring algorithms
- Create hint system for difficult content