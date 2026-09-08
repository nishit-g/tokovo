import type {
  CameraProjectionPass,
  CameraQualitySample,
  Matrix3,
} from "@tokovo/camera";

export const CAMERA_TEXTURE_CAPTURE_PREFIX =
  "TOKOVO_CAMERA_TEXTURE_FRAME:";

export interface CameraTextureProjectionCapture {
  version: 5;
  frame: number;
  storySignature: string;
  stageSignature: string;
  cameraSignature: string;
  planId: string;
  stage: { width: number; height: number };
  outputs: readonly {
    outputId: string;
    sourceStageNodeId: string;
    zIndex: number;
    viewport: { x: number; y: number; width: number; height: number };
    viewMatrix: Matrix3;
    opacity: number;
    clipRadiusPx: number;
    shadow?: {
      offsetX: number;
      offsetY: number;
      blurPx: number;
      opacity: number;
    };
    projectionPasses: readonly CameraProjectionPass[];
    quality: Omit<CameraQualitySample, "frame" | "outputId" | "viewport">;
  }[];
}

export function encodeCameraTextureProjectionCapture(
  capture: CameraTextureProjectionCapture,
): string {
  return `${CAMERA_TEXTURE_CAPTURE_PREFIX}${JSON.stringify(capture)}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidRect(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const rect = value as Record<string, unknown>;
  return [rect.x, rect.y, rect.width, rect.height].every(isFiniteNumber);
}

function isValidMatrix(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    value.every(isFiniteNumber)
  );
}

export function parseCameraTextureProjectionCapture(
  text: string,
): CameraTextureProjectionCapture | null {
  const index = text.indexOf(CAMERA_TEXTURE_CAPTURE_PREFIX);
  if (index < 0) return null;
  try {
    const value = JSON.parse(
      text.slice(index + CAMERA_TEXTURE_CAPTURE_PREFIX.length),
    ) as Partial<CameraTextureProjectionCapture>;
    if (
      value.version !== 5 ||
      !Number.isInteger(value.frame) ||
      typeof value.storySignature !== "string" ||
      typeof value.stageSignature !== "string" ||
      typeof value.cameraSignature !== "string" ||
      typeof value.planId !== "string" ||
      !value.stage ||
      !isFiniteNumber(value.stage.width) ||
      !isFiniteNumber(value.stage.height) ||
      !Array.isArray(value.outputs) ||
      value.outputs.length === 0 ||
      value.outputs.some(
        (output) =>
          typeof output.outputId !== "string" ||
          typeof output.sourceStageNodeId !== "string" ||
          !Number.isInteger(output.zIndex) ||
          !isValidRect(output.viewport) ||
          !isValidMatrix(output.viewMatrix) ||
          !isFiniteNumber(output.opacity) ||
          !isFiniteNumber(output.clipRadiusPx) ||
          !output.quality ||
          !output.quality.pose ||
          !isFiniteNumber(output.quality.pose.centerX) ||
          !isFiniteNumber(output.quality.pose.centerY) ||
          !isFiniteNumber(output.quality.pose.scale) ||
          !isFiniteNumber(output.quality.pose.rotationDeg) ||
          (output.quality.subjectResolution !== "direct" &&
            output.quality.subjectResolution !== "explicit-fallback") ||
          !isFiniteNumber(output.quality.subjectFillRatio) ||
          !isFiniteNumber(output.quality.cropCompensation) ||
          typeof output.quality.intentionalDiscontinuity !== "boolean" ||
          !output.quality.travel ||
          (output.quality.travel.mode !== "intentional" &&
            (output.quality.travel.mode !== "stabilized" ||
              !Array.isArray(output.quality.travel.driftPx) ||
              output.quality.travel.driftPx.length !== 2 ||
              !output.quality.travel.driftPx.every(isFiniteNumber) ||
              !Array.isArray(output.quality.travel.maxDriftPx) ||
              output.quality.travel.maxDriftPx.length !== 2 ||
              !output.quality.travel.maxDriftPx.every(isFiniteNumber))) ||
          (output.shadow !== undefined &&
            (!isFiniteNumber(output.shadow.offsetX) ||
              !isFiniteNumber(output.shadow.offsetY) ||
              !isFiniteNumber(output.shadow.blurPx) ||
              !isFiniteNumber(output.shadow.opacity))) ||
          !Array.isArray(output.projectionPasses),
      )
    ) {
      return null;
    }
    return value as CameraTextureProjectionCapture;
  } catch {
    return null;
  }
}
