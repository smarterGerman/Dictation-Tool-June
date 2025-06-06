# HELPME.md - Dictation Checker Text Processing System

## Overview

The Dictation Checker implements a sophisticated text input handling system that allows users to type words in any order with various misspellings while still matching them correctly to their expected positions in reference text. This document details how the system works and how to implement it in a new tool.

## 1. Core Architecture

The text handling system consists of several integrated components:

# German Dictation Tool - Usage Guide

## Word Matching System

The dictation tool uses an advanced word matching system designed specifically for German language learning:

### Key Features

- **Flexible Typing Order**: Words are matched regardless of the order you type them
- **German Character Handling**: Multiple ways to type umlauts and special characters
  - `ae` → `ä`, `oe` → `ö`, `ue` → `ü` 
  - `a:` → `ä`, `o:` → `ö`, `u:` → `ü`
  - `a/` → `ä`, `o/` → `ö`, `u/` → `ü`
  - `s:` or `s/` → `ß`
- **Misspelled Word Detection**: Words with typos are highlighted but still matched to their correct position
- **Short Word Support**: All German words, including short ones (in, an, zu, etc.) are properly matched
- **Partial Word Matching**: As you type, the system shows partial matches

### Feedback Colors

- **Green**: Correctly spelled words
- **Red**: Misspelled characters or words
- **Missing letter indicators**: When a letter is missing from a word, the system shows the correct position

## Usage Tips

1. You can type words in any order - the system will match them correctly
2. For umlauts, type either the letter followed by 'e' (ae), colon (a:), or slash (a/)
3. If you're unsure about spelling, type what you hear - the system will show the correct form
4. Submit your answer when finished with the Enter key or Submit button
