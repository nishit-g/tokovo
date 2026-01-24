/**
 * Camera Utils
 *
 * Pure utility functions for camera calculations.
 *
 * @module device-camera/utils
 */

import type { EasingType, SpringConfig } from "../types";
import { SPRING_PRESETS } from "../types";

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

/**
 * Easing functions library - cinematic-grade timing curves.
 * Input: t (0-1), Output: eased value (0-1)
 */
export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,

  "ease-in": (t) => t * t * t,

  "ease-out": (t) => 1 - Math.pow(1 - t, 3),

  "ease-in-out": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  bounce: (t) => {
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

  cinematic: (t) => {
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

  expoOut: (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  spring: (t: number): number => {
    // Simplified spring without configurable parameters
    const w = 4.5; // frequency
    const decay = 0.25;
    return 1 - Math.exp(-decay * t * 10) * Math.cos(w * t * Math.PI * 2);
  },

  elastic: (t: number): number => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
};

/**
 * Apply easing to a progress value.
 *
 * @param progress - Raw progress (0-1)
 * @param easing - Easing type
 * @returns Eased progress (0-1)
 */
export function applyEasing(
  progress: number,
  easing: EasingType = "ease-out",
): number {
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
export function getProgress(
  t: number,
  startFrame: number,
  endFrame: number,
): number {
  const duration = endFrame - startFrame;
  if (duration <= 0) return 1;
  const raw = (t - startFrame) / duration;
  return clamp(raw, 0, 1);
}

// =============================================================================
// SPRING PHYSICS
// =============================================================================

/**
 * Compute spring physics value at a given frame.
 *
 * This is a pure, deterministic spring simulation that doesn't require
 * React or Remotion hooks. It computes the spring position analytically
 * using the damped harmonic oscillator equation.
 *
 * @param frame - Current frame number (relative to effect start)
 * @param fps - Frames per second
 * @param config - Spring configuration (damping, stiffness, mass)
 * @param from - Starting value (default 0)
 * @param to - Target value (default 1)
 * @returns Interpolated value with spring physics applied
 */
export function springValue(
  frame: number,
  fps: number,
  config: SpringConfig = SPRING_PRESETS.default,
  from: number = 0,
  to: number = 1,
): number {
  const { damping, stiffness, mass, overshootClamping = false } = config;

  // Time in seconds
  const t = frame / fps;

  // Damped harmonic oscillator parameters
  const omega0 = Math.sqrt(stiffness / mass); // Natural frequency
  const zeta = damping / (2 * Math.sqrt(stiffness * mass)); // Damping ratio

  let position: number;

  if (zeta < 1) {
    // Underdamped (oscillatory) - most common for "bouncy" springs
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta); // Damped frequency
    const envelope = Math.exp(-zeta * omega0 * t);
    position =
      1 -
      envelope *
        (Math.cos(omegaD * t) +
          ((zeta * omega0) / omegaD) * Math.sin(omegaD * t));
  } else if (zeta === 1) {
    // Critically damped (fastest without oscillation)
    position = 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
  } else {
    // Overdamped (slow, no oscillation)
    const s1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const s2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
    const c2 = s1 / (s1 - s2);
    const c1 = 1 - c2;
    position = 1 - c1 * Math.exp(s1 * t) - c2 * Math.exp(s2 * t);
  }

  // Clamp overshoot if requested
  if (overshootClamping) {
    position = clamp(position, 0, 1);
  }

  // Interpolate between from and to
  return from + (to - from) * position;
}

/**
 * Get spring progress (0 to 1+) for an effect's duration.
 * Handles the frame-to-progress mapping for effects.
 *
 * @param t - Current frame
 * @param startFrame - Effect start frame
 * @param endFrame - Effect end frame
 * @param fps - Frames per second
 * @param config - Spring configuration
 * @returns Spring-eased progress value (may exceed 1 for overshoot)
 */
export function getSpringProgress(
  t: number,
  startFrame: number,
  endFrame: number,
  fps: number,
  config: SpringConfig = SPRING_PRESETS.default,
): number {
  const elapsed = t - startFrame;
  if (elapsed <= 0) return 0;

  // Use the effect duration to determine spring behavior
  // The spring will try to reach target within the effect duration
  return springValue(elapsed, fps, config);
}

// =============================================================================
// PERLIN-STYLE NOISE (FOR ORGANIC SHAKE)
// =============================================================================

/**
 * 1D Perlin-style noise using cosine interpolation.
 * Deterministic, smooth, and organic-looking.
 *
 * @param x - Input value
 * @param seed - Seed for determinism
 * @returns Noise value between -1 and 1
 */
export function noise1D(x: number, seed: number = 0): number {
  const intX = Math.floor(x);
  const fracX = x - intX;

  // Hash function for pseudo-random gradients
  const hash = (n: number): number => {
    const h = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };

  // Get gradient values at integer points
  const g0 = hash(intX) * 2 - 1;
  const g1 = hash(intX + 1) * 2 - 1;

  // Smoothstep interpolation (quintic curve for smoother result)
  const u = fracX * fracX * fracX * (fracX * (fracX * 6 - 15) + 10);

  // Interpolate between gradients
  return g0 + u * (g1 - g0);
}

/**
 * 2D Perlin-style noise for more complex shake patterns.
 *
 * @param x - X input
 * @param y - Y input
 * @param seed - Seed for determinism
 * @returns Noise value between -1 and 1
 */
export function noise2D(x: number, y: number, seed: number = 0): number {
  // Combine two 1D noise samples for pseudo-2D effect
  // This is simpler than true 2D Perlin but works well for shake
  return noise1D(x + noise1D(y * 0.7, seed + 100) * 0.5, seed);
}

/**
 * Fractal Brownian Motion - layered noise for natural movement.
 * Combines multiple octaves of noise for organic feel.
 *
 * @param x - Input value
 * @param seed - Seed for determinism
 * @param octaves - Number of noise layers (default 3)
 * @param persistence - Amplitude reduction per octave (default 0.5)
 * @returns Noise value (range depends on octaves)
 */
export function fbm(
  x: number,
  seed: number = 0,
  octaves: number = 3,
  persistence: number = 0.5,
): number {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise1D(x * frequency, seed + i * 1000) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue; // Normalize to -1 to 1
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
    let t = (seed += 0x6d2b79f5);
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
  fps: number = 30,
): { x: number; y: number } {
  const phase = (frame * frequency) / fps;
  const x = Math.sin(phase * Math.PI * 2);
  const y = Math.cos(phase * Math.PI * 2 * 1.3); // Slightly different frequency for Y
  return { x, y };
}
