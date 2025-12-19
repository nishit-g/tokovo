/**
 * Effect Processors - Registry pattern for camera effects
 * 
 * Each effect type has a dedicated processor.
 * Processors are pure functions: (context) → transform
 * 
 * @module device-camera/processors
 */

import {
    CameraEffect,
    CameraTransform,
    DEFAULT_TRANSFORM,
    ZoomEffect,
    ShakeEffect,
    FocusEffect,
    TrackEffect,
    ResetEffect,
} from "../types";
import { AnchorSnapshot } from "../anchors/types";
import { resolveAnchorFully } from "../anchors/resolver";
import { applyEasing, lerp, seededRandom } from "../utils";

// =============================================================================
// PROCESSOR INTERFACE
// =============================================================================

export interface EffectProcessorContext {
    /** Current frame */
    t: number;

    /** The effect being processed */
    effect: CameraEffect;

    /** Current transform (accumulator) */
    transform: CameraTransform;

    /** Anchor snapshot for semantic targeting */
    anchorSnapshot?: AnchorSnapshot;

    /** Viewport dimensions */
    viewport?: { width: number; height: number };
}

export interface EffectProcessor {
    /** Effect type this processor handles */
    type: string;

    /** Process the effect and return updated transform */
    process(ctx: EffectProcessorContext): CameraTransform;
}

// =============================================================================
// PROCESSOR IMPLEMENTATIONS
// =============================================================================

function getProgress(t: number, startFrame: number, endFrame: number): number {
    const duration = endFrame - startFrame;
    if (duration <= 0) return 1;
    return Math.max(0, Math.min(1, (t - startFrame) / duration));
}

const zoomProcessor: EffectProcessor = {
    type: "zoom",
    process(ctx): CameraTransform {
        const e = ctx.effect as ZoomEffect;
        const progress = getProgress(ctx.t, e.startFrame, e.endFrame);
        const easedProgress = applyEasing(progress, e.easing ?? "ease-out");

        return {
            ...ctx.transform,
            scale: lerp(1, e.targetScale, easedProgress),
            translateX: ctx.transform.translateX + lerp(0, e.targetX ?? 0, easedProgress),
            translateY: ctx.transform.translateY + lerp(0, e.targetY ?? 0, easedProgress),
            originX: e.originX ?? ctx.transform.originX,
            originY: e.originY ?? ctx.transform.originY,
        };
    },
};

const shakeProcessor: EffectProcessor = {
    type: "shake",
    process(ctx): CameraTransform {
        const e = ctx.effect as ShakeEffect;
        const progress = getProgress(ctx.t, e.startFrame, e.endFrame);

        // Procedural shake using frame as seed
        const seed = e.startFrame + (ctx.t - e.startFrame);
        const rand = seededRandom(seed);

        // Frequency-based oscillation
        const phase = (ctx.t - e.startFrame) * (e.frequency ?? 15) / 30;

        // Decay over time
        const decayFactor = Math.pow(e.decay ?? 0.8, progress * 10);

        // Calculate shake offsets
        const baseX = e.intensityX ?? e.intensity;
        const baseY = e.intensityY ?? e.intensity;

        const shakeX = Math.sin(phase * Math.PI * 2 + rand() * Math.PI) * baseX * decayFactor;
        const shakeY = Math.cos(phase * Math.PI * 2 * 1.3 + rand() * Math.PI) * baseY * decayFactor;

        return {
            ...ctx.transform,
            shakeX: ctx.transform.shakeX + shakeX,
            shakeY: ctx.transform.shakeY + shakeY,
        };
    },
};

const focusProcessor: EffectProcessor = {
    type: "focus",
    process(ctx): CameraTransform {
        const e = ctx.effect as FocusEffect;
        const progress = getProgress(ctx.t, e.startFrame, e.endFrame);
        const easedProgress = applyEasing(progress, e.easing ?? "ease-out");

        // Resolve anchor to origin
        let originX = 0.5;
        let originY = 0.5;
        let targetScale = e.scale ?? 1.15;

        if (ctx.anchorSnapshot && ctx.viewport) {
            const resolved = resolveAnchorFully(
                e.anchorId,
                ctx.anchorSnapshot,
                ctx.anchorSnapshot.appId,
                ctx.viewport
            );
            originX = resolved.originX;
            originY = resolved.originY;
            if (!e.scale) {
                targetScale = resolved.suggestedScale;
            }
        }

        return {
            ...ctx.transform,
            scale: lerp(1, targetScale, easedProgress),
            originX: lerp(0.5, originX, easedProgress),
            originY: lerp(0.5, originY, easedProgress),
        };
    },
};

const trackProcessor: EffectProcessor = {
    type: "track",
    process(ctx): CameraTransform {
        const e = ctx.effect as TrackEffect;
        const progress = getProgress(ctx.t, e.startFrame, e.endFrame);
        const smoothing = e.smoothing ?? 0.18;

        // Resolve current anchor position
        let originX = ctx.transform.originX;
        let originY = ctx.transform.originY;

        if (ctx.anchorSnapshot && ctx.viewport) {
            const resolved = resolveAnchorFully(
                e.anchorId,
                ctx.anchorSnapshot,
                ctx.anchorSnapshot.appId,
                ctx.viewport
            );
            // Smooth follow - interpolate toward anchor
            originX = lerp(ctx.transform.originX, resolved.originX, smoothing);
            originY = lerp(ctx.transform.originY, resolved.originY, smoothing);
        }

        // Ease in/out of tracking
        const easeIn = Math.min(1, progress * 5);  // First 20% eases in
        const easeOut = Math.min(1, (1 - progress) * 5);  // Last 20% eases out
        const trackStrength = Math.min(easeIn, easeOut);

        return {
            ...ctx.transform,
            scale: lerp(1, e.scale ?? 1.05, trackStrength),
            originX,
            originY,
        };
    },
};

const resetProcessor: EffectProcessor = {
    type: "reset",
    process(ctx): CameraTransform {
        const e = ctx.effect as ResetEffect;
        const progress = getProgress(ctx.t, e.startFrame, e.endFrame);
        const easedProgress = applyEasing(progress, e.easing ?? "ease-out");

        // Interpolate all values toward neutral (default state)
        return {
            scale: lerp(ctx.transform.scale, 1, easedProgress),
            translateX: lerp(ctx.transform.translateX, 0, easedProgress),
            translateY: lerp(ctx.transform.translateY, 0, easedProgress),
            originX: lerp(ctx.transform.originX, 0.5, easedProgress),
            originY: lerp(ctx.transform.originY, 0.5, easedProgress),
            rotation: lerp(ctx.transform.rotation, 0, easedProgress),
            shakeX: lerp(ctx.transform.shakeX, 0, easedProgress),
            shakeY: lerp(ctx.transform.shakeY, 0, easedProgress),
        };
    },
};

// =============================================================================
// REGISTRY
// =============================================================================

const processorRegistry = new Map<string, EffectProcessor>();

// Register built-in processors
processorRegistry.set("zoom", zoomProcessor);
processorRegistry.set("shake", shakeProcessor);
processorRegistry.set("focus", focusProcessor);
processorRegistry.set("track", trackProcessor);
processorRegistry.set("reset", resetProcessor);

// Uppercase aliases for direct camera events (e.g., from engine handler)
processorRegistry.set("ZOOM", zoomProcessor);
processorRegistry.set("SHAKE", shakeProcessor);
processorRegistry.set("RESET", resetProcessor);

/**
 * Register a custom effect processor.
 */
export function registerCameraProcessor(processor: EffectProcessor): void {
    processorRegistry.set(processor.type, processor);
}

// =============================================================================
// MAIN PROCESSING FUNCTION
// =============================================================================

/**
 * Process all active effects and return final transform.
 * 
 * This is a PURE function - same inputs always produce same outputs.
 * Compatible with Remotion's frame-by-frame rendering.
 */
export function processActiveEffects(
    t: number,
    effects: CameraEffect[],
    initialTransform: CameraTransform = DEFAULT_TRANSFORM,
    anchorSnapshot?: AnchorSnapshot,
    viewport?: { width: number; height: number }
): CameraTransform {
    let transform = { ...initialTransform };

    // Filter to active effects only
    const activeEffects = effects.filter(
        e => t >= e.startFrame && t < e.endFrame
    );

    // Process each effect through its registered processor
    for (const effect of activeEffects) {
        const processor = processorRegistry.get(effect.type);
        if (processor) {
            transform = processor.process({
                t,
                effect,
                transform,
                anchorSnapshot,
                viewport,
            });
        }
    }

    return transform;
}
