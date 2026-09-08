import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";
import type { CameraTextureProjectionCapture } from "@tokovo/composition";

import {
  createCameraCompositorCaptureSignature,
  createCameraCompositorChunkCacheKey,
  lookupCameraCompositorChunk,
  storeCameraCompositorChunk,
  type CameraCompositorChunkIdentity,
} from "./camera-compositor-chunk-cache";

const temporaryDirectories: string[] = [];

function capture(
  frame: number,
  overrides: Partial<CameraTextureProjectionCapture> = {},
): CameraTextureProjectionCapture {
  return {
    version: 5,
    frame,
    storySignature: "story-a",
    stageSignature: "stage-a",
    cameraSignature: "camera-a",
    planId: "optical",
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
          pose: { centerX: 540, centerY: 960, scale: 1, rotationDeg: 0 },
          subjectResolution: "direct",
          subjectFillRatio: 0.72,
          cropCompensation: 1,
          intentionalDiscontinuity: false,
          travel: { mode: "intentional" },
        },
      },
    ],
    ...overrides,
  };
}

function identity(
  overrides: Partial<CameraCompositorChunkIdentity> = {},
): CameraCompositorChunkIdentity {
  return {
    compositorSignature: "camera-texture-compositor-v2",
    plateKeys: {
      underlay: "underlay-a",
      stage: "stage-a",
      foreground: "foreground-a",
    },
    captureSignature: createCameraCompositorCaptureSignature([capture(0), capture(1)]),
    sourceFrameRange: [0, 1],
    fps: 30,
    width: 1080,
    height: 1920,
    videoBitrate: "18M",
    x264Preset: "slow",
    encodingSignature: "libx264-yuv420p-filter-threads1",
    ...overrides,
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("camera compositor chunk cache", () => {
  it("keys exact pixels but ignores global plan identity", () => {
    const firstCapture = capture(0);
    const renamedPlan = capture(0, {
      cameraSignature: "camera-b",
      planId: "director-recut",
    });
    expect(createCameraCompositorCaptureSignature([renamedPlan])).toBe(
      createCameraCompositorCaptureSignature([firstCapture]),
    );

    const reframed = capture(0);
    reframed.outputs[0].viewMatrix = [1.1, 0, -54, 0, 1.1, -96, 0, 0, 1];
    expect(createCameraCompositorCaptureSignature([reframed])).not.toBe(
      createCameraCompositorCaptureSignature([firstCapture]),
    );
  });

  it("invalidates a chunk when its camera pixels, plates, or encoder change", () => {
    const first = createCameraCompositorChunkCacheKey(identity());
    expect(createCameraCompositorChunkCacheKey(identity())).toBe(first);
    expect(
      createCameraCompositorChunkCacheKey(
        identity({
          captureSignature: createCameraCompositorCaptureSignature([capture(10)]),
        }),
      ),
    ).not.toBe(first);
    expect(
      createCameraCompositorChunkCacheKey(
        identity({
          plateKeys: {
            underlay: "underlay-a",
            stage: "stage-b",
            foreground: "foreground-a",
          },
        }),
      ),
    ).not.toBe(first);
    expect(createCameraCompositorChunkCacheKey(identity({ x264Preset: "medium" }))).not.toBe(first);
  });

  it("reuses untouched seconds after a local camera recut", () => {
    const firstSecond = Array.from({ length: 30 }, (_, frame) => capture(frame));
    const secondSecond = Array.from({ length: 30 }, (_, index) => capture(index + 30));
    const recutSecond = secondSecond.map((entry) => structuredClone(entry));
    recutSecond[5].outputs[0].viewMatrix = [1.1, 0, -54, 0, 1.1, -96, 0, 0, 1];

    const firstKey = createCameraCompositorChunkCacheKey(
      identity({
        captureSignature: createCameraCompositorCaptureSignature(firstSecond),
        sourceFrameRange: [0, 29],
      }),
    );
    const firstRecutKey = createCameraCompositorChunkCacheKey(
      identity({
        captureSignature: createCameraCompositorCaptureSignature(firstSecond),
        sourceFrameRange: [0, 29],
      }),
    );
    const secondKey = createCameraCompositorChunkCacheKey(
      identity({
        captureSignature: createCameraCompositorCaptureSignature(secondSecond),
        sourceFrameRange: [30, 59],
      }),
    );
    const secondRecutKey = createCameraCompositorChunkCacheKey(
      identity({
        captureSignature: createCameraCompositorCaptureSignature(recutSecond),
        sourceFrameRange: [30, 59],
      }),
    );
    expect(firstRecutKey).toBe(firstKey);
    expect(secondRecutKey).not.toBe(secondKey);
  });

  it("stores, verifies, and rejects corrupted chunks", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "tokovo-camera-chunk-cache-test-"));
    temporaryDirectories.push(root);
    const sourcePath = path.join(root, "source.mp4");
    const cacheRoot = path.join(root, "cache");
    await fs.writeFile(sourcePath, "deterministic-camera-chunk", "utf8");

    const stored = await storeCameraCompositorChunk({
      identity: identity(),
      sourcePath,
      cacheRoot,
    });
    expect(await lookupCameraCompositorChunk(identity(), cacheRoot)).toEqual(stored);

    await fs.writeFile(stored.chunkPath, "corrupt", "utf8");
    expect(await lookupCameraCompositorChunk(identity(), cacheRoot)).toMatchObject({
      status: "miss",
      reason: "size-mismatch",
    });
  });
});
