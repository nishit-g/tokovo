import type { CameraProjectionPass, CameraQualitySample, Matrix3 } from "@tokovo/camera";

export const CAMERA_TEXTURE_CAPTURE_PREFIX = "TOKOVO_CAMERA_TEXTURE_FRAME:";

export type CameraRenderLayer =
  | "final"
  | "underlay"
  | "camera-plate"
  | "camera-projection-data"
  | "foreground-plate";

export interface CameraTextureProjectionCapture {
  version: 4;
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
    shadow?: { offsetX: number; offsetY: number; blurPx: number; opacity: number };
    projectionPasses: readonly CameraProjectionPass[];
    quality: Omit<CameraQualitySample, "frame" | "outputId" | "viewport">;
  }[];
}

export function encodeCameraTextureProjectionCapture(
  capture: CameraTextureProjectionCapture,
): string {
  return `${CAMERA_TEXTURE_CAPTURE_PREFIX}${JSON.stringify(capture)}`;
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
    const validRect = (rect: unknown): boolean => {
      if (!rect || typeof rect !== "object") return false;
      const candidate = rect as Record<string, unknown>;
      return [candidate.x, candidate.y, candidate.width, candidate.height].every(
        (entry) => typeof entry === "number" && Number.isFinite(entry),
      );
    };
    const validMatrix = (matrix: unknown): boolean =>
      Array.isArray(matrix) &&
      matrix.length === 9 &&
      matrix.every((entry) => typeof entry === "number" && Number.isFinite(entry));
    if (
      value.version !== 4 ||
      !Number.isInteger(value.frame) ||
      typeof value.storySignature !== "string" ||
      typeof value.stageSignature !== "string" ||
      typeof value.cameraSignature !== "string" ||
      typeof value.planId !== "string" ||
      !value.stage ||
      !Number.isFinite(value.stage.width) ||
      !Number.isFinite(value.stage.height) ||
      !Array.isArray(value.outputs) ||
      value.outputs.length === 0 ||
      value.outputs.some(
        (output) =>
          typeof output.outputId !== "string" ||
          typeof output.sourceStageNodeId !== "string" ||
          !Number.isInteger(output.zIndex) ||
          !validRect(output.viewport) ||
          !validMatrix(output.viewMatrix) ||
          !Number.isFinite(output.opacity) ||
          !Number.isFinite(output.clipRadiusPx) ||
          !output.quality ||
          !output.quality.pose ||
          !Number.isFinite(output.quality.pose.centerX) ||
          !Number.isFinite(output.quality.pose.centerY) ||
          !Number.isFinite(output.quality.pose.scale) ||
          !Number.isFinite(output.quality.pose.rotationDeg) ||
          (output.quality.subjectResolution !== "direct" &&
            output.quality.subjectResolution !== "explicit-fallback") ||
          !Number.isFinite(output.quality.subjectFillRatio) ||
          !Number.isFinite(output.quality.cropCompensation) ||
          typeof output.quality.intentionalDiscontinuity !== "boolean" ||
          (output.shadow !== undefined &&
            (!Number.isFinite(output.shadow.offsetX) ||
              !Number.isFinite(output.shadow.offsetY) ||
              !Number.isFinite(output.shadow.blurPx) ||
              !Number.isFinite(output.shadow.opacity))) ||
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
