/**
 * Camera Utils
 * 
 * Pure utility functions for camera calculations.
 * 
 * @module device-camera/utils
 */

import type { EasingType } from "../types";

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

/**
 * Easing functions library - cinematic-grade timing curves.
 * Input: t (0-1), Output: eased value (0-1)
 */
export const easingFunctions: Record<EasingType, (t: number) => number> = {
    "linear": (t) => t,

    "ease-in": (t) => t * t * t,

    "ease-out": (t) => 1 - Math.pow(1 - t, 3),

    "ease-in-out": (t) => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2,

    "bounce": (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    "cinematic": (t) => {
        // Custom "cinematic" curve: ease-in for first 20%, linear 60%, ease-out last 20%
        if (t < 0.2) {
            const localT = t / 0.2;
            return 0.1 * (localT * localT);
        } else if (t > 0.8) {
            const localT = (t - 0.8) / 0.2;
            return 0.8 + 0.2 * (1 - Math.pow(1 - localT, 2));
        } else {
            return 0.1 + (t - 0.2) * (0.7 / 0.6);
        }
    },

    "expoOut": (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },

    "spring": (t) => {
        // Simplified spring without configurable parameters
        const w = 4.5; // frequency
        const decay = 0.25;
        return 1 - Math.exp(-decay * t * 10) * Math.cos(w * t * Math.PI * 2);
    },
};

/**
 * Apply easing to a progress value.
 * 
 * @param progress - Raw progress (0-1)
 * @param easing - Easing type
 * @returns Eased progress (0-1)
 */
export function applyEasing(progress: number, easing: EasingType = "ease-out"): number {
    const fn = easingFunctions[easing] || easingFunctions["ease-out"];
    return fn(Math.max(0, Math.min(1, progress)));
}

// =============================================================================
// MATH UTILITIES
// =============================================================================

/**
 * Linear interpolation between two values.
 * 
 * @param from - Start value
 * @param to - End value
 * @param t - Progress (0-1)
 * @returns Interpolated value
 */
export function lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calculate progress with clamping.
 */
export function getProgress(t: number, startFrame: number, endFrame: number): number {
    const duration = endFrame - startFrame;
    if (duration <= 0) return 1;
    const raw = (t - startFrame) / duration;
    return clamp(raw, 0, 1);
}

// =============================================================================
// SEEDED RANDOM (FOR DETERMINISTIC SHAKE)
// =============================================================================

/**
 * Seeded random number generator.
 * Same seed = same sequence of "random" numbers.
 * Uses Mulberry32 algorithm - fast and good distribution.
 * 
 * @param seed - Initial seed value
 * @returns Function that returns next random number (0-1)
 */
export function seededRandom(seed: number): () => number {
    return () => {
        let t = seed += 0x6d2b79f5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Generate shake offset for a given frame.
 * Returns values between -1 and 1.
 * 
 * @param frame - Current frame
 * @param seed - Base seed
 * @param frequency - Shake frequency (cycles per second)
 * @param fps - Frames per second
 */
export function getShakeOffset(
    frame: number,
    seed: number,
    frequency: number,
    fps: number = 30
): { x: number; y: number } {
    const phase = (frame * frequency) / fps;
    const x = Math.sin(phase * Math.PI * 2);
    const y = Math.cos(phase * Math.PI * 2 * 1.3); // Slightly different frequency for Y
    return { x, y };
}
