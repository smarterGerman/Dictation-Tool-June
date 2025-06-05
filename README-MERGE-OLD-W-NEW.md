# Implementation Plan: Merging Old and New Word Matching Systems

This plan outlines how to combine the proven algorithms from our old dictation matching system with the better code organization of our new modular system.

## Key Principles

1. **Use existing files** - Modify existing files instead of creating duplicates
2. **Keep what works** - Preserve the algorithms from the old system that worked perfectly
3. **Maintain modular structure** - Keep the clean organization of the new system
4. **Reference text approach** - Show only reference text with appropriate highlighting
5. **Keep hardcoded values** - Maintain the thresholds that are proven to work

## Implementation Plan

### Phase 1: Core Algorithm Implementation (5 days)

#### 1.1 Review Existing Files (1 day)
- Identify all relevant files in both old and new systems
- Document which algorithms need to be ported
- Map old functions to new module structure

#### 1.2 Update Text Normalization (1 day)
- Examine existing `js/modules/textComparison/textNormalizer.js`
- Replace with or merge in the German handling from the old system
- Ensure all special character transformations are preserved

#### 1.3 Update Similarity Scoring (1 day)
- Modify `js/modules/textComparison/similarityScoring.js`
- Implement the proven Levenshtein and scoring logic from old system
- Keep the hardcoded thresholds (e.g., 0.3 minimum match)

#### 1.4 Update Word Matcher (1 day)
- Modify `js/modules/textComparison/wordMatcher.js`
- Port the word alignment algorithm from the old system
- Ensure out-of-order typing works correctly

#### 1.5 Update Input Processor (1 day)
- Modify `js/modules/textComparison/inputProcessor.js`
- Integrate the main processing function from the old system
- Preserve the structure that worked with the UI manager

### Phase 2: UI Integration (5 days)

#### 2.1 Update UI Manager (2 days)
- Modify existing `js/modules/uiManager.js`
- Implement the reference-text-only display approach
- Show reference text with highlighting based on user input
- Add CSS classes for different word statuses

#### 2.2 Update Input Manager (2 days)
- Modify existing `js/modules/inputManager.js`
- Integrate with the updated comparison system
- Implement debounced input processing if not already present

#### 2.3 Update Results Screen (1 day)
- Modify existing results display
- Use the detailed statistics from the word matching system
- Keep consistent with the rest of the UI

## Test Cases from Old System

Use these examples to verify correct functionality:

### Example 1: Out-of-order Typing
```
Reference text: "Es gibt viel zu tun"
User input: "zu gibt Es tun"
Expected: All words except "viel" marked as correct, "viel" as missing
```

### Example 2: Misspelled Words
```
Reference text: "Das Wetter ist schön"
User input: "Das Weter ist schon"
Expected: "Weter" marked as misspelled, "schon" marked as misspelled
```

### Example 3: Extra Words
```
Reference text: "Die Katze schläft"
User input: "Die kleine Katze schläft gerne"
Expected: "kleine" and "gerne" marked as extra words
```

## Benefits of This Approach

1. **Proven reliability** - Using the algorithms that are known to work
2. **Maintainable codebase** - Preserving the clean modular structure
3. **Appropriate UI** - Showing only reference text with highlighting
4. **No duplication** - Modifying existing files instead of creating new ones
5. **Consistent experience** - Maintaining the behavior users expect