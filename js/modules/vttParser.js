/**
 * Module for parsing and handling WebVTT files
 */
import { config } from './config.js';

/**
 * Parse a VTT file into an array of cue objects
 * @param {string} vttUrl - URL of the VTT file to parse
 * @returns {Promise<Array>} - Promise resolving to array of cue objects
 */
export async function parseVTT(vttUrl) {
    try {
        const response = await fetch(vttUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to load VTT file: ${response.status} ${response.statusText}`);
        }
        
        const vttContent = await response.text();
        return parseVTTContent(vttContent);
    } catch (error) {
        console.error('Error parsing VTT file:', error);
        throw error;
    }
}

/**
 * Parse VTT content string into an array of cue objects
 * @param {string} vttContent - String content of a VTT file
 * @returns {Array} - Array of cue objects with start time, end time, and text
 */
export function parseVTTContent(vttContent) {
    // Split content into lines and filter out empty lines
    const lines = vttContent.split('\n').filter(line => line.trim() !== '');
    
    // First line must be "WEBVTT"
    if (!lines[0].includes('WEBVTT')) {
        throw new Error('Invalid VTT format: Missing WEBVTT header');
    }
    
    const cues = [];
    let currentCue = null;
    let collectingCueText = false;
    
    // Skip the first line (WEBVTT)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and metadata lines
        if (line.startsWith('NOTE') || line.startsWith('STYLE')) {
            continue;
        }
        
        // Look for timestamp line: "00:00:00.000 --> 00:00:00.000"
        if (line.includes('-->')) {
            collectingCueText = true;
            const [startTime, endTime] = line.split('-->').map(timeStr => parseVTTTimestamp(timeStr.trim()));
            
            currentCue = {
                startTime,
                endTime,
                text: ''
            };
            continue;
        }
        
        // If we're collecting cue text and this isn't a timing or metadata line
        if (collectingCueText && currentCue && line !== '') {
            // If the cue already has text, append a space and the new line
            if (currentCue.text) {
                currentCue.text += ' ' + line;
            } else {
                currentCue.text = line;
            }
            
            // Check if the next line is a new cue or empty line
            if (i === lines.length - 1 || lines[i + 1].includes('-->') || lines[i + 1].trim() === '') {
                cues.push(currentCue);
                collectingCueText = false;
            }
        }
    }
    
    return cues;
}

/**
 * Convert VTT timestamp string to seconds
 * @param {string} timestamp - VTT timestamp (HH:MM:SS.mmm)
 * @returns {number} - Time in seconds
 */
export function parseVTTTimestamp(timestamp) {
    // Handle formats: 00:00:00.000 or 00:00.000
    const parts = timestamp.split(':');
    let hours = 0, minutes = 0, seconds = 0;
    
    if (parts.length === 3) {
        // Format: 00:00:00.000
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        seconds = parseFloat(parts[2]);
    } else if (parts.length === 2) {
        // Format: 00:00.000
        minutes = parseInt(parts[0], 10);
        seconds = parseFloat(parts[1]);
    } else {
        throw new Error(`Invalid timestamp format: ${timestamp}`);
    }
    
    return hours * 3600 + minutes * 60 + seconds;
}
