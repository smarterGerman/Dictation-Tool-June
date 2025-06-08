# Refactoring Plan for Dictation Tool

---

## Phase 1: Fix Immediate Errors and Add Defensive Programming

1. **Fix undefined variable issues**
    - Add proper initialization for `substringStart`
    - Ensure `cleanInput` and other variables are defined before use
    - Check for other places where variables might be used before definition
2. **Add defensive checks**
    - Add null/undefined checks for all object properties
    - Validate array indices before access
3. **Implement basic error handling**
    - Add try/catch blocks around critical sections
    - Implement graceful fallbacks for failures
4. **Add debug logging**
    - Create logging system for alignment operations
    - Add visual feedback for debugging alignment issues

---

## Phase 2: Improve State Management

1. **Create explicit state objects**
    - Define clear interfaces for alignment results
    - Maintain consistent state structure
2. **Add proper initialization**
    - Create initialization functions for all modules
    - Ensure variables are properly scoped and initialized
3. **Implement clear data flow**
    - Document data transformation between functions
    - Create explicit passing of mapping data
4. **Extract alignment logic**
    - Move alignment code to dedicated module
    - Create clear API for text comparison

---

## Phase 3: Split Responsibilities

1. **Extract character comparison logic**
    - Create separate service for character matching
    - Decouple comparison from UI updates
2. **Create dedicated mapping class**
    - Implement character-by-character mapping system
    - Add proper error states and validation
3. **Move text transformation logic**
    - Create utility module for text transformations
    - Standardize punctuation and case handling
    - Consolidate similar text cleaning patterns into single utility functions
4. **Create clear interfaces**
    - Define contracts between text processing and UI
    - Document expected inputs/outputs

---

## Phase 4: Standardize Alignment Approaches

1. **Replace ad-hoc alignment code**
    - Implement consistent algorithm across codebase
    - Remove duplicate alignment logic
2. **Create unified special character handling**
    - Standardize handling of digraphs and special characters
    - Create configurable character equivalence system
3. **Standardize transformation maps**
    - Create formal definition for transformations
    - Ensure consistent usage throughout the code
4. **Implement proper substring matching**
    - Create robust algorithm for partial matches
    - Handle edge cases with proper alignment

---

## Phase 5: Improve Error Handling and Edge Cases

1. **Add explicit error states**
    - Create visual indicators for alignment failures
    - Add user-friendly error messages
2. **Implement fallback behaviors**
    - Define graceful degradation for alignment failures
    - Add recovery mechanisms for common issues
3. **Add corner case handling**
    - Support empty input, all-punctuation cases
    - Handle words with mixed scripts or symbols
    - Add specific tests for edge cases
4. **Add validation**
    - Validate all inputs before processing
    - Create state transition validation

---

## Phase 6: Optimize and Clean Up

1. **Review performance bottlenecks**
    - Profile and optimize slow functions
    - Improve DOM manipulation efficiency
2. **Remove duplicate code**
    - Create shared utilities for common operations
    - Consolidate similar functions
3. **Add comprehensive documentation**
    - Document all public functions and parameters
    - Create architecture diagrams
4. **Create automated tests**
    - Unit tests for core functionality
    - Integration tests for UI components
    - Add explicit tests for error cases and edge conditions

---

## Implementation Strategy

- Make small, focused changes
- Test thoroughly after each change
- Document new issues as they're discovered
- Proceed only when current step is stable
- Maintain a change log for reference

---

# Refactoring: Consistent German Word Normalization and Matching (2025-06-08)

## Summary

- All word matching, placeholder mapping, and feedback logic now use a single normalization pipeline via `normalizeForComparison`.
- This pipeline applies:
  - German special character transforms (ae→ä, etc.)
  - Only capital B in the middle/end of a word → ß
  - Never ss→ß, never ä→ae, etc.
  - Punctuation stripping
  - Whitespace normalization
  - Case sensitivity according to the Aa toggle
- All modules (`wordMatcher.js`, `wordComparisonService.js`, `inputProcessor.js`, `uiManager.js`) now use this normalization for all word comparisons and UI feedback.
- This guarantees robust, predictable, and user-aligned feedback for all input/reference combinations, including edge cases.

## Implementation

- Added/updated `normalizeForComparison` in `textNormalizer.js`.
- Refactored all word matching and UI feedback logic to use this function.
- Updated placeholder generation and mapping to use normalized forms.
- All tests and UI scenarios should now behave consistently.