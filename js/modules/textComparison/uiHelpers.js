/**
 * UI Helper functions for text comparison
 * Contains helpers for DOM manipulation and UI feedback
 */

/**
 * Handle special case for "sh" vs "sch" pattern
 * @param {HTMLElement} wordElement - The word element to update
 * @param {string} inputWord - The original input word
 * @param {string} transformedInputWord - The transformed input word
 * @param {string} refWord - The reference word
 */
export function handleShPattern(wordElement, inputWord, transformedInputWord, refWord) {
  // For "sh" vs "sch" cases, reveal the "sh" as correct and hide the "c"
  // const letterPlaceholders = wordElement.querySelectorAll('.letter-placeholder');
  // if (letterPlaceholders.length > 0) {
  //   letterPlaceholders[0].classList.add('correct');
  // }
  // if (letterPlaceholders.length > 1) {
  //   letterPlaceholders[1].classList.add('correct');
  // }
}
