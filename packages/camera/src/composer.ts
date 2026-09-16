import type { CameraComposerIR, CameraRectIR, CameraEditorialInsetsIR } from "@tokovo/ir";
import type { CameraPose2D } from "./types.js";
import { requireEditorialCompositionProfile } from "@tokovo/visual-system";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function finitePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be positive and finite.`);
  }
  return value;
}

function effectiveViewport(input: {
  viewport: CameraRectIR;
  compositionProfileId?: import("@tokovo/visual-system").CompositionProfileId;
  editorialInsets?: CameraEditorialInsetsIR;
}): CameraRectIR {
  const editorialFrame =
    input.editorialInsets ??
    (input.compositionProfileId
      ? requireEditorialCompositionProfile(input.compositionProfileId).editorialInsets
      : { top: 0, right: 0, bottom: 0, left: 0 });
  const safeViewport = {
    x: input.viewport.x + editorialFrame.left,
    y: input.viewport.y + editorialFrame.top,
    width: input.viewport.width - editorialFrame.left - editorialFrame.right,
    height: input.viewport.height - editorialFrame.top - editorialFrame.bottom,
  };
  finitePositive(safeViewport.width, "Safe viewport width");
  finitePositive(safeViewport.height, "Safe viewport height");
  return safeViewport;
}

export interface CameraMountMeasurement {
  desiredCenter: readonly [number, number];
  projectedCenter: readonly [number, number];
  driftPx: readonly [number, number];
  maxDriftPx: readonly [number, number];
}

export function measureCameraMount(input: {
  pose: CameraPose2D;
  mountBounds: CameraRectIR;
  mountScreenPosition: readonly [number, number];
  mountMaxDriftPx: readonly [number, number];
  viewport: CameraRectIR;
  compositionProfileId?: import("@tokovo/visual-system").CompositionProfileId;
  editorialInsets?: CameraEditorialInsetsIR;
}): CameraMountMeasurement {
  const safeViewport = effectiveViewport(input);
  const projectionCenterX = input.viewport.x + input.viewport.width / 2;
  const projectionCenterY = input.viewport.y + input.viewport.height / 2;
  const rotationRadians = (input.pose.rotationDeg * Math.PI) / 180;
  const rotationCosine = Math.cos(rotationRadians);
  const rotationSine = Math.sin(rotationRadians);
  const mountCenterX = input.mountBounds.x + input.mountBounds.width / 2;
  const mountCenterY = input.mountBounds.y + input.mountBounds.height / 2;
  const deltaX = mountCenterX - input.pose.centerX;
  const deltaY = mountCenterY - input.pose.centerY;
  const projectedCenterX =
    projectionCenterX + input.pose.scale * (rotationCosine * deltaX - rotationSine * deltaY);
  const projectedCenterY =
    projectionCenterY + input.pose.scale * (rotationSine * deltaX + rotationCosine * deltaY);
  const desiredCenterX = safeViewport.x + safeViewport.width * input.mountScreenPosition[0];
  const desiredCenterY = safeViewport.y + safeViewport.height * input.mountScreenPosition[1];
  return {
    desiredCenter: [desiredCenterX, desiredCenterY],
    projectedCenter: [projectedCenterX, projectedCenterY],
    driftPx: [projectedCenterX - desiredCenterX, projectedCenterY - desiredCenterY],
    maxDriftPx: input.mountMaxDriftPx,
  };
}

/**
 * Applies only an output-space translation correction. Authored scale,
 * rotation, trajectory, lens, and filter intent remain untouched.
 */
export function stabilizeCameraPose(input: {
  pose: CameraPose2D;
  mountBounds: CameraRectIR;
  mountScreenPosition: readonly [number, number];
  mountMaxDriftPx: readonly [number, number];
  viewport: CameraRectIR;
  compositionProfileId?: import("@tokovo/visual-system").CompositionProfileId;
  editorialInsets?: CameraEditorialInsetsIR;
}): CameraPose2D {
  finitePositive(input.mountBounds.width, "Camera mount width");
  finitePositive(input.mountBounds.height, "Camera mount height");
  const measurement = measureCameraMount(input);
  const correctionX =
    clamp(measurement.driftPx[0], -measurement.maxDriftPx[0], measurement.maxDriftPx[0]) -
    measurement.driftPx[0];
  const correctionY =
    clamp(measurement.driftPx[1], -measurement.maxDriftPx[1], measurement.maxDriftPx[1]) -
    measurement.driftPx[1];
  if (Math.abs(correctionX) <= 1e-9 && Math.abs(correctionY) <= 1e-9) {
    return input.pose;
  }
  const rotationRadians = (input.pose.rotationDeg * Math.PI) / 180;
  const rotationCosine = Math.cos(rotationRadians);
  const rotationSine = Math.sin(rotationRadians);
  return {
    ...input.pose,
    centerX:
      input.pose.centerX -
      (rotationCosine * correctionX + rotationSine * correctionY) / input.pose.scale,
    centerY:
      input.pose.centerY -
      (-rotationSine * correctionX + rotationCosine * correctionY) / input.pose.scale,
  };
}

export function solveComposer(input: {
  subjectBounds: CameraRectIR;
  mountBounds?: CameraRectIR;
  mountScreenPosition?: readonly [number, number];
  mountMaxDriftPx?: readonly [number, number];
  framingGuardBounds?: CameraRectIR;
  framingGuardPaddingPx?: number;
  framingGuardScreenPosition?: readonly [number, number];
  viewport: CameraRectIR;
  compositionProfileId?: import("@tokovo/visual-system").CompositionProfileId;
  editorialInsets?: CameraEditorialInsetsIR;
  composer: CameraComposerIR;
  rotationDeg?: number;
  opacity?: number;
}): CameraPose2D {
  const { subjectBounds, viewport, composer } = input;
  finitePositive(subjectBounds.width, "Subject width");
  finitePositive(subjectBounds.height, "Subject height");
  finitePositive(viewport.width, "Viewport width");
  finitePositive(viewport.height, "Viewport height");
  const safeViewport = effectiveViewport(input);

  const targetFill = finitePositive(composer.targetFill, "Composer targetFill");
  const padding = Math.max(0, composer.paddingPx ?? 0);
  const paddedWidth = subjectBounds.width + padding * 2;
  const paddedHeight = subjectBounds.height + padding * 2;
  const rotationDeg = input.rotationDeg ?? 0;
  const rotationRadians = (rotationDeg * Math.PI) / 180;
  const rotationCosine = Math.cos(rotationRadians);
  const rotationSine = Math.sin(rotationRadians);
  const projectedWidth =
    Math.abs(rotationCosine) * paddedWidth + Math.abs(rotationSine) * paddedHeight;
  const projectedHeight =
    Math.abs(rotationSine) * paddedWidth + Math.abs(rotationCosine) * paddedHeight;
  const widthScale = (safeViewport.width * targetFill) / projectedWidth;
  const heightScale = (safeViewport.height * targetFill) / projectedHeight;

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
  let scale = clamp(unclampedScale, minimumScale, maximumScale);

  const guard = input.framingGuardBounds;
  const guardPadding = Math.max(0, input.framingGuardPaddingPx ?? 0);
  if (guard) {
    finitePositive(guard.width, "Framing guard width");
    finitePositive(guard.height, "Framing guard height");
    const availableWidth = finitePositive(
      safeViewport.width - guardPadding * 2,
      "Framing guard available width",
    );
    const availableHeight = finitePositive(
      safeViewport.height - guardPadding * 2,
      "Framing guard available height",
    );
    const rotatedGuardWidth =
      Math.abs(rotationCosine) * guard.width + Math.abs(rotationSine) * guard.height;
    const rotatedGuardHeight =
      Math.abs(rotationSine) * guard.width + Math.abs(rotationCosine) * guard.height;
    scale = Math.min(
      scale,
      availableWidth / rotatedGuardWidth,
      availableHeight / rotatedGuardHeight,
    );
  }

  const screenX = safeViewport.x + safeViewport.width * composer.screenPosition[0];
  const screenY = safeViewport.y + safeViewport.height * composer.screenPosition[1];
  const projectionCenterX = viewport.x + viewport.width / 2;
  const projectionCenterY = viewport.y + viewport.height / 2;
  const outputDeltaX = (screenX - projectionCenterX) / scale;
  const outputDeltaY = (screenY - projectionCenterY) / scale;

  const inverseRadians = (-rotationDeg * Math.PI) / 180;
  const inverseCosine = Math.cos(inverseRadians);
  const inverseSine = Math.sin(inverseRadians);
  const worldDeltaX = outputDeltaX * inverseCosine - outputDeltaY * inverseSine;
  const worldDeltaY = outputDeltaX * inverseSine + outputDeltaY * inverseCosine;
  const biasX = composer.bias?.[0] ?? 0;
  const biasY = composer.bias?.[1] ?? 0;
  const subjectCenterX = subjectBounds.x + subjectBounds.width / 2 + biasX;
  const subjectCenterY = subjectBounds.y + subjectBounds.height / 2 + biasY;

  let centerX = subjectCenterX - worldDeltaX;
  let centerY = subjectCenterY - worldDeltaY;

  if (guard) {
    const guardCenterX = guard.x + guard.width / 2;
    const guardCenterY = guard.y + guard.height / 2;
    const guardDeltaX = guardCenterX - centerX;
    const guardDeltaY = guardCenterY - centerY;
    const projectedGuardCenterX =
      projectionCenterX + scale * (rotationCosine * guardDeltaX - rotationSine * guardDeltaY);
    const projectedGuardCenterY =
      projectionCenterY + scale * (rotationSine * guardDeltaX + rotationCosine * guardDeltaY);
    const projectedGuardHalfWidth =
      (scale * (Math.abs(rotationCosine) * guard.width + Math.abs(rotationSine) * guard.height)) /
      2;
    const projectedGuardHalfHeight =
      (scale * (Math.abs(rotationSine) * guard.width + Math.abs(rotationCosine) * guard.height)) /
      2;
    const minimumGuardCenterX = safeViewport.x + guardPadding + projectedGuardHalfWidth;
    const maximumGuardCenterX =
      safeViewport.x + safeViewport.width - guardPadding - projectedGuardHalfWidth;
    const minimumGuardCenterY = safeViewport.y + guardPadding + projectedGuardHalfHeight;
    const maximumGuardCenterY =
      safeViewport.y + safeViewport.height - guardPadding - projectedGuardHalfHeight;
    const guardScreenPosition = input.framingGuardScreenPosition;
    const desiredGuardCenterX = guardScreenPosition
      ? safeViewport.x + safeViewport.width * guardScreenPosition[0]
      : projectedGuardCenterX;
    const desiredGuardCenterY = guardScreenPosition
      ? safeViewport.y + safeViewport.height * guardScreenPosition[1]
      : projectedGuardCenterY;
    const clampedGuardCenterX = clamp(
      desiredGuardCenterX,
      minimumGuardCenterX,
      maximumGuardCenterX,
    );
    const clampedGuardCenterY = clamp(
      desiredGuardCenterY,
      minimumGuardCenterY,
      maximumGuardCenterY,
    );
    const correctionX = clampedGuardCenterX - projectedGuardCenterX;
    const correctionY = clampedGuardCenterY - projectedGuardCenterY;
    centerX -= (rotationCosine * correctionX + rotationSine * correctionY) / scale;
    centerY -= (-rotationSine * correctionX + rotationCosine * correctionY) / scale;
  }

  const pose = {
    centerX,
    centerY,
    scale,
    rotationDeg,
    opacity: input.opacity ?? 1,
    clipRect: viewport,
  };
  if (!input.mountBounds) return pose;
  return stabilizeCameraPose({
    pose,
    mountBounds: input.mountBounds,
    mountScreenPosition: input.mountScreenPosition ?? [0.5, 0.5],
    mountMaxDriftPx: input.mountMaxDriftPx ?? [0, 0],
    viewport,
    compositionProfileId: input.compositionProfileId,
    editorialInsets: input.editorialInsets,
  });
}

export function minimumJerk(progress: number): number {
  const t = clamp(progress, 0, 1);
  return t * t * t * (10 + t * (-15 + t * 6));
}

function shortestRotationDelta(fromDeg: number, toDeg: number): number {
  return (((((toDeg % 360) - (fromDeg % 360) + 180) % 360) + 360) % 360) - 180;
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
