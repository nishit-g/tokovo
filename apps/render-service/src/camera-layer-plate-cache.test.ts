import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createCameraLayerPlateCacheKey,
  lookupCameraLayerPlate,
  storeCameraLayerPlate,
  type CameraLayerPlateIdentity,
} from "./camera-layer-plate-cache";

const temporaryDirectories: string[] = [];

function identity(
  overrides: Partial<CameraLayerPlateIdentity> = {},
): CameraLayerPlateIdentity {
  return {
    layer: "stage",
    episodeId: "whatsapp-cinematic-flagship",
    painterSignature: "painter-a",
    storySignature: "story-a",
    stageSignature: "stage-a",
    frameRange: [540, 542],
    fps: 30,
    width: 1080,
    height: 1920,
    encodingSignature: "prores-4444-yuva444p10le",
    ...overrides,
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

describe("camera layer-plate cache", () => {
  it("keys reusable pixels by layer without accepting CameraPlan identity", () => {
    const first = createCameraLayerPlateCacheKey(identity());
    expect(createCameraLayerPlateCacheKey(identity())).toBe(first);
    expect(
      createCameraLayerPlateCacheKey(
        identity({ painterSignature: "painter-b" }),
      ),
    ).not.toBe(first);
    expect(
      createCameraLayerPlateCacheKey(identity({ layer: "underlay" })),
    ).not.toBe(first);
    expect(
      createCameraLayerPlateCacheKey(identity({ storySignature: "story-b" })),
    ).not.toBe(first);
    expect(
      createCameraLayerPlateCacheKey(identity({ frameRange: [541, 542] })),
    ).not.toBe(first);
    expect(
      createCameraLayerPlateCacheKey(
        identity({ encodingSignature: "prores-standard-yuv422p10le" }),
      ),
    ).not.toBe(first);
  });

  it("stores, verifies, and rejects corrupted plates", async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), "tokovo-camera-layer-cache-test-"),
    );
    temporaryDirectories.push(root);
    const sourcePath = path.join(root, "source.mov");
    const cacheRoot = path.join(root, "cache");
    await fs.writeFile(sourcePath, "deterministic-layer-pixels", "utf8");

    const stored = await storeCameraLayerPlate({
      identity: identity(),
      sourcePath,
      cacheRoot,
    });
    expect(await lookupCameraLayerPlate(identity(), cacheRoot)).toEqual(stored);
    const manifest = JSON.parse(
      await fs.readFile(stored.platePath.replace(/\.mov$/, ".json"), "utf8"),
    ) as { identity: Record<string, unknown> };
    expect(manifest.identity).toMatchObject({
      layer: "stage",
      storySignature: "story-a",
      stageSignature: "stage-a",
      painterSignature: "painter-a",
    });
    expect(manifest.identity).not.toHaveProperty("cameraPlanId");
    expect(manifest.identity).not.toHaveProperty("cameraSignature");

    await fs.writeFile(stored.platePath, "corrupt", "utf8");
    expect(await lookupCameraLayerPlate(identity(), cacheRoot)).toMatchObject({
      status: "miss",
      reason: "size-mismatch",
    });
  });
});
