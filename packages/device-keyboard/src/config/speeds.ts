/**
 * Typing Speed Presets
 * 
 * Speed configurations for realistic typing simulation.
 */

// =============================================================================
// SPEED PRESETS (chars per minute)
// =============================================================================

export const SPEED_PRESETS = {
    /** All characters appear instantly */
    instant: Infinity,
    /** Very fast typing: 200 cpm (~3.3 chars/sec) */
    fast: 200,
    /** Normal typing: 80 cpm (~1.3 chars/sec) */
    normal: 80,
    /** Slow typing: 40 cpm (~0.67 chars/sec) */
    slow: 40,
    /** Hunt and peck: 20 cpm (~0.33 chars/sec) */
    hunt_peck: 20,
} as const;

export type SpeedPreset = keyof typeof SPEED_PRESETS;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convert speed preset or number to chars per minute.
 */
export function getSpeedCpm(speed: number | SpeedPreset): number {
    if (typeof speed === "number") {
        return speed;
    }
    return SPEED_PRESETS[speed];
}

/**
 * Calculate frame delay between characters.
 * 
 * @param speed - Speed in cpm or preset name
 * @param fps - Frames per second
 * @returns Number of frames to wait between characters
 */
export function getFrameDelay(speed: number | SpeedPreset, fps: number): number {
    const cpm = getSpeedCpm(speed);
    if (cpm === Infinity) return 0;

    const cps = cpm / 60;           // chars per second
    return Math.round(fps / cps);   // frames per char
}

/**
 * Calculate total duration (in frames) for typing text.
 * 
 * @param text - Text to type
 * @param speed - Speed in cpm or preset name
 * @param fps - Frames per second
 * @returns Total frame duration
 */
export function getTypingDuration(
    text: string,
    speed: number | SpeedPreset,
    fps: number
): number {
    const delay = getFrameDelay(speed, fps);
    return text.length * delay;
}

/**
 * Add variation to frame delay for natural typing.
 * 
 * @param baseDelay - Base delay in frames
 * @param seed - Random seed for determinism
 * @returns Varied delay (±20%)
 */
export function applyVariation(baseDelay: number, seed: number): number {
    // Simple pseudo-random from seed
    const variation = ((seed * 9301 + 49297) % 233280) / 233280;
    const factor = 0.8 + (variation * 0.4); // 0.8 to 1.2
    return Math.round(baseDelay * factor);
}
