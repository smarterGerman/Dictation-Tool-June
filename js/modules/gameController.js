/**
 * Check if all words in the current segment have been matched
 * @returns {boolean} True if all words are matched
 */
function checkAllWordsMatched() {
  // Get all the reference words
  const refWords = currentReferenceText.trim().split(/\s+/);
  
  // Get word elements with their match status
  const wordElements = referenceMapRow.querySelectorAll('.word-placeholder');
  
  // Count matched words
  let matchedCount = 0;
  for (let i = 0; i < wordElements.length; i++) {
    if (wordElements[i].classList.contains('word-correct') || 
        wordElements[i].classList.contains('word-misspelled')) {
      matchedCount++;
    }
  }
  
  // All words are matched
  if (matchedCount >= refWords.length) {
    // CHANGE: Instead of auto-advancing, show a continue button
    showContinueButton();
    return true;
  }
  
  return false;
}

/**
 * Show a continue button when segment is completed
 */
function showContinueButton() {
  // Check if button already exists
  if (document.getElementById('continue-button')) return;
  
  // Create continue button
  const continueButton = document.createElement('button');
  continueButton.id = 'continue-button';
  continueButton.classList.add('btn', 'btn-success', 'mt-3');
  continueButton.innerHTML = 'Continue to Next Sentence';
  
  // Add event listener to advance when clicked
  continueButton.addEventListener('click', () => {
    // Remove the button
    continueButton.remove();
    
    // Now advance to next segment
    advanceToNextSegment();
  });
  
  // Add to DOM - insert after the submit button
  const submitButton = document.querySelector('.submit-button') || 
                      document.getElementById('submit-button');
  if (submitButton && submitButton.parentNode) {
    submitButton.parentNode.insertBefore(continueButton, submitButton.nextSibling);
  } else {
    // Fallback - add at bottom of input area
    const inputArea = document.querySelector('.input-area') || 
                      document.querySelector('.input-container');
    if (inputArea) {
      inputArea.appendChild(continueButton);
    }
  }
  
  // Optional: Add visual feedback that the segment is complete
  const inputField = document.getElementById('user-input');
  if (inputField) {
    inputField.classList.add('segment-completed');
    // Add a placeholder message
    inputField.setAttribute('placeholder', 'Segment complete! Click Continue to proceed.');
  }
}

/**
 * Process the user's input and update the display
 */
function processUserInput() {
  // Existing code for processing input...
  
  // Update the reference mapping display
  updateReferenceMappingDisplay(referenceMapRow, result, currentReferenceText);
  
  // Check if all words are matched
  if (checkAllWordsMatched()) {
    // Don't auto-advance anymore - the continue button will handle this
    // REMOVE any auto-advancing code here
  }
}

/**
 * Advance to the next segment when continue button is clicked
 */
function advanceToNextSegment() {
  currentSegmentIndex++;
  
  if (currentSegmentIndex < referenceSentences.length) {
    // Move to next segment
    loadCurrentSegment();
    updateSegmentCounter();
  } else {
    // End of exercise
    displayCompletionMessage();
  }
  
  // Clear the input field
  const inputField = document.getElementById('user-input');
  if (inputField) {
    inputField.value = '';
    inputField.classList.remove('segment-completed');
    inputField.setAttribute('placeholder', 'Type here...');
  }
}