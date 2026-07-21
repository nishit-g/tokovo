import type { CameraComposerIR, CameraRectIR } from "@tokovo/ir";
import type { CameraPose2D } from "./types.js";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function finitePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be positive and finite.`);
  }
  return value;
}

export function solveComposer(input: {
  subjectBounds: CameraRectIR;
  viewport: CameraRectIR;
  composer: CameraComposerIR;
  rotationDeg?: number;
  opacity?: number;
}): CameraPose2D {
  const { subjectBounds, viewport, composer } = input;
  finitePositive(subjectBounds.width, "Subject width");
  finitePositive(subjectBounds.height, "Subject height");
  finitePositive(viewport.width, "Viewport width");
  finitePositive(viewport.height, "Viewport height");

  const targetFill = finitePositive(composer.targetFill, "Composer targetFill");
  const padding = Math.max(0, composer.paddingPx ?? 0);
  const paddedWidth = subjectBounds.width + padding * 2;
  const paddedHeight = subjectBounds.height + padding * 2;
  const widthScale = (viewport.width * targetFill) / paddedWidth;
  const heightScale = (viewport.height * targetFill) / paddedHeight;

  const unclampedScale = (() => {
    switch (composer.fillMode) {
      case "cover":
        return Math.max(widthScale, heightScale);
      case "width":
        return widthScale;
      case "height":
        return heightScale;
      case "contain":
      default:
        return Math.min(widthScale, heightScale);
    }
  })();

  const minimumScale = composer.minScale ?? 0.01;
  const maximumScale = composer.maxScale ?? 100;
  const scale = clamp(unclampedScale, minimumScale, maximumScale);

  const screenX = viewport.x + viewport.width * composer.screenPosition[0];
  const screenY = viewport.y + viewport.height * composer.screenPosition[1];
  const viewportCenterX = viewport.x + viewport.width / 2;
  const viewportCenterY = viewport.y + viewport.height / 2;
  const outputDeltaX = (screenX - viewportCenterX) / scale;
  const outputDeltaY = (screenY - viewportCenterY) / scale;

  const rotationDeg = input.rotationDeg ?? 0;
  const inverseRadians = (-rotationDeg * Math.PI) / 180;
  const inverseCosine = Math.cos(inverseRadians);
  const inverseSine = Math.sin(inverseRadians);
  const worldDeltaX = outputDeltaX * inverseCosine - outputDeltaY * inverseSine;
  const worldDeltaY = outputDeltaX * inverseSine + outputDeltaY * inverseCosine;
  const biasX = composer.bias?.[0] ?? 0;
  const biasY = composer.bias?.[1] ?? 0;
  const subjectCenterX = subjectBounds.x + subjectBounds.width / 2 + biasX;
  const subjectCenterY = subjectBounds.y + subjectBounds.height / 2 + biasY;

  return {
    centerX: subjectCenterX - worldDeltaX,
    centerY: subjectCenterY - worldDeltaY,
    scale,
    rotationDeg,
    opacity: input.opacity ?? 1,
    clipRect: viewport,
  };
}

export function minimumJerk(progress: number): number {
  const t = clamp(progress, 0, 1);
  return t * t * t * (10 + t * (-15 + t * 6));
}

function shortestRotationDelta(fromDeg: number, toDeg: number): number {
  return ((toDeg - fromDeg + 540) % 360) - 180;
}

function interpolateLinear(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export function interpolateCameraPose(
  from: CameraPose2D,
  to: CameraPose2D,
  progress: number,
  curve: "linear" | "smoothstep" | "minimum-jerk" = "minimum-jerk",
): CameraPose2D {
  const raw = clamp(progress, 0, 1);
  const t =
    curve === "minimum-jerk"
      ? minimumJerk(raw)
      : curve === "smoothstep"
        ? raw * raw * (3 - 2 * raw)
        : raw;
  const fromLogScale = Math.log(finitePositive(from.scale, "From scale"));
  const toLogScale = Math.log(finitePositive(to.scale, "To scale"));
  const rotationDelta = shortestRotationDelta(from.rotationDeg, to.rotationDeg);

  return {
    centerX: interpolateLinear(from.centerX, to.centerX, t),
    centerY: interpolateLinear(from.centerY, to.centerY, t),
    scale: Math.exp(interpolateLinear(fromLogScale, toLogScale, t)),
    rotationDeg: from.rotationDeg + rotationDelta * t,
    opacity: interpolateLinear(from.opacity, to.opacity, t),
    clipRect: {
      x: interpolateLinear(from.clipRect.x, to.clipRect.x, t),
      y: interpolateLinear(from.clipRect.y, to.clipRect.y, t),
      width: interpolateLinear(from.clipRect.width, to.clipRect.width, t),
      height: interpolateLinear(from.clipRect.height, to.clipRect.height, t),
    },
  };
}
