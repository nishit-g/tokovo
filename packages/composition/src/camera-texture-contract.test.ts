import { describe, expect, it } from "vitest";
import {
  encodeCameraTextureProjectionCapture,
  parseCameraTextureProjectionCapture,
  type CameraTextureProjectionCapture,
} from "./camera-texture-contract.js";

const fixture: CameraTextureProjectionCapture = {
  version: 5,
  frame: 42,
  storySignature: "story",
  stageSignature: "stage",
  cameraSignature: "camera",
  planId: "main",
  stage: { width: 1080, height: 1920 },
  outputs: [
    {
      outputId: "main",
      sourceStageNodeId: "stage.root",
      zIndex: 0,
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      viewMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      opacity: 1,
      clipRadiusPx: 0,
      projectionPasses: [],
      quality: {
        pose: {
          centerX: 540,
          centerY: 960,
          scale: 1,
          rotationDeg: 0,
        },
        subjectResolution: "direct",
        subjectFillRatio: 0.8,
        cropCompensation: 0,
        intentionalDiscontinuity: false,
        travel: { mode: "intentional" },
      },
    },
  ],
};

describe("camera texture projection contract", () => {
  it("round-trips valid captures embedded in renderer output", () => {
    expect(
      parseCameraTextureProjectionCapture(
        `renderer-log\n${encodeCameraTextureProjectionCapture(fixture)}`,
      ),
    ).toEqual(fixture);
  });

  it("rejects malformed and obsolete captures", () => {
    expect(parseCameraTextureProjectionCapture("no capture")).toBeNull();
    expect(
      parseCameraTextureProjectionCapture(
        encodeCameraTextureProjectionCapture({
          ...fixture,
          outputs: [],
        }),
      ),
    ).toBeNull();
  });
});
