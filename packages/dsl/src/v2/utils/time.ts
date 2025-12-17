/**
 * Time Utilities - Parse time strings to frames
 * 
 * @description Converts time strings ("3s", "500ms") to frame numbers.
 * Uses Math.round() for fractional frames to avoid drift.
 * 
 * @see docs-v2/DSL_REVAMP.md#frame-rounding-rules
 */

/**
 * Parse a time value to frames.
 * 
 * @param time - Time value: "3s", "500ms", or frame number
 * @param fps - Frames per second
 * @returns Frame number (rounded to nearest)
 * 
 * @example
 * parseTimeToFrames("1s", 30) // => 30
 * parseTimeToFrames("500ms", 30) // => 15
 * parseTimeToFrames("1.5s", 30) // => 45
 * parseTimeToFrames(90, 30) // => 90
 */
export function parseTimeToFrames(time: string | number, fps: number): number {
    if (typeof time === "number") {
        return Math.round(time);  // Already frames, just round
    }

    const trimmed = time.trim();

    // Milliseconds: "500ms"
    if (trimmed.endsWith("ms")) {
        const ms = parseFloat(trimmed.slice(0, -2));
        if (isNaN(ms)) {
            throw new Error(`Invalid time format: ${time}`);
        }
        return Math.round((ms / 1000) * fps);
    }

    // Seconds: "3s" or "1.5s"
    if (trimmed.endsWith("s")) {
        const seconds = parseFloat(trimmed.slice(0, -1));
        if (isNaN(seconds)) {
            throw new Error(`Invalid time format: ${time}`);
        }
        return Math.round(seconds * fps);
    }

    // Plain number string: "90"
    const frames = parseFloat(trimmed);
    if (isNaN(frames)) {
        throw new Error(`Invalid time format: ${time}`);
    }
    return Math.round(frames);
}

/**
 * Parse duration string to frames.
 * Alias for parseTimeToFrames.
 */
export const parseDurationToFrames = parseTimeToFrames;

/**
 * Convert frames to seconds.
 */
export function framesToSeconds(frames: number, fps: number): number {
    return frames / fps;
}

/**
 * Convert frames to time string.
 */
export function framesToTimeString(frames: number, fps: number): string {
    const seconds = frames / fps;
    if (seconds < 1) {
        return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(2).replace(/\.?0+$/, "")}s`;
}
