/**
 * Focus Effect Processor
 * 
 * Focus camera on a semantic anchor.
 * Resolves anchor ID to coordinates and animates zoom.
 * 
 * @module device-camera/processors/focus
 */

import type { EffectProcessor, EffectProcessorContext } from "./types";
import type { FocusEffect, CameraTransform } from "../types";
import { applyEasing, lerp, getProgress } from "../utils";

// Default framing presets
const PRESETS: Record<string, { scale: number; padding: number }> = {
    close: { scale: 1.35, padding: 20 },
    medium: { scale: 1.15, padding: 40 },
    wide: { scale: 1.05, padding: 60 },
    message: { scale: 1.08, padding: 30 },
    impact: { scale: 1.3, padding: 20 },
};

export const focusProcessor: EffectProcessor = {
    type: "focus",

    process(ctx: EffectProcessorContext): CameraTransform {
        const { t, effect, transform, anchorSnapshot, viewport } = ctx;
        const e = effect as FocusEffect;

        // Calculate progress
        const progress = getProgress(t, e.startFrame, e.endFrame);
        const easedProgress = applyEasing(progress, e.easing ?? "ease-out");

        // Get preset or defaults
        const preset = PRESETS[e.preset ?? "medium"] ?? PRESETS.medium;
        const targetScale = e.scale ?? preset.scale;

        // Try to resolve anchor
        let originX = 0.5;
        let originY = 0.5;

        if (anchorSnapshot && anchorSnapshot.anchors[e.anchorId] && viewport) {
            const rect = anchorSnapshot.anchors[e.anchorId];
            // Convert anchor center to normalized origin (0-1)
            originX = (rect.x + rect.width / 2) / viewport.width;
            originY = (rect.y + rect.height / 2) / viewport.height;
        }

        // Interpolate towards target
        const scale = lerp(1, targetScale, easedProgress);
        const interpOriginX = lerp(transform.originX, originX, easedProgress);
        const interpOriginY = lerp(transform.originY, originY, easedProgress);

        return {
            ...transform,
            scale: transform.scale * scale,
            originX: interpOriginX,
            originY: interpOriginY,
        };
    },
};
