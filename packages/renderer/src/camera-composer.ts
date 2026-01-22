/**
 * Camera Composer
 *
 * Applies director effects to create final camera transform.
 * Director owns framing when enabled - base transform should be neutral.
 */

import { CameraTransform, DEFAULT_CAMERA_TRANSFORM } from "@tokovo/core";
import { DerivedCameraEffect, LayoutRect } from "@tokovo/core";

export interface Viewport {
  width: number;
  height: number;
  scrollY: number;
}

interface PanEffect extends DerivedCameraEffect {
  type: "Pan";
  deltaX?: number;
  deltaY?: number;
}

interface DollyEffect extends DerivedCameraEffect {
  type: "Dolly";
  startScale?: number;
  endScale?: number;
  startTranslateY?: number;
  endTranslateY?: number;
}

interface KenBurnsEffect extends DerivedCameraEffect {
  type: "KenBurns";
  startScale?: number;
  endScale?: number;
  startOriginX?: number;
  startOriginY?: number;
  endOriginX?: number;
  endOriginY?: number;
}

/**
 * Apply director effects to create final transform.
 *
 * POLICY: Director owns framing when enabled.
 * When director effects exist, we start from neutral and apply them.
 */
export function applyDirectorEffects(
  effects: DerivedCameraEffect[],
  viewport: Viewport,
): CameraTransform {
  const transform: CameraTransform = { ...DEFAULT_CAMERA_TRANSFORM };

  const framing = effects.find((e) => e.category === "framing");
  if (framing) {
    applyFramingEffect(transform, framing, viewport);
  }

  const shakes = effects.filter((e) => e.category === "shake");
  for (const shake of shakes) {
    applyShakeEffect(transform, shake);
  }

  return transform;
}

function applyFramingEffect(
  transform: CameraTransform,
  effect: DerivedCameraEffect,
  viewport: Viewport,
): void {
  const { progress, scale, target } = effect;

  switch (effect.type) {
    case "PushIn":
    case "ZoomToRect":
    case "FocusAnchor": {
      if (!scale || !target) return;

      transform.scale = 1 + (scale - 1) * progress;

      const centerX = target.x + target.width / 2;
      const centerY = target.y + target.height / 2 - viewport.scrollY;

      transform.originX = Math.max(
        0.1,
        Math.min(0.9, centerX / viewport.width),
      );
      transform.originY = Math.max(
        0.1,
        Math.min(0.9, centerY / viewport.height),
      );
      break;
    }

    case "PullBack": {
      if (!scale) return;
      transform.scale = 1 + (scale - 1) * progress;
      transform.originX = 0.5;
      transform.originY = 0.5;
      break;
    }

    case "Pan": {
      const panEffect = effect as PanEffect;
      const deltaX = panEffect.deltaX ?? 0;
      const deltaY = panEffect.deltaY ?? 0;
      transform.translateX = deltaX * progress;
      transform.translateY = deltaY * progress;
      break;
    }

    case "Dolly": {
      const dollyEffect = effect as DollyEffect;
      const startScale = dollyEffect.startScale ?? 1;
      const endScale = dollyEffect.endScale ?? 1.2;
      const startTranslateY = dollyEffect.startTranslateY ?? 0;
      const endTranslateY = dollyEffect.endTranslateY ?? 0;
      transform.scale = startScale + (endScale - startScale) * progress;
      transform.translateY =
        startTranslateY + (endTranslateY - startTranslateY) * progress;
      transform.originX = 0.5;
      transform.originY = 0.5;
      break;
    }

    case "KenBurns": {
      const kbEffect = effect as KenBurnsEffect;
      const startScale = kbEffect.startScale ?? 1;
      const endScale = kbEffect.endScale ?? 1.1;
      const startOriginX = kbEffect.startOriginX ?? 0.5;
      const startOriginY = kbEffect.startOriginY ?? 0.5;
      const endOriginX = kbEffect.endOriginX ?? 0.5;
      const endOriginY = kbEffect.endOriginY ?? 0.5;
      transform.scale = startScale + (endScale - startScale) * progress;
      transform.originX = startOriginX + (endOriginX - startOriginX) * progress;
      transform.originY = startOriginY + (endOriginY - startOriginY) * progress;
      break;
    }
  }
}

function applyShakeEffect(
  transform: CameraTransform,
  effect: DerivedCameraEffect,
): void {
  const { intensity, seed, progress } = effect;
  if (!intensity || seed === undefined) return;

  const decay = 1 - progress;
  const amp = intensity * decay;

  transform.shakeX += (seededRandom(seed) - 0.5) * 2 * amp;
  transform.shakeY += (seededRandom(seed + 1) - 0.5) * 2 * amp;
}

function seededRandom(seed: number): number {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
