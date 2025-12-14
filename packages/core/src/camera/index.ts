/**
 * Camera Module - Cinematic Camera System for Tokovo
 * 
 * This module provides production-grade camera effects including:
 * - ZOOM: Scale with configurable origin and easing
 * - PAN: Translation with smooth easing
 * - SHAKE: Screen shake with frequency, intensity, and decay
 * - FOCUS: Target-based zoom (app, notification, message, point)
 * - CUT: Instant transitions between views
 * - RESET: Smooth return to default camera position
 */

import {
    CameraState,
    CameraTransform,
    CameraEffect,
    ActiveCameraEffect,
    EasingType,
    DEFAULT_CAMERA_TRANSFORM,
    CameraZoomEffect,
    CameraPanEffect,
    CameraShakeEffect,
    CameraFocusEffect,
    CameraResetEffect,
} from "../types";

import { getAnchorFraming } from "./presets";

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

/**
 * Easing functions library - cinematic-grade timing curves
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

    "elastic": (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },

    // Cinematic S-curve - smooth start, linear middle, smooth end
    // Inspired by film camera movements
    "cinematic": (t) => {
        // Custom bezier-like curve for film-quality motion
        if (t < 0.2) {
            // Smooth ease-in for first 20%
            return 0.5 * Math.pow(t / 0.2, 2) * 0.2;
        } else if (t > 0.8) {
            // Smooth ease-out for last 20%
            const localT = (t - 0.8) / 0.2;
            return 0.8 + 0.2 * (1 - Math.pow(1 - localT, 2));
        } else {
            // Linear middle section (60%)
            return 0.1 + (t - 0.2) * (0.7 / 0.6);
        }
    },

    // ExpoOut - Fast deceleration (for impact/emotional hits)
    // Used by v1 "impact" preset
    "expoOut": (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
};

/**
 * Apply easing to a progress value
 */
export function applyEasing(progress: number, easing: EasingType = "ease-out"): number {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    return easingFunctions[easing](clampedProgress);
}

// =============================================================================
// SEEDED RANDOM FOR DETERMINISTIC SHAKE
// =============================================================================

/**
 * Seeded random number generator for deterministic shake effects
 * Uses mulberry32 algorithm for speed and quality
 */
function seededRandom(seed: number): () => number {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Generate shake offset for a given frame
 * Returns values between -1 and 1
 */
function getShakeOffset(frame: number, seed: number, frequency: number, fps: number = 30): { x: number; y: number } {
    // Calculate how many shake cycles per frame
    const cyclesPerSecond = frequency;
    const cyclesPerFrame = cyclesPerSecond / fps;

    // Create deterministic random based on frame and seed
    const rng = seededRandom(seed + Math.floor(frame * cyclesPerFrame));

    // Generate offset (-1 to 1)
    const x = (rng() - 0.5) * 2;
    const y = (rng() - 0.5) * 2;

    return { x, y };
}

// =============================================================================
// CAMERA CONTROLLER
// =============================================================================

/**
 * CameraController - Computes camera transforms at any given frame
 * 
 * This is the heart of the cinematic system. It takes:
 * - Current camera state (with active effects)
 * - Current frame number
 * 
 * And produces a final CameraTransform with all effects composited.
 */
export class CameraController {
    private fps: number;

    // Memoization cache for performance (LRU with max 500 entries)
    private transformCache = new Map<string, CameraTransform>();
    private readonly MAX_CACHE_SIZE = 500;

    constructor(fps: number = 30) {
        this.fps = fps;
    }

    /**
     * Generate cache key from camera state and frame
     */
    private getCacheKey(state: CameraState, t: number): string {
        // Key includes frame number and effect IDs with their start frames
        const effectsKey = state.activeEffects
            .map(e => `${e.id}:${e.startFrame}:${e.endFrame}`)
            .join('|');
        return `${t}:${effectsKey}`;
    }

    /**
     * Compute the final camera transform at frame t
     * 
     * Effects are applied in layers:
     * 1. Completed effects that ended before t - their final state persists
     * 2. Active effects at time t - animated based on progress
     * 
     * For overlapping effects:
     * - Scale is multiplicative (zoom 1.2 + zoom 1.5 = zoom 1.8)
     * - Translate is additive
     * - Origin uses the most recent effect's origin
     * - Shake is additive
     * 
     * Memoized for performance.
     */
    computeTransform(state: CameraState, t: number): CameraTransform {
        // Check cache first
        const cacheKey = this.getCacheKey(state, t);
        const cached = this.transformCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Start with default transform
        const transform: CameraTransform = { ...DEFAULT_CAMERA_TRANSFORM };

        // Sort effects by start time for consistent processing
        const sortedEffects = [...state.activeEffects].sort((a, b) => a.startFrame - b.startFrame);

        // Apply each effect using the helper methods
        for (const activeEffect of sortedEffects) {
            // Skip effects that haven't started yet
            if (t < activeEffect.startFrame) continue;

            // Apply effect using the unified method
            this.applyEffect(transform, activeEffect, t);
        }

        // Cache the result
        this.transformCache.set(cacheKey, transform);

        // LRU eviction - remove oldest entries if over limit
        if (this.transformCache.size > this.MAX_CACHE_SIZE) {
            const firstKey = this.transformCache.keys().next().value;
            if (firstKey) {
                this.transformCache.delete(firstKey);
            }
        }

        return transform;
    }

    /**
     * Clear the transform cache (call when starting a new video)
     */
    clearCache(): void {
        this.transformCache.clear();
    }

    /**
     * Apply a single effect to the transform
     */
    private applyEffect(transform: CameraTransform, activeEffect: ActiveCameraEffect, t: number): void {
        const { effect, startFrame, endFrame } = activeEffect;
        const duration = endFrame - startFrame;
        const localT = duration > 0 ? (t - startFrame) / duration : 1;

        switch (effect.type) {
            case "ZOOM":
                this.applyZoom(transform, effect, localT);
                break;
            case "PAN":
                this.applyPan(transform, effect, localT);
                break;
            case "SHAKE":
                this.applyShake(transform, effect, localT, t, startFrame);
                break;
            case "FOCUS":
                this.applyFocus(transform, effect, localT);
                break;
            case "ANCHOR_FOCUS":
                // Semantic anchor focus - applies zoom based on preset
                // The anchor → origin resolution happens in renderer's useCameraEngine
                // Here we just apply the scale and easing
                this.applyAnchorFocus(transform, effect as any, localT, t, startFrame);
                break;
            case "RESET":
                this.applyReset(transform, effect, localT);
                break;
            // CUT is handled by the reducer, not here
        }
    }

    /**
     * ZOOM effect - scale with origin
     */
    private applyZoom(transform: CameraTransform, effect: CameraZoomEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");

        // Interpolate from current scale to target scale
        const startScale = transform.scale;
        const targetScale = effect.scale;
        transform.scale = startScale + (targetScale - startScale) * easedProgress;

        // Set transform origin if specified
        if (effect.originX !== undefined) {
            transform.originX = effect.originX;
        }
        if (effect.originY !== undefined) {
            transform.originY = effect.originY;
        }
    }

    /**
     * PAN effect - translate position
     */
    private applyPan(transform: CameraTransform, effect: CameraPanEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");

        // Add translation (effects are additive for pan)
        transform.translateX += effect.translateX * easedProgress;
        transform.translateY += effect.translateY * easedProgress;
    }

    /**
     * SHAKE effect - screen tremor with decay
     */
    private applyShake(
        transform: CameraTransform,
        effect: CameraShakeEffect,
        progress: number,
        absoluteFrame: number,
        startFrame: number
    ): void {
        const frameInEffect = absoluteFrame - startFrame;
        const seed = effect.seed ?? startFrame; // Use start frame as default seed for determinism

        // Get shake offset for this frame
        const offset = getShakeOffset(frameInEffect, seed, effect.frequency, this.fps);

        // Apply decay (1 = instant decay, 0 = no decay)
        const decay = effect.decay ?? 0.3; // Default 30% decay
        const decayMultiplier = 1 - (progress * decay);

        // Apply intensity and decay
        transform.shakeX += offset.x * effect.intensity * decayMultiplier;
        transform.shakeY += offset.y * effect.intensity * decayMultiplier;
    }

    /**
     * FOCUS effect - zoom to a target
     * Note: Actual target position calculation happens in the renderer
     * Here we just handle the zoom/pan animation
     */
    private applyFocus(transform: CameraTransform, effect: CameraFocusEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");
        const holdDuration = effect.holdDuration ?? 0;

        // If we have a hold duration, adjust the animation curve
        let animProgress = easedProgress;
        if (holdDuration > 0 && progress > 0.5) {
            // Hold at peak for specified duration
            animProgress = 1;
        }

        // Apply zoom (FOCUS is essentially targeted ZOOM)
        const targetScale = effect.scale ?? 1.5;
        transform.scale = 1 + (targetScale - 1) * animProgress;

        // Target-based origin will be set by renderer based on target position
        // For now, we handle point-based targets
        if (effect.target.type === "point") {
            transform.originX = effect.target.x;
            transform.originY = effect.target.y;
        }
    }

    /**
     * ANCHOR_FOCUS effect - Semantic anchor-driven camera
     * 
     * This applies zoom and optional shake based on shot preset.
     * The anchor → origin resolution happens in the renderer's useCameraEngine,
     * which has access to layout state and anchor providers.
     * 
     * Here we apply:
     * - Scale based on preset or explicit value
     * - Shake if specified
     * - Origin from ANCHOR_FRAMING config (Layer 3: Presets)
     * 
     * ARCHITECTURE: Camera Math (Layer 4) does NOT interpret anchor semantics.
     * It receives framing config from presets.ts (Layer 3) via getAnchorFraming().
     */
    private applyAnchorFocus(
        transform: CameraTransform,
        effect: { anchor: string; preset?: string; scale?: number; duration: number; easing?: string; shake?: number },
        progress: number,
        absoluteFrame: number,
        startFrame: number
    ): void {
        const easing = effect.easing as any || "ease-out";
        const easedProgress = applyEasing(progress, easing);

        // Get scale from effect or preset defaults
        const presetScale = this.getPresetScale(effect.preset);
        const targetScale = effect.scale ?? presetScale;

        // Apply zoom
        transform.scale = 1 + (targetScale - 1) * easedProgress;

        // Apply shake if specified
        if (effect.shake && effect.shake > 0) {
            const frameInEffect = absoluteFrame - startFrame;
            const seed = startFrame;
            const frequency = 18;
            const offset = getShakeOffset(frameInEffect, seed, frequency, this.fps);

            // Apply shake with decay
            const decayMultiplier = 1 - progress * 0.6;
            transform.shakeX += offset.x * effect.shake * decayMultiplier;
            transform.shakeY += offset.y * effect.shake * decayMultiplier;
        }

        // Get framing config from Layer 3 (Presets) - NOT hardcoded here!
        // Semantic interpretation ("lastMessage should be lower-third") lives in presets.ts
        const framing = getAnchorFraming(effect.anchor);
        transform.originX = framing.anchorPoint.x;
        transform.originY = framing.anchorPoint.y;
    }

    /**
     * Get default scale for a shot preset
     */
    private getPresetScale(preset?: string): number {
        switch (preset) {
            case "dramatic": return 1.3;
            case "subtle": return 1.08;
            case "snap": return 1.15;
            case "impact": return 1.4;
            case "message": return 1.1;
            case "reset": return 1.0;
            default: return 1.15;
        }
    }

    /**
     * RESET effect - return to default camera position
     */
    private applyReset(transform: CameraTransform, effect: CameraResetEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");

        // Interpolate all values toward defaults
        transform.translateX = transform.translateX * (1 - easedProgress);
        transform.translateY = transform.translateY * (1 - easedProgress);
        transform.scale = transform.scale + (1 - transform.scale) * easedProgress;
        transform.rotation = transform.rotation * (1 - easedProgress);
        transform.originX = transform.originX + (0.5 - transform.originX) * easedProgress;
        transform.originY = transform.originY + (0.5 - transform.originY) * easedProgress;
    }
}

// =============================================================================
// CAMERA EVENT PROCESSING
// =============================================================================

/**
 * Convert a timeline camera event to an ActiveCameraEffect
 */
export function createActiveEffect(
    event: { at: number; kind: "CAMERA"; type: string;[key: string]: any },
    id: string
): ActiveCameraEffect | null {
    const { at, type, ...params } = event;

    // Skip non-effect events
    if (type === "SET_VIEW" || type === "CUT") {
        return null;
    }

    // Build effect based on type
    let effect: CameraEffect;
    const duration = params.duration ?? 30; // Default 1 second at 30fps

    switch (type) {
        case "ZOOM":
            effect = {
                type: "ZOOM",
                scale: params.scale ?? 1,
                originX: params.originX,
                originY: params.originY,
                duration,
                easing: params.easing,
            };
            break;
        case "PAN":
            effect = {
                type: "PAN",
                translateX: params.translateX ?? 0,
                translateY: params.translateY ?? 0,
                relative: params.relative,
                duration,
                easing: params.easing,
            };
            break;
        case "SHAKE":
            effect = {
                type: "SHAKE",
                intensity: params.intensity ?? 10,
                frequency: params.frequency ?? 15,
                decay: params.decay,
                duration,
                seed: params.seed,
            };
            break;
        case "FOCUS":
            effect = {
                type: "FOCUS",
                target: params.target ?? { type: "device" },
                scale: params.scale,
                duration,
                easing: params.easing,
                holdDuration: params.holdDuration,
            };
            break;
        case "RESET":
            effect = {
                type: "RESET",
                duration,
                easing: params.easing,
            };
            break;
        case "ANCHOR_FOCUS":
            // Semantic anchor focus - resolved at render time by useCameraEngine
            // The anchor name is stored and later resolved to a LayoutRect
            effect = {
                type: "ANCHOR_FOCUS",
                anchor: params.anchor ?? "device",
                preset: params.preset,
                scale: params.scale,
                duration,
                easing: params.easing,
                shake: params.shake,
            } as any;  // Cast to any since CameraAnchorFocusEffect is newly added
            break;
        default:
            return null;
    }

    return {
        id,
        effect,
        startFrame: at,
        endFrame: at + duration,
        deviceId: params.deviceId,  // Per-device targeting
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { seededRandom, getShakeOffset };

// Default controller instance
export const defaultCameraController = new CameraController(30);

// Timeline system
export * from "./timeline";

// Presets
export * from "./presets";


