/**
 * DirectorLite - Automatic Camera System
 * 
 * AI-driven camera that generates shots from event signals.
 * Falls back when manual camera is active.
 * 
 * @module device-camera/director-lite
 */

export { deriveDirectorEffects, type DeriveContext } from "./derive";
export { extractSignals } from "./signals";
export { ViralDramaV1, type DirectorStrategy, type Rule } from "./strategy";
export type {
    DirectorSignal,
    DirectorSignalType,
    DirectorLayoutModel,
    DirectorOutput,
    DerivedCameraEffect,
    DirectorDebug,
    LayoutRect,
} from "./types";

import type { CameraEffect, ZoomEffect, ShakeEffect, FocusEffect } from "../types";
import type { DerivedCameraEffect } from "./types";

/**
 * Convert DerivedCameraEffects to CameraEffect[] for processor usage.
 * Creates temporary effects for the CURRENT FRAME only.
 * 
 * @param effects - Director-derived effects for this frame
 * @param t - Current frame
 * @returns CameraEffect[] that can be processed by processors
 */
export function convertToEffects(
    effects: DerivedCameraEffect[],
    t: number
): CameraEffect[] {
    const result: CameraEffect[] = [];

    for (const effect of effects) {
        // Create a single-frame effect (already includes progress)
        if (effect.category === "framing") {
            if (effect.anchor) {
                // Anchor-based focus
                const focusEffect: FocusEffect = {
                    type: "focus",
                    id: `director_focus_${t}`,
                    startFrame: t,
                    endFrame: t + 1, // Single frame
                    anchorId: effect.anchor,
                    scale: effect.scale,
                    preset: effect.preset,
                };
                result.push(focusEffect);
            } else if (effect.target) {
                // Target-based zoom (calculate origin from target rect)
                const viewport = { width: 393, height: 852 }; // Default iPhone dimensions
                const originX = (effect.target.x + effect.target.width / 2) / viewport.width;
                const originY = (effect.target.y + effect.target.height / 2) / viewport.height;

                const zoomEffect: ZoomEffect = {
                    type: "zoom",
                    id: `director_zoom_${t}`,
                    startFrame: t,
                    endFrame: t + 1,
                    targetScale: effect.scale ?? 1.15,
                    originX,
                    originY,
                };
                result.push(zoomEffect);
            }
        } else if (effect.category === "shake" && effect.intensity) {
            const shakeEffect: ShakeEffect = {
                type: "shake",
                id: `director_shake_${t}`,
                startFrame: t,
                endFrame: t + 1,
                intensity: effect.intensity * (1 - effect.progress), // Decay
                frequency: 15,
                decay: 0.8,
            };
            result.push(shakeEffect);
        }
    }

    return result;
}

