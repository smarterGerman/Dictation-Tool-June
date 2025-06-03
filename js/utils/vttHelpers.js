/**
 * Helper functions specific to VTT processing
 */

/**
 * Format a time value in seconds to VTT format (HH:MM:SS.mmm)
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string in VTT format
 */
export function formatVTTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

/**
 * Generate a simple VTT string from an array of segments
 * @param {Array} segments - Array of {startTime, endTime, text} objects
 * @returns {string} - VTT file content
 */
export function generateVTTContent(segments) {
    let content = 'WEBVTT\n\n';
    
    segments.forEach((segment, index) => {
        const startTime = formatVTTTime(segment.startTime);
        const endTime = formatVTTTime(segment.endTime);
        
        content += `${startTime} --> ${endTime}\n`;
        content += `${segment.text}\n\n`;
    });
    
    return content;
}

/**
 * Check if a time falls within a cue's time range
 * @param {number} time - Time in seconds to check
 * @param {Object} cue - Cue object with startTime and endTime
 * @param {number} tolerance - Time tolerance in seconds
 * @returns {boolean} - True if time is within cue range
 */
export function isTimeInCue(time, cue, tolerance = 0.2) {
    return time >= cue.startTime - tolerance && time <= cue.endTime + tolerance;
}

/**
 * Find the cue that contains a specific time
 * @param {number} time - Time in seconds
 * @param {Array} cues - Array of cue objects
 * @param {number} tolerance - Time tolerance in seconds
 * @returns {Object|null} - The cue object or null if not found
 */
export function findCueAtTime(time, cues, tolerance = 0.2) {
    return cues.find(cue => isTimeInCue(time, cue, tolerance)) || null;
}
