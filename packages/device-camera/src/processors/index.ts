/**
 * Effect Processor Registry
 * 
 * Central registry for camera effect processors.
 * Follows Open/Closed principle - add effects without modifying core.
 * 
 * @module device-camera/processors
 */

import type { CameraEffect, CameraTransform, CameraEffectType, DEFAULT_TRANSFORM } from "../types";
import type { EffectProcessor, EffectProcessorContext } from "./types";

// Import built-in processors
import { zoomProcessor } from "./zoom";
import { shakeProcessor } from "./shake";
import { focusProcessor } from "./focus";
import { trackProcessor } from "./track";
import { resetProcessor } from "./reset";

// =============================================================================
// REGISTRY
// =============================================================================

const processorRegistry = new Map<CameraEffectType, EffectProcessor>();

// Register built-in processors
processorRegistry.set("zoom", zoomProcessor);
processorRegistry.set("shake", shakeProcessor);
processorRegistry.set("focus", focusProcessor);
processorRegistry.set("track", trackProcessor);
processorRegistry.set("reset", resetProcessor);

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Register a custom camera processor.
 * 
 * @param processor - The processor to register
 */
export function registerCameraProcessor(processor: EffectProcessor): void {
    processorRegistry.set(processor.type, processor);
}

/**
 * Get a processor by type.
 */
export function getProcessor(type: CameraEffectType): EffectProcessor | undefined {
    return processorRegistry.get(type);
}

/**
 * Process all active effects for the current frame.
 * 
 * This is the main entry point for camera effect computation.
 * PURE FUNCTION: Same inputs always produce same outputs.
 * 
 * @param t - Current frame number
 * @param effects - All camera effects (active and inactive)
 * @param initialTransform - Starting transform state
 * @param anchorSnapshot - Resolved anchors for focus/track
 * @param viewport - Viewport dimensions
 * @returns Final computed transform
 */
export function processActiveEffects(
    t: number,
    effects: CameraEffect[],
    initialTransform: CameraTransform,
    anchorSnapshot?: EffectProcessorContext["anchorSnapshot"],
    viewport?: EffectProcessorContext["viewport"]
): CameraTransform {
    let transform = { ...initialTransform };

    // Filter to only active effects at this frame
    const activeEffects = effects.filter(
        (e) => t >= e.startFrame && t < e.endFrame
    );

    // Sort by start frame for consistent ordering
    activeEffects.sort((a, b) => a.startFrame - b.startFrame);

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
        } else {
            console.warn(`[device-camera] No processor for effect type: ${effect.type}`);
        }
    }

    return transform;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { EffectProcessor, EffectProcessorContext } from "./types";
