import type { CameraProjectionPass, Matrix3 } from "@tokovo/camera";

export const CAMERA_TEXTURE_CAPTURE_PREFIX = "TOKOVO_CAMERA_TEXTURE_FRAME:";

export type CameraRenderLayer =
  | "final"
  | "underlay"
  | "camera-plate"
  | "camera-projection-data"
  | "foreground-plate";

export interface CameraTextureProjectionCapture {
  version: 2;
  frame: number;
  storySignature: string;
  stageSignature: string;
  cameraSignature: string;
  planId: string;
  stage: { width: number; height: number };
  outputs: readonly {
    outputId: string;
    viewport: { x: number; y: number; width: number; height: number };
    viewMatrix: Matrix3;
    opacity: number;
    clipRadiusPx: number;
    projectionPasses: readonly CameraProjectionPass[];
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
    ) as CameraTextureProjectionCapture;
    if (value.version !== 2 || !Number.isInteger(value.frame) || !Array.isArray(value.outputs)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}
