/**
 * Effect Processors - Registry pattern for camera effects
 *
 * Each effect type has a dedicated processor.
 * Processors are pure functions: (context) → transform
 *
 * @module device-camera/processors
 */

import type { CameraTransform } from "@tokovo/core";
import { DEFAULT_CAMERA_TRANSFORM as DEFAULT_TRANSFORM } from "@tokovo/core";
import {
  CameraEffect,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  PanEffect,
  DollyEffect,
  KenBurnsEffect,
  PunchZoomEffect,
  DutchTiltEffect,
  WhipPanEffect,
  SpringConfig,
  SPRING_PRESETS,
} from "../types";
import { AnchorSnapshot } from "../anchors/types";
import { resolveAnchorFully } from "../anchors/resolver";
import { applyEasing, lerp, springValue, fbm } from "../utils";

function resolveSpring(
  spring: SpringConfig | string | undefined,
  fallback: SpringConfig,
): SpringConfig {
  if (!spring) return fallback;
  if (typeof spring === "string") {
    return SPRING_PRESETS[spring] ?? fallback;
  }
  return spring;
}

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

const DEFAULT_FPS = 30;

function getProgress(t: number, startFrame: number, endFrame: number): number {
  const duration = endFrame - startFrame;
  if (duration <= 0) return 1;
  return Math.max(0, Math.min(1, (t - startFrame) / duration));
}

function getAnimatedProgress(
  t: number,
  effect: CameraEffect,
  fps: number = DEFAULT_FPS,
): number {
  const elapsed = t - effect.startFrame;
  if (elapsed <= 0) return 0;

  if (effect.spring) {
    const springConfig = resolveSpring(effect.spring, SPRING_PRESETS.default);
    return springValue(elapsed, fps, springConfig);
  }

  const progress = getProgress(t, effect.startFrame, effect.endFrame);
  return applyEasing(progress, effect.easing ?? "ease-out");
}

const zoomProcessor: EffectProcessor = {
  type: "zoom",
  process(ctx): CameraTransform {
    const e = ctx.effect as ZoomEffect;
    const animProgress = getAnimatedProgress(ctx.t, e);

    const effectScale = lerp(1, e.targetScale, animProgress);
    const currentDelta = ctx.transform.scale - 1;
    const effectDelta = effectScale - 1;
    const maxDelta = Math.max(currentDelta, effectDelta);

    return {
      ...ctx.transform,
      scale: 1 + maxDelta,
      translateX:
        ctx.transform.translateX + lerp(0, e.targetX ?? 0, animProgress),
      translateY:
        ctx.transform.translateY + lerp(0, e.targetY ?? 0, animProgress),
      originX: e.originX ?? ctx.transform.originX,
      originY: e.originY ?? ctx.transform.originY,
    };
  },
};

const shakeProcessor: EffectProcessor = {
  type: "shake",
  process(ctx): CameraTransform {
    const e = ctx.effect as ShakeEffect;
    const elapsed = ctx.t - e.startFrame;
    const frequency = e.frequency ?? 12;

    const trauma = Math.pow(e.decay ?? 0.85, elapsed / 3);
    const traumaSquared = trauma * trauma;

    const baseX = e.intensityX ?? e.intensity;
    const baseY = e.intensityY ?? e.intensity;

    const noiseX = fbm(elapsed * frequency * 0.1, e.startFrame, 3, 0.5);
    const noiseY = fbm(
      elapsed * frequency * 0.1 + 100,
      e.startFrame + 1000,
      3,
      0.5,
    );
    const noiseRot = fbm(
      elapsed * frequency * 0.08 + 200,
      e.startFrame + 2000,
      2,
      0.6,
    );

    const shakeX = noiseX * baseX * traumaSquared;
    const shakeY = noiseY * baseY * traumaSquared;
    const shakeRot = noiseRot * (e.intensity * 0.5) * traumaSquared;

    return {
      ...ctx.transform,
      shakeX: ctx.transform.shakeX + shakeX,
      shakeY: ctx.transform.shakeY + shakeY,
      rotation: ctx.transform.rotation + shakeRot,
    };
  },
};

const focusProcessor: EffectProcessor = {
  type: "focus",
  process(ctx): CameraTransform {
    const e = ctx.effect as FocusEffect;
    const animProgress = getAnimatedProgress(ctx.t, e);

    let originX = 0.5;
    let originY = 0.5;
    let targetScale = e.scale ?? 1.15;

    if (ctx.anchorSnapshot && ctx.viewport) {
      const resolved = resolveAnchorFully(
        e.anchorId,
        ctx.anchorSnapshot,
        ctx.anchorSnapshot.appId,
        ctx.viewport,
      );
      originX = resolved.originX;
      originY = resolved.originY;
      if (!e.scale) {
        targetScale = resolved.suggestedScale;
      }
    }

    const effectScale = lerp(1, targetScale, animProgress);
    const currentDelta = ctx.transform.scale - 1;
    const effectDelta = effectScale - 1;
    const maxDelta = Math.max(currentDelta, effectDelta);

    return {
      ...ctx.transform,
      scale: 1 + maxDelta,
      originX: lerp(0.5, originX, animProgress),
      originY: lerp(0.5, originY, animProgress),
    };
  },
};

const trackProcessor: EffectProcessor = {
  type: "track",
  process(ctx): CameraTransform {
    const e = ctx.effect as TrackEffect;
    const progress = getProgress(ctx.t, e.startFrame, e.endFrame);
    const smoothing = e.smoothing ?? 0.18;

    let originX = ctx.transform.originX;
    let originY = ctx.transform.originY;

    if (ctx.anchorSnapshot && ctx.viewport) {
      const resolved = resolveAnchorFully(
        e.anchorId,
        ctx.anchorSnapshot,
        ctx.anchorSnapshot.appId,
        ctx.viewport,
      );
      originX = lerp(ctx.transform.originX, resolved.originX, smoothing);
      originY = lerp(ctx.transform.originY, resolved.originY, smoothing);
    }

    const easeIn = Math.min(1, progress * 5);
    const easeOut = Math.min(1, (1 - progress) * 5);
    const trackStrength = Math.min(easeIn, easeOut);

    const effectScale = lerp(1, e.scale ?? 1.05, trackStrength);
    const currentDelta = ctx.transform.scale - 1;
    const effectDelta = effectScale - 1;
    const maxDelta = Math.max(currentDelta, effectDelta);

    return {
      ...ctx.transform,
      scale: 1 + maxDelta,
      originX,
      originY,
    };
  },
};

const resetProcessor: EffectProcessor = {
  type: "reset",
  process(ctx): CameraTransform {
    const e = ctx.effect as ResetEffect;
    const animProgress = getAnimatedProgress(ctx.t, e);

    return {
      scale: lerp(ctx.transform.scale, 1, animProgress),
      translateX: lerp(ctx.transform.translateX, 0, animProgress),
      translateY: lerp(ctx.transform.translateY, 0, animProgress),
      originX: lerp(ctx.transform.originX, 0.5, animProgress),
      originY: lerp(ctx.transform.originY, 0.5, animProgress),
      rotation: lerp(ctx.transform.rotation, 0, animProgress),
      shakeX: lerp(ctx.transform.shakeX, 0, animProgress),
      shakeY: lerp(ctx.transform.shakeY, 0, animProgress),
    };
  },
};

const panProcessor: EffectProcessor = {
  type: "pan",
  process(ctx): CameraTransform {
    const e = ctx.effect as PanEffect;
    const animProgress = getAnimatedProgress(ctx.t, e);

    return {
      ...ctx.transform,
      translateX: ctx.transform.translateX + lerp(0, e.deltaX, animProgress),
      translateY: ctx.transform.translateY + lerp(0, e.deltaY, animProgress),
    };
  },
};

const dollyProcessor: EffectProcessor = {
  type: "dolly",
  process(ctx): CameraTransform {
    const e = ctx.effect as DollyEffect;
    const animProgress = getAnimatedProgress(ctx.t, e);

    return {
      ...ctx.transform,
      scale: lerp(e.startScale, e.endScale, animProgress),
      translateY: lerp(e.startTranslateY, e.endTranslateY, animProgress),
    };
  },
};

const kenBurnsProcessor: EffectProcessor = {
  type: "ken-burns",
  process(ctx): CameraTransform {
    const e = ctx.effect as KenBurnsEffect;
    const animProgress = getAnimatedProgress(ctx.t, e);

    return {
      ...ctx.transform,
      scale: lerp(e.startScale, e.endScale, animProgress),
      originX: lerp(e.startOriginX, e.endOriginX, animProgress),
      originY: lerp(e.startOriginY, e.endOriginY, animProgress),
    };
  },
};

const punchZoomProcessor: EffectProcessor = {
  type: "punch-zoom",
  process(ctx): CameraTransform {
    const e = ctx.effect as PunchZoomEffect;
    const elapsed = ctx.t - e.startFrame;
    const springConfig = resolveSpring(e.spring, SPRING_PRESETS.punch);

    const springProgress = springValue(elapsed, DEFAULT_FPS, springConfig);
    const punchScale =
      e.direction === "in"
        ? 1 + e.intensity * (1 - springProgress)
        : 1 - e.intensity * (1 - springProgress);

    return {
      ...ctx.transform,
      scale: ctx.transform.scale * punchScale,
    };
  },
};

const dutchTiltProcessor: EffectProcessor = {
  type: "dutch-tilt",
  process(ctx): CameraTransform {
    const e = ctx.effect as DutchTiltEffect;
    const elapsed = ctx.t - e.startFrame;
    const springConfig = resolveSpring(e.spring, SPRING_PRESETS.dramatic);

    const springProgress = springValue(elapsed, DEFAULT_FPS, springConfig);
    const tiltAngle = e.angle * springProgress;

    return {
      ...ctx.transform,
      rotation: ctx.transform.rotation + tiltAngle,
    };
  },
};

const flashProcessor: EffectProcessor = {
  type: "flash",
  process(ctx): CameraTransform {
    return ctx.transform;
  },
};

const whipPanProcessor: EffectProcessor = {
  type: "whip-pan",
  process(ctx): CameraTransform {
    const e = ctx.effect as WhipPanEffect;
    const progress = getProgress(ctx.t, e.startFrame, e.endFrame);

    const whipCurve = Math.sin(progress * Math.PI);
    const intensity = 200;

    let deltaX = 0;
    let deltaY = 0;

    switch (e.direction) {
      case "left":
        deltaX = -intensity * whipCurve;
        break;
      case "right":
        deltaX = intensity * whipCurve;
        break;
      case "up":
        deltaY = -intensity * whipCurve;
        break;
      case "down":
        deltaY = intensity * whipCurve;
        break;
    }

    return {
      ...ctx.transform,
      translateX: ctx.transform.translateX + deltaX,
      translateY: ctx.transform.translateY + deltaY,
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
processorRegistry.set("pan", panProcessor);
processorRegistry.set("dolly", dollyProcessor);
processorRegistry.set("ken-burns", kenBurnsProcessor);
processorRegistry.set("punch-zoom", punchZoomProcessor);
processorRegistry.set("dutch-tilt", dutchTiltProcessor);
processorRegistry.set("flash", flashProcessor);
processorRegistry.set("whip-pan", whipPanProcessor);

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
 * 
 * TWO-PHASE PROCESSING:
 * 1. Completed PERSISTENT effects (zoom, focus, pan, dolly, ken-burns) - held at final state
 * 2. Active effects - animated by progress
 * 
 * Transient effects (shake, punch-zoom, flash, whip-pan) disappear after ending.
 */
export function processActiveEffects(
  t: number,
  effects: CameraEffect[],
  initialTransform: CameraTransform = DEFAULT_TRANSFORM,
  anchorSnapshot?: AnchorSnapshot,
  viewport?: { width: number; height: number },
): CameraTransform {
  let transform = { ...initialTransform };

  // Effects that set camera state and should persist their final values
  const PERSISTENT_EFFECT_TYPES = new Set([
    'zoom', 'focus', 'pan', 'dolly', 'ken-burns', 'track'
  ]);

  // Split effects into active (animating) and completed (holding final state)
  const activeEffects: CameraEffect[] = [];
  const completedEffects: CameraEffect[] = [];

  for (const e of effects) {
    if (t >= e.startFrame && t < e.endFrame) {
      activeEffects.push(e);
    } else if (t >= e.endFrame && PERSISTENT_EFFECT_TYPES.has(e.type)) {
      completedEffects.push(e);
    }
  }

  // Sort completed effects by endFrame so later effects override earlier ones
  completedEffects.sort((a, b) => a.endFrame - b.endFrame);

  // Process completed effects FIRST (they set baseline state at 100% progress)
  for (const effect of completedEffects) {
    const processor = processorRegistry.get(effect.type);
    if (processor) {
      // Process at endFrame-1 which gives 100% progress
      transform = processor.process({
        t: effect.endFrame - 0.001, // Just before end = 100% progress
        effect,
        transform,
        anchorSnapshot,
        viewport,
      });
    }
  }

  // Process active effects (animating based on current frame)
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
