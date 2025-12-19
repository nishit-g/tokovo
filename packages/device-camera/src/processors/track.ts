/**
 * Track Effect Processor
 * 
 * Continuously follow a semantic anchor.
 * Uses smoothing for natural camera movement.
 * 
 * @module device-camera/processors/track
 */

import type { EffectProcessor, EffectProcessorContext } from "./types";
import type { TrackEffect, CameraTransform } from "../types";
import { lerp, getProgress } from "../utils";

export const trackProcessor: EffectProcessor = {
    type: "track",

    process(ctx: EffectProcessorContext): CameraTransform {
        const { t, effect, transform, anchorSnapshot, viewport } = ctx;
        const e = effect as TrackEffect;

        // Calculate progress for scale easing at start/end
        const progress = getProgress(t, e.startFrame, e.endFrame);

        // Easing at start (0-10%) and end (90-100%)
        let scaleMultiplier = 1;
        if (progress < 0.1) {
            scaleMultiplier = progress / 0.1;
        } else if (progress > 0.9) {
            scaleMultiplier = (1 - progress) / 0.1;
        }

        const targetScale = e.scale ?? 1.05;
        const scale = 1 + (targetScale - 1) * scaleMultiplier;

        // Try to resolve anchor
        let originX = transform.originX;
        let originY = transform.originY;

        if (anchorSnapshot && anchorSnapshot.anchors[e.anchorId] && viewport) {
            const rect = anchorSnapshot.anchors[e.anchorId];
            const targetOriginX = (rect.x + rect.width / 2) / viewport.width;
            const targetOriginY = (rect.y + rect.height / 2) / viewport.height;

            // Smooth interpolation towards target
            const smoothing = e.smoothing ?? 0.1;
            originX = lerp(transform.originX, targetOriginX, smoothing);
            originY = lerp(transform.originY, targetOriginY, smoothing);
        }

        return {
            ...transform,
            scale: transform.scale * scale,
            originX,
            originY,
        };
    },
};
