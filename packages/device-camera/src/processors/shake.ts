/**
 * Shake Effect Processor
 *
 * Procedural screen shake with decay.
 * Uses deterministic oscillation for scrubbing compatibility.
 *
 * @module device-camera/processors/shake
 */

import type { EffectProcessor, EffectProcessorContext } from "./types";
import type { ShakeEffect } from "../types";
import type { CameraTransform } from "@tokovo/core";
import { getProgress } from "../utils";

export const shakeProcessor: EffectProcessor = {
  type: "shake",

  process(ctx: EffectProcessorContext): CameraTransform {
    const { t, effect, transform } = ctx;
    const e = effect as ShakeEffect;

    // Calculate progress and decay
    const progress = getProgress(t, e.startFrame, e.endFrame);
    const decay = e.decay ?? 0.8;
    const decayFactor = Math.pow(decay, progress * 10);

    // Intensity (can be asymmetric)
    const intensityX = e.intensityX ?? e.intensity;
    const intensityY = e.intensityY ?? e.intensity;

    // Frequency-based oscillation (deterministic)
    const frequency = e.frequency ?? 15;
    const frameOffset = t - e.startFrame;
    const phase = (frameOffset * frequency) / 30; // Normalized to 30fps

    // Oscillating shake
    const shakeX = Math.sin(phase * Math.PI * 2) * intensityX * decayFactor;
    const shakeY =
      Math.cos(phase * Math.PI * 2 * 1.3) * intensityY * decayFactor;

    return {
      ...transform,
      shakeX: transform.shakeX + shakeX,
      shakeY: transform.shakeY + shakeY,
    };
  },
};
