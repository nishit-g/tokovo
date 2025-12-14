/**
 * Camera Composer
 *
 * Applies director effects to create final camera transform.
 * Director owns framing when enabled - base transform should be neutral.
 */

import {
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
} from "@tokovo/core";
import { DerivedCameraEffect, LayoutRect } from "@tokovo/core";

export interface Viewport {
    width: number;
    height: number;
    scrollY: number;
}

/**
 * Apply director effects to create final transform.
 *
 * POLICY: Director owns framing when enabled.
 * When director effects exist, we start from neutral and apply them.
 */
export function applyDirectorEffects(
    effects: DerivedCameraEffect[],
    viewport: Viewport
): CameraTransform {
    // Start fresh - director owns the frame
    const transform: CameraTransform = { ...DEFAULT_CAMERA_TRANSFORM };

    // Apply framing (there's at most 1 after arbitration)
    const framing = effects.find((e) => e.category === "framing");
    if (framing) {
        applyFramingEffect(transform, framing, viewport);
    }

    // Apply shake (additive, can stack)
    const shakes = effects.filter((e) => e.category === "shake");
    for (const shake of shakes) {
        applyShakeEffect(transform, shake);
    }

    return transform;
}

function applyFramingEffect(
    transform: CameraTransform,
    effect: DerivedCameraEffect,
    viewport: Viewport
): void {
    const { progress, scale, target } = effect;

    switch (effect.type) {
        case "PushIn":
        case "ZoomToRect":
        case "FocusAnchor": {
            // FocusAnchor effects should have target injected by useCameraEngine
            if (!scale || !target) return;

            // Scale interpolation
            transform.scale = 1 + (scale - 1) * progress;

            // Origin: center on target rect (adjusted for scroll)
            const centerX = target.x + target.width / 2;
            const centerY = target.y + target.height / 2 - viewport.scrollY;

            transform.originX = Math.max(0.1, Math.min(0.9, centerX / viewport.width));
            transform.originY = Math.max(0.1, Math.min(0.9, centerY / viewport.height));
            break;
        }

        case "PullBack": {
            if (!scale) return;
            transform.scale = 1 + (scale - 1) * progress;
            // Origin stays centered for pullback
            transform.originX = 0.5;
            transform.originY = 0.5;
            break;
        }
    }
}

function applyShakeEffect(
    transform: CameraTransform,
    effect: DerivedCameraEffect
): void {
    const { intensity, seed, progress } = effect;
    if (!intensity || seed === undefined) return;

    // Decay shake over progress
    const decay = 1 - progress;
    const amp = intensity * decay;

    // Deterministic shake
    transform.shakeX += (seededRandom(seed) - 0.5) * 2 * amp;
    transform.shakeY += (seededRandom(seed + 1) - 0.5) * 2 * amp;
}

/**
 * Deterministic random (mulberry32)
 */
function seededRandom(seed: number): number {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
