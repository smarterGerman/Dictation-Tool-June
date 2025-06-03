# Comprehensive Guide: German Dictation App (JS/CSS/HTML)

## Table of Contents
1. [Overview](#overview)
2. [Core Playback & Segmentation](#core-playback--segmentation)
3. [Pausing & User Input Cycle](#pausing--user-input-cycle)
4. [Live Text Difference Feedback](#live-text-difference-feedback)
5. [Mistake Highlight & Correction Popups](#mistake-highlight--correction-popups)
6. [Case Sensitivity Toggle (“Aa”)](#case-sensitivity-toggle-aa)
7. [German Character Variants Handling](#german-character-variants-handling)
8. [Completion & Results Summary](#completion--results-summary)
9. [Iterative Enhancement & Testing](#iterative-enhancement--testing)
10. [Recommended Libraries & Tools](#recommended-libraries--tools)
11. [Project Structure & Folder Layout](#project-structure--folder-layout)
12. [Accessibility & UX Considerations](#accessibility--ux-considerations)
13. [Additional Controls & Dark‐Mode Requirements](#additional-controls--darkmode-requirements)
14. [Deployment & Teachable Embedding](#deployment--teachable-embedding)
15. [Multiple Lessons & Dynamic VTT Selection](#multiple-lessons--dynamic-vtt-selection)

---

## Overview
This document provides a comprehensive implementation plan for a web‐based German dictation app using JavaScript, CSS, and HTML. The app will be embeddable via an iframe (e.g., in Teachable) and hosted on a static platform like GitHub Pages (using GitHub’s LFS for audio files under 10 MB). It supports:
- Playing audio sentence by sentence using WebVTT cues.
- Pausing after each sentence and prompting the user to type the transcription.
- Live diff highlighting of user input versus expected text (with red color and strikethrough for errors).
- Click‐to‐reveal correct words for mistakes via tooltips.
- Case sensitivity toggle (desktop only) and umlaut/ß normalization logic.
- Completion % and accuracy % metrics, plus time tracking.
- Dark‐mode UI with accessible keyboard shortcuts (Ctrl+Enter, Ctrl+←, Ctrl+→, Ctrl+↑).
- Mobile optimizations (no autocorrect, large tap targets, default case‐insensitive, visible repeat button).
- Dynamic selection of VTT/audio files per lesson in four courses (50 lessons each).

Everything is laid out step-by-step so you can copy this into Visual Studio Code and start coding immediately.

---

## Core Playback & Segmentation
1. **HTML Audio & VTT Setup**  
   ```html
   <audio id="dictationAudio" preload="metadata">
     <source src="audio/dictation.mp3" type="audio/mpeg">
     <track id="vttTrack" kind="metadata" src="vtt/transcript.vtt" default>
   </audio>
   ```
2. **Loading & Parsing Cues (audioController.js)**  
   ```js
   export async function loadAudioAndVTT(audioSrc, vttSrc) {
     return new Promise((resolve, reject) => {
       const audio = document.getElementById('dictationAudio');
       const track = document.getElementById('vttTrack');
       track.addEventListener('load', () => {
         const cues = audio.textTracks[0].cues;
         resolve(Array.from(cues)); // cues: { startTime, endTime, text }
       });
       track.addEventListener('error', () => reject('VTT failed to load'));
       audio.src = audioSrc;
       track.src = vttSrc;
       // Force load
       audio.load();
     });
   }
   ```
3. **Playing a Single Sentence**  
   ```js
   export function playSegment(index) {
     const audio = document.getElementById('dictationAudio');
     const cue = state.cues[index];
     audio.currentTime = cue.startTime;
     audio.play();
     const onTimeUpdate = () => {
       if (audio.currentTime >= cue.endTime) {
         audio.pause();
         audio.removeEventListener('timeupdate', onTimeUpdate);
         // Notify UI that sentence ended
         if (state.onSegmentEnd) state.onSegmentEnd(index);
       }
     };
     audio.addEventListener('timeupdate', onTimeUpdate);
   }

   export function pauseAudio() {
     document.getElementById('dictationAudio').pause();
   }

   export function replaySegment() {
     playSegment(state.currentIndex);
   }
   ```

---

## Pausing & User Input Cycle
1. **State Initialization (state.js)**  
   ```js
   export const state = {
     currentIndex: 0,
     cues: [],                 // from loadAudioAndVTT
     transcriptSentences: [],  // array of default sentences
     userInputs: [],           // one entry per sentence
     caseSensitive: true,
     startTime: null,
     endTime: null,
     onSegmentEnd: null        // callback when a segment ends
   };

   export function initializeState(cues) {
     state.cues = cues;
     state.transcriptSentences = cues.map(cue => cue.text);
     state.userInputs = Array(cues.length).fill('');
     state.currentIndex = 0;
     state.caseSensitive = true;
     state.startTime = null;
     state.endTime = null;
   }

   export function recordInput(index, text) {
     state.userInputs[index] = text;
   }

   export function toggleCaseSensitive() {
     state.caseSensitive = !state.caseSensitive;
   }

   export function markStartTime() {
     if (!state.startTime) state.startTime = Date.now();
   }

   export function markEndTime() {
     state.endTime = Date.now();
   }

   export function resetState() {
     const len = state.cues.length;
     state.userInputs = Array(len).fill('');
     state.currentIndex = 0;
     state.startTime = null;
     state.endTime = null;
   }
   ```

2. **UI Controls Setup (uiControls.js)**  
   ```js
   import { state, recordInput, markStartTime, markEndTime } from './state.js';
   import { playSegment, replaySegment } from './audioController.js';
   import { updateHighlightedInput, showTooltip } from './diffUtils.js';

   export function setupUI() {
     const input = document.getElementById('transcriptionInput');
     const highlighted = document.getElementById('highlightedInput');
     const playBtn = document.getElementById('playButton');
     const prevBtn = document.getElementById('prevButton');
     const nextBtn = document.getElementById('nextButton');
     const repeatBtn = document.getElementById('repeatButton');
     const caseBtn = document.getElementById('caseToggle');
     const speedBtn = document.getElementById('speedToggle');
     const finishBtn = document.getElementById('finishButton');

     // 1) When a segment ends, focus input and update highlight
     state.onSegmentEnd = (index) => {
       state.currentIndex = index;
       input.value = state.userInputs[index] || '';
       input.focus();
       updateHighlightedInput(input.value);
     };

     // 2) Input event for live diff (debounced)
     const debouncedDiff = debounce(() => {
       updateHighlightedInput(input.value);
     }, 100);

     input.addEventListener('input', () => {
       recordInput(state.currentIndex, input.value);
       debouncedDiff();
     });

     // 3) Enter key to submit current sentence
     input.addEventListener('keydown', (e) => {
       if (e.key === 'Enter') {
         e.preventDefault(); // no newline
         // Move to next segment or finish
         handleNextSentence();
       }
     });

     // 4) Button events
     playBtn.addEventListener('click', () => {
       markStartTime();
       playSegment(state.currentIndex);
     });
     prevBtn.addEventListener('click', goToPrevious);
     nextBtn.addEventListener('click', handleNextSentence);
     repeatBtn.addEventListener('click', replaySegment);
     caseBtn.addEventListener('click', () => {
       toggleCaseSensitive();
       caseBtn.setAttribute('aria-pressed', state.caseSensitive);
       updateHighlightedInput(input.value);
     });
     speedBtn.addEventListener('click', togglePlaybackSpeed);
     finishBtn.addEventListener('click', finishDictation);
   }

   function goToPrevious() {
     if (state.currentIndex > 0) {
       state.currentIndex--;
       playSegment(state.currentIndex);
     }
   }

   function handleNextSentence() {
     const idx = state.currentIndex;
     // record already happened on input event
     if (idx < state.cues.length - 1) {
       state.currentIndex++;
       playSegment(state.currentIndex);
     } else {
       finishDictation();
     }
   }
   ```

---

## Live Text Difference Feedback
1. **Normalization & Diff Utilities (diffUtils.js)**  
   ```js
   import Diff from '../lib/jsdiff.min.js';
   import { state } from './state.js';

   function isUpperCase(char) {
     return char === char.toUpperCase() && char !== char.toLowerCase();
   }

   export function normalizeUserInput(raw) {
     let text = raw;
     // Umlaut patterns (ae → ä or Ä, oe → ö or Ö, ue → ü or Ü)
     text = text.replace(/ae/gi, match => isUpperCase(match[0]) ? 'Ä' : 'ä');
     text = text.replace(/oe/gi, match => isUpperCase(match[0]) ? 'Ö' : 'ö');
     text = text.replace(/ue/gi, match => isUpperCase(match[0]) ? 'Ü' : 'ü');
     text = text.replace(/a[:\/]/gi, match => isUpperCase(match[0]) ? 'Ä' : 'ä');
     text = text.replace(/o[:\/]/gi, match => isUpperCase(match[0]) ? 'Ö' : 'ö');
     text = text.replace(/u[:\/]/gi, match => isUpperCase(match[0]) ? 'Ü' : 'ü');

     // ß variants: s:/s/ → ß, capital B in middle → ß
     text = text.replace(/s[:\/]/gi, 'ß');
     text = text.replace(/(?<=\S)B(?=\S)/g, 'ß');
     return text;
   }

   export function compareSentences(defaultSentence, userInput, caseSensitive) {
     // 1) Normalize user input to proper German chars
     const normalizedUser = normalizeUserInput(userInput);

     // 2) Lowercase both sides if caseSensitive is false
     let left = defaultSentence;
     let right = normalizedUser;
     if (!caseSensitive) {
       left = left.toLocaleLowerCase('de-DE');
       right = right.toLocaleLowerCase('de-DE');
     }

     // 3) Word‐level diff to catch insertions/deletions
     const wordDiff = Diff.diffWords(left, right);
     // 4) For each “changed” word pair, do char‐level diff
     const segments = [];
     let leftIndex = 0, rightIndex = 0;
     wordDiff.forEach(part => {
       if (part.added) {
         // Extra word(s) in user
         const addedWords = part.value.split(/\s+/);
         addedWords.forEach(w => {
           segments.push({ text: w, mistake: true, type: 'extra' });
           rightIndex++;
         });
       } else if (part.removed) {
         // Word(s) missing in user—mark as missing? For live diff, skip (user may still type)
         leftIndex += part.value.split(/\s+/).length;
       } else {
         // Same word(s)—but may contain char differences if words equal length but letters differ
         const equalWords = part.value.split(/\s+/);
         equalWords.forEach(word => {
           // If exactly same, no diffs
           const userWord = word; // from right side
           if (word === word) {
             segments.push({ text: word, mistake: false });
           } else {
             // Shouldn't happen: diffWords only marks changed words
             segments.push({ text: word, mistake: false });
           }
           leftIndex++;
           rightIndex++;
         });
       }
     });
     // Note: The above is a simplified approach—more advanced handling may be needed
     return segments; // array of { text, mistake, type }
   }

   export function updateHighlightedInput(inputValue) {
     const defaultSentence = state.transcriptSentences[state.currentIndex];
     const segments = compareSentences(defaultSentence, inputValue, state.caseSensitive);
     const container = document.getElementById('highlightedInput');
     container.innerHTML = segments.map(seg => {
       if (seg.mistake) {
         return `<span class="mistake" data-correct="${defaultSentence}">${seg.text}</span>`;
       }
       return `<span>${seg.text}</span>`;
     }).join(' ');
     // Attach click listeners for tooltips
     document.querySelectorAll('.mistake').forEach(span => {
       span.addEventListener('click', (e) => {
         const correctText = e.target.getAttribute('data-correct');
         showTooltip(e.target, correctText);
       });
     });
   }

   export function showTooltip(target, correctText) {
     // If using Tippy.js, use tippy(target, {content: correctText});
     const tooltip = document.createElement('div');
     tooltip.className = 'tooltip';
     tooltip.textContent = correctText;
     tooltip.setAttribute('role', 'tooltip');
     document.body.appendChild(tooltip);
     const rect = target.getBoundingClientRect();
     tooltip.style.left = rect.left + window.scrollX + 'px';
     tooltip.style.top = rect.bottom + window.scrollY + 'px';
     // Remove on next click anywhere
     document.addEventListener('click', () => {
       if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
     }, { once: true });
   }

   export function calculateWordStats(transcriptSentences, userInputs, caseSensitive) {
     let correctCount = 0;
     let attemptedCount = 0;
     let totalCount = 0;
     transcriptSentences.forEach((sentence, idx) => {
       const defaultWords = sentence.split(/\s+/);
       const userWords = userInputs[idx].trim().split(/\s+/);
       defaultWords.forEach((word, wIdx) => {
         totalCount++;
         const userWord = userWords[wIdx] || '';
         // Normalize both sides for accurate comparison
         const normUser = normalizeUserInput(userWord);
         const left = caseSensitive ? word : word.toLocaleLowerCase('de-DE');
         const right = caseSensitive ? normUser : normUser.toLocaleLowerCase('de-DE');
         if (right) attemptedCount++;
         if (left === right) correctCount++;
       });
     });
     return { correctCount, attemptedCount, totalCount };
   }

   // Debounce helper
   export function debounce(fn, delay) {
     let timer = null;
     return function(...args) {
       clearTimeout(timer);
       timer = setTimeout(() => fn.apply(this, args), delay);
     };
   }
   ```

---

## Mistake Highlight & Correction Popups
1. **Highlighting Logic**  
   - Incorrect letters or extra characters appear in red with strikethrough:  
     ```css
     .mistake {
       color: #FF4C4C;
       text-decoration: line-through;
       cursor: pointer;
     }
     ```
   - Extra words (insertion) use `type: 'extra'` in diff segments; missing words are not shown in live diff until final results.  

2. **Tooltips on Click**  
   - Each `<span class="mistake" data-correct="...">` has a click handler that creates a `<div class="tooltip">` next to the span:  
     ```js
     span.addEventListener('click', (e) => {
       const correctWord = e.target.getAttribute('data-correct');
       showTooltip(e.target, correctWord);
     });
     ```
   - Ensure tooltip has `role="tooltip"` and is removed on the next document click.  
   - Style tooltip with:  
     ```css
     .tooltip {
       position: absolute;
       background-color: #333;
       color: #FFF;
       padding: 0.25rem 0.5rem;
       border-radius: 0.25rem;
       z-index: 1000;
       font-size: 0.9rem;
     }
     ```

---

## Case Sensitivity Toggle (“Aa”)
1. **Toggle Button (HTML)**  
   ```html
   <button id="caseToggle" aria-pressed="true" aria-label="Toggle Case Sensitivity">Aa</button>
   ```
2. **Toggle Logic (uiControls.js)**  
   ```js
   caseBtn.addEventListener('click', () => {
     toggleCaseSensitive();
     caseBtn.setAttribute('aria-pressed', state.caseSensitive);
     const input = document.getElementById('transcriptionInput');
     updateHighlightedInput(input.value);
   });
   ```
3. **Effect on Comparison (diffUtils.js)**  
   - When `state.caseSensitive` is false, both default sentence and normalized user input are lowercased with `String.prototype.toLocaleLowerCase('de-DE')` before diffing.  
   - When true, compare exact characters.  

---

## German Character Variants Handling
1. **Normalization (diffUtils.js)** transforms user‐typed digraphs/variants into actual German characters (`ä, ö, ü, ß`), using regex:  
   ```js
   // In normalizeUserInput()
   .replace(/ae/gi, (m) => isUpperCase(m[0]) ? 'Ä' : 'ä')
   .replace(/oe/gi, (m) => isUpperCase(m[0]) ? 'Ö' : 'ö')
   .replace(/ue/gi, (m) => isUpperCase(m[0]) ? 'Ü' : 'ü')
   .replace(/a[:\/]/gi, (m) => isUpperCase(m[0]) ? 'Ä' : 'ä')
   .replace(/o[:\/]/gi, (m) => isUpperCase(m[0]) ? 'Ö' : 'ö')
   .replace(/u[:\/]/gi, (m) => isUpperCase(m[0]) ? 'Ü' : 'ü')
   .replace(/s[:\/]/gi, 'ß')
   .replace(/(?<=\S)B(?=\S)/g, 'ß');
   ```
2. **Rationale**:  
   - Never convert “ss” → “ß” (e.g., “Haussegen” remains correct).  
   - Convert user‐typed `ae → ä, oe → ö, ue → ü, a:/a/ → ä, o:/o/ → ö, u:/u/ → ü, s:/s/ or interior `B` → ß.  
   - Default transcript remains unchanged (contains true umlauts and ß).  

---

## Completion & Results Summary
1. **Metrics Definitions**  
   - **Completion %** = (# of correctly spelled words / total words in transcript) × 100.  
   - **Accuracy %** = (# of correctly spelled words / # of words attempted) × 100.  
     - “Attempted” means user typed at least one character for that word position.  
     - Incorrectly spelled words do not count for completion but do count in accuracy’s denominator.  
2. **computeResults (resultsRenderer.js)**  
   ```js
   import { calculateWordStats } from './diffUtils.js';
   import { state } from './state.js';

   export function renderResults() {
     const { correctCount, attemptedCount, totalCount } = calculateWordStats(
       state.transcriptSentences,
       state.userInputs,
       state.caseSensitive
     );
     const completionPct = Math.round((correctCount / totalCount) * 100);
     const accuracyPct = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
     const timeTakenMs = state.endTime - state.startTime;
     const minutes = Math.floor(timeTakenMs / 60000);
     const seconds = Math.floor((timeTakenMs % 60000) / 1000);
     const timeString = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;

     // Build summary cards HTML
     const summaryHtml = \`
       <div class="results-summary">
         <div class="card">
           <div>Completion</div>
           <div>\${completionPct}%</div>
           <div>\${correctCount} / \${totalCount} words</div>
         </div>
         <div class="card">
           <div>Accuracy</div>
           <div>\${accuracyPct}%</div>
           <div>\${correctCount} correct words</div>
         </div>
         <div class="card">
           <div>Mistakes</div>
           <div>\${(attemptedCount - correctCount)} / \${attemptedCount}</div>
           <div>\${attemptedCount > 0 ? Math.round(((attemptedCount - correctCount) / attemptedCount) * 100) : 0}%</div>
         </div>
         <div class="card">
           <div>Time</div>
           <div>\${timeString}</div>
         </div>
       </div>
     \`;

     // Build full user text with mistakes highlighted
     let fullTextHtml = '';
     state.transcriptSentences.forEach((sentence, idx) => {
       const userInput = state.userInputs[idx];
       const segments = compareSentences(sentence, userInput, state.caseSensitive);
       const sentenceHtml = segments.map(seg => {
         if (seg.mistake) {
           const correctZones = /* extract correct word from sentence by word index logic */ '';
           return \`<span class="mistake" data-correct="\${correctZones}">\${seg.text}</span>\`;
         }
         return \`<span>\${seg.text}</span>\`;
       }).join(' ');
       fullTextHtml += \`<div class="result-sentence">\${sentenceHtml}</div>\`;
     });

     const resultsDiv = document.getElementById('resultsView');
     resultsDiv.innerHTML = \`
       <h2>Dictation Results</h2>
       \${summaryHtml}
       <div id="fullTranscription">\${fullTextHtml}</div>
       <button id="retryButton">New Dictation</button>
     \`;

     document.getElementById('retryButton').addEventListener('click', () => {
       resetState();
       window.location.reload(); // Or reinitialize UI
     });

     // Show results, hide typing view
     document.getElementById('typingView').style.display = 'none';
     resultsDiv.style.display = 'block';
   }
   ```
3. **UI Layout Example (HTML)**  
   ```html
   <div id="typingView">
     <div id="controls">
       <button id="prevButton" aria-label="Previous Sentence">←</button>
       <button id="playButton" aria-label="Play or Pause Sentence">▶</button>
       <button id="nextButton" aria-label="Next Sentence">→</button>
       <span id="progressDisplay">0:00 / 0:00</span>
       <button id="caseToggle" aria-pressed="true" aria-label="Toggle Case Sensitivity">Aa</button>
       <button id="repeatButton" aria-label="Repeat Sentence">↻</button>
       <button id="speedToggle">100%</button>
       <button id="finishButton" aria-label="Finish Dictation">X</button>
     </div>
     <div id="inputContainer">
       <div id="highlightedInput" tabindex="0"></div>
       <input 
         id="transcriptionInput" 
         type="text" 
         autocomplete="off" 
         autocorrect="off" 
         spellcheck="false" 
         aria-label="Type what you hear">
     </div>
   </div>
   <div id="resultsView" style="display:none;"></div>
   ```

---

## Iterative Enhancement & Testing
1. **Incremental Steps**  
   1. **Audio & VTT Loading**: Test that `loadAudioAndVTT(...)` returns cues. Log cues.  
   2. **Single Sentence Playback**: Implement `playSegment(0)`. Verify that audio pauses at the end of the first cue.  
   3. **Basic Input & Navigation**: Show `<input>` after pause. Press Enter to call `playSegment(1)`. Test Replay & Previous.  
   4. **Live Diff Highlighting**: Hook up `updateHighlightedInput(...)` on `input` events. Verify red/strike highlighting.  
   5. **Results Screen**: After filling a few inputs, click “X” → call `renderResults()`. Verify summary & full text errors.  
   6. **Mobile Behavior**: Open on iOS/Android. Check that audio plays (after first user tap), input does not autocorrect, and buttons are tappable above keyboard.  
   7. **Keyboard Shortcuts**: Test Ctrl+Enter, Ctrl+←, Ctrl+→, Ctrl+↑. Ensure they work even if `<input>` is focused.  

2. **Cross‐Browser & Device Testing**  
   - Chrome (Windows, Mac)  
   - Firefox (Windows, Mac)  
   - Safari (Mac, iOS)  
   - Edge (Windows)  

3. **Accessibility Testing**  
   - Use Lighthouse or aXe to confirm:  
     - Buttons have `aria-label` or text.  
     - Focus ring is visible.  
     - Tooltip has `role="tooltip"` and `aria-describedby`.  

---

## Recommended Libraries & Tools
- **[jsdiff](https://github.com/kpdecker/jsdiff)** (MIT) for word/char diffs.  
- **[Mousetrap.js](https://craig.is/killing/mice)** (MIT) for keyboard shortcuts.  
- **[Tippy.js](https://atomiks.github.io/tippyjs/)** (MIT) for tooltips (optional) or custom `<div>` tooltips.  
- **[Lodash.debounce](https://lodash.com/docs/4.17.21#debounce)** (MIT) if you prefer a library debounce over custom.  
- **ESLint** (MIT) for JavaScript linting.  
- **GitHub LFS** to store audio files under 10 MB.  
- **CSS Framework (Optional)**: Tailwind or Bootstrap (both MIT) if you want rapid styling. Otherwise, custom CSS is fine.

---

## Project Structure & Folder Layout
```
dictation-app/
├── index.html
├── LICENSES/
│   ├── MIT.txt              # Our code license (MIT)
│   ├── jsdiff_LICENSE.txt   # MIT license for jsdiff
│   ├── mousetrap_LICENSE.txt# MIT license for Mousetrap.js
│   ├── tippy_LICENSE.txt    # MIT license for Tippy.js (if used)
│   └── lodash_LICENSE.txt   # MIT license for Lodash.debounce (if used)
├── css/
│   └── styles.css           # Dark‐mode styles, mistake highlighting, etc.
├── js/
│   ├── audioController.js   # loadAudioAndVTT, playSegment, pause, replay, speed
│   ├── diffUtils.js         # normalizeUserInput, compareSentences, updateHighlightedInput, calculateWordStats
│   ├── uiControls.js        # setupUI, input handlers, button event listeners
│   ├── shortcuts.js         # Mousetrap bindings for Ctrl+Enter, Ctrl+←, Ctrl+→, Ctrl+↑
│   ├── resultsRenderer.js   # renderResults, build summary cards, full text with mistakes
│   ├── state.js             # store cues, transcriptSentences, userInputs, toggleCase, timestamps
│   └── main.js              # Entry point: load audio/VTT, initialize state, call setupUI
├── lib/
│   ├── jsdiff.min.js        # jsdiff browser bundle (MIT)
│   ├── mousetrap.min.js     # Mousetrap.js (MIT)
│   ├── tippy.all.min.js     # Tippy.js (MIT) (optional)
│   └── lodash.debounce.min.js # Lodash.debounce (MIT) (optional)
├── audio/
│   └── [lessonID].mp3       # Each lesson’s audio file (≤ 10 MB). Git LFS tracks these.
├── vtt/
│   └── [lessonID].vtt       # Each lesson’s VTT transcript file.
├── README.md                # Overview, setup, and attribution summary.
└── .gitignore               # Ignore node_modules, .DS_Store, etc.
```

- **index.html**: Contains the container `<div id="app">`, audio element, track, and references to CSS/JS.  
- **LICENSES/**: Ensure attributions are preserved when distributing or embedding.  
- **css/styles.css**: Dark theme, focus outlines, mobile layout, mistake styling.  
- **js/**: ES6 modules using `import/export`. No bundler required—just use `<script type="module">` in index.html.  
- **lib/**: Third‐party minified scripts.  
- **audio/** & **vtt/**: Place one audio + VTT pair per lesson, named with a unique lessonID (e.g., `course1-lesson05.mp3` and `course1-lesson05.vtt`). Use Git LFS for audio files under 10 MB.

---

## Accessibility & UX Considerations
1. **Keyboard Controls (shortcuts.js)**  
   ```js
   import Mousetrap from '../lib/mousetrap.min.js';
   import { audioController } from './audioController.js';
   import { uiControls } from './uiControls.js';

   Mousetrap.bind('ctrl+enter', () => audioController.togglePlayPause());
   Mousetrap.bind('ctrl+left',  () => uiControls.goToPrevious());
   Mousetrap.bind('ctrl+right', () => uiControls.goToNext());
   Mousetrap.bind('ctrl+up',    () => uiControls.replaySegment());
   ```
   - Works on Windows & Mac (Control key). Optionally add `'alt+enter'` if needed.  

2. **ARIA & Focus Management**  
   - Buttons have `aria-label`. Toggle “Aa” has `aria-pressed`.  
   - After audio ends:  
     ```js
     transcriptionInput.focus();
     transcriptionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
     ```
   - On results screen:  
     ```js
     const results = document.getElementById('resultsView');
     results.setAttribute('tabindex', '-1');
     results.focus();
     ```
   - Tooltip: `<div role="tooltip">correctText</div>` with `aria-describedby` on the mistake span.  

3. **Mobile Behavior**  
   - On `<input>`:  
     ```html
     <input id="transcriptionInput" type="text" autocorrect="off" autocomplete="off" spellcheck="false">
     ```
   - Hide “Aa” toggle if `window.innerWidth < 600px`. Use CSS media query or JS:  
     ```css
     @media (max-width: 600px) { #caseToggle { display: none; } }
     ```
   - Always show “Repeat” button (↻).  
   - Button sizes ≥ 44 px to accommodate fat fingers.  
   - No auto‐correct, no spellcheck.  
   - Ensure tap targets have sufficient contrast and size.  

4. **Visual & Contrast**  
   ```css
   body, #app { background-color: #1E1E1E; color: #E0E0E0; }
   button {
     background-color: #2A2A2A;
     color: #E0E0E0;
     border: none;
     padding: 0.5rem 1rem;
     border-radius: 0.25rem;
   }
   button:focus { outline: 2px dashed #FFA500; }
   #typingView, #resultsView {
     background-color: #2A2A2A;
     border-radius: 0.5rem;
     padding: 1rem;
   }
   .mistake {
     color: #FF4C4C;
     text-decoration: line-through;
   }
   .tooltip {
     position: absolute;
     background-color: #333;
     color: #FFF;
     padding: 0.25rem 0.5rem;
     border-radius: 0.25rem;
     z-index: 1000;
     font-size: 0.9rem;
   }
   ```

---

## Additional Controls & Dark‐Mode Requirements
1. **Playback Speed Toggle**  
   ```js
   // In uiControls.js
   const speeds = [1.0, 0.75, 0.5];
   let speedIndex = 0;
   document.getElementById('speedToggle').addEventListener('click', () => {
     speedIndex = (speedIndex + 1) % speeds.length;
     const newRate = speeds[speedIndex];
     document.getElementById('dictationAudio').playbackRate = newRate;
     document.getElementById('speedToggle').textContent = \`\${Math.round(newRate * 100)}%\`;
   });
   ```

2. **Dark‐Mode Styles**  
   - Dark backgrounds (#1E1E1E, #2A2A2A), light text (#E0E0E0, #FFF).  
   - Buttons: consistent dark gray with an orange focus ring.  

3. **Shortcuts (Control Key)**  
   - Bind **Ctrl+Enter**, **Ctrl+←**, **Ctrl+→**, **Ctrl+↑** for Play/Pause, Previous, Next, Repeat.  
   - No ⌘ bindings to avoid OS conflicts.  

4. **Mobile vs Desktop Differences**  
   - Hide “Aa” on mobile.  
   - Mobile default: case‐insensitive.  
   - Keep the Repeat button visible on all devices.  

---

## Deployment & Teachable Embedding
1. **Static Hosting on GitHub Pages**  
   - Push `main` or `gh-pages` branch with following structure:  
     ```
     / (root)
     ├─ index.html
     ├─ css/styles.css
     ├─ js/(all JS files)
     ├─ lib/(jsdiff, mousetrap, tippy, lodash)
     ├─ audio/(lessonID.mp3 files pushed via Git LFS, ≤ 10 MB each)
     ├─ vtt/(lessonID.vtt files)
     ├─ LICENSES/(all third‐party license texts)
     └─ README.md
     ```
   - Use relative URLs in `index.html`:  
     ```html
     <audio src="audio/lesson1.mp3"></audio>
     <script type="module" src="js/main.js"></script>
     ```
   - Ensure `README.md` includes build & attribution instructions (license notices).

2. **Teachable Embedding via `<iframe>`**  
   ```html
   <iframe 
     src="https://<username>.github.io/<repo-name>/index.html?lesson=course1-lesson05" 
     width="100%" 
     height="700" 
     style="border:none;" 
     sandbox="allow-scripts allow-same-origin" 
     title="German Dictation Exercise">
   </iframe>
   ```
   - **Query Parameters**: Use `?lesson=course1-lesson05` to specify which audio/VTT to load. The app’s `main.js` will parse `window.location.search` to extract `lessonID` and load `audio/${lessonID}.mp3` & `vtt/${lessonID}.vtt`.  

3. **Sandboxing**  
   - `sandbox="allow-scripts allow-same-origin"` restricts the iframe so it can only run scripts and fetch resources from the same origin. It cannot navigate parent pages, submit forms to other domains, or open popups.  
   - **Explanation**:  
     - `allow-scripts`: Allows JavaScript to run in the iframe.  
     - `allow-same-origin`: Allows the iframe to access resources (JS/CSS/VTT/MP3) from its own origin (GitHub Pages domain).  
     - Without `allow-same-origin`, the app cannot fetch its VTT or audio files.  
     - Other sandbox flags (like `allow-forms`) are not needed here.  

4. **Dynamic VTT Selection**  
   - In `main.js`:
     ```js
     const params = new URLSearchParams(window.location.search);
     const lessonID = params.get('lesson'); // e.g., "course1-lesson05"
     const audioSrc = \`audio/\${lessonID}.mp3\`;
     const vttSrc = \`vtt/\${lessonID}.vtt\`;

     document.addEventListener('DOMContentLoaded', async () => {
       try {
         const cues = await loadAudioAndVTT(audioSrc, vttSrc);
         initializeState(cues);
         setupUI();
       } catch (err) {
         displayError('Could not load lesson. Please check the lesson ID or your internet connection.');
       }
     });
     ```
   - Lessons across four courses can each have a unique lessonID, e.g., `course2-lesson12.vtt` & `course2-lesson12.mp3`. The GitHub repo hosts all VTT/audio pairs; Teachable’s iframe URL sets `lesson=XYZ`.

5. **HTTPS & CORS**  
   - GitHub Pages serves over HTTPS by default.  
   - Since all resources (audio, VTT, JS, CSS) come from the same HTTPS origin, no CORS issues arise.  

6. **Testing & Validation**  
   - Verify loading via GitHub Pages URL in a private window.  
   - Embed in Teachable, confirm audio and VTT load.  
   - Test on desktop and mobile, ensuring no mixed‐content or sandbox errors.  

---

## Multiple Lessons & Dynamic VTT Selection
- **Structure**: Place audio and VTT files under `audio/` and `vtt/` folders, named by lessonID.  
- **URL Scheme**: When embedding, append `?lesson=<lessonID>` to the iframe `src`.  
- **App Logic** (main.js):
  1. Parse `window.location.search` → extract `lessonID`.  
  2. Compute `audioSrc` = `audio/${lessonID}.mp3`, `vttSrc` = `vtt/${lessonID}.vtt`.  
  3. Call `loadAudioAndVTT(audioSrc, vttSrc)`. If the files are missing, display an error message.  
  4. Initialize state and UI with the cues from that VTT.  
  5. All subsequent logic (typing, diffing, results) works per that lesson’s transcript.

Example embedding all four courses in Teachable (one content block per lesson):
```html
<iframe 
  src="https://<username>.github.io/dictation-app/index.html?lesson=course1-lesson01" 
  width="100%" 
  height="700" 
  style="border:none;" 
  sandbox="allow-scripts allow-same-origin" 
  title="German Dictation: Course 1, Lesson 1">
</iframe>
```

Repeat for each lesson, updating `lesson=` accordingly.

---

> **End of Document**.

Feel free to open this Markdown file in Visual Studio Code for reference during development.  
