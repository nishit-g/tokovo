/**
 * Reset Effect Processor
 * 
 * Animate camera back to neutral state.
 * 
 * @module device-camera/processors/reset
 */

import type { EffectProcessor, EffectProcessorContext } from "./types";
import type { ResetEffect, CameraTransform, DEFAULT_TRANSFORM } from "../types";
import { applyEasing, lerp, getProgress } from "../utils";

const NEUTRAL: CameraTransform = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    originX: 0.5,
    originY: 0.5,
    rotation: 0,
    shakeX: 0,
    shakeY: 0,
};

export const resetProcessor: EffectProcessor = {
    type: "reset",

    process(ctx: EffectProcessorContext): CameraTransform {
        const { t, effect, transform } = ctx;
        const e = effect as ResetEffect;

        // Calculate progress
        const progress = getProgress(t, e.startFrame, e.endFrame);
        const easedProgress = applyEasing(progress, e.easing ?? "ease-out");

        // Interpolate all values towards neutral
        return {
            scale: lerp(transform.scale, NEUTRAL.scale, easedProgress),
            translateX: lerp(transform.translateX, NEUTRAL.translateX, easedProgress),
            translateY: lerp(transform.translateY, NEUTRAL.translateY, easedProgress),
            originX: lerp(transform.originX, NEUTRAL.originX, easedProgress),
            originY: lerp(transform.originY, NEUTRAL.originY, easedProgress),
            rotation: lerp(transform.rotation, NEUTRAL.rotation, easedProgress),
            shakeX: lerp(transform.shakeX, NEUTRAL.shakeX, easedProgress),
            shakeY: lerp(transform.shakeY, NEUTRAL.shakeY, easedProgress),
        };
    },
};
