/**
 * Zoom Effect Processor
 * 
 * Handles scale and translation animation.
 * 
 * @module device-camera/processors/zoom
 */

import type { EffectProcessor, EffectProcessorContext } from "./types";
import type { ZoomEffect, CameraTransform } from "../types";
import { applyEasing, lerp, getProgress } from "../utils";

export const zoomProcessor: EffectProcessor = {
    type: "zoom",

    process(ctx: EffectProcessorContext): CameraTransform {
        const { t, effect, transform } = ctx;
        const e = effect as ZoomEffect;

        // Calculate progress
        const progress = getProgress(t, e.startFrame, e.endFrame);
        const easedProgress = applyEasing(progress, e.easing ?? "ease-out");

        // Interpolate from current to target
        const scale = lerp(1, e.targetScale, easedProgress);
        const translateX = lerp(0, e.targetX ?? 0, easedProgress);
        const translateY = lerp(0, e.targetY ?? 0, easedProgress);

        // Use effect origin if specified, otherwise keep current
        const originX = e.originX ?? transform.originX;
        const originY = e.originY ?? transform.originY;

        return {
            ...transform,
            scale: transform.scale * scale, // Multiplicative for composability
            translateX: transform.translateX + translateX,
            translateY: transform.translateY + translateY,
            originX,
            originY,
        };
    },
};
