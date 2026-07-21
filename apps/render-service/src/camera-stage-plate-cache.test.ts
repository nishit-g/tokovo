import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createCameraStagePlateCacheKey,
  lookupCameraStagePlate,
  storeCameraStagePlate,
  type CameraStagePlateIdentity,
} from "./camera-stage-plate-cache";

const temporaryDirectories: string[] = [];

function identity(overrides: Partial<CameraStagePlateIdentity> = {}): CameraStagePlateIdentity {
  return {
    episodeId: "whatsapp-flagship-v2",
    stagePainterSignature: "painter-a",
    storySignature: "story-a",
    stageSignature: "stage-a",
    frameRange: [540, 542],
    fps: 30,
    width: 1290,
    height: 2796,
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

describe("camera stage-plate cache", () => {
  it("keys reusable pixels without accepting CameraPlan identity", () => {
    const first = createCameraStagePlateCacheKey(identity());
    expect(createCameraStagePlateCacheKey(identity())).toBe(first);
    expect(
      createCameraStagePlateCacheKey(identity({ stagePainterSignature: "painter-b" })),
    ).not.toBe(first);
    expect(createCameraStagePlateCacheKey(identity({ storySignature: "story-b" }))).not.toBe(first);
    expect(createCameraStagePlateCacheKey(identity({ frameRange: [541, 542] }))).not.toBe(first);
  });

  it("stores, verifies, and rejects corrupted plates", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "tokovo-camera-stage-cache-test-"));
    temporaryDirectories.push(root);
    const sourcePath = path.join(root, "source.mov");
    const cacheRoot = path.join(root, "cache");
    await fs.writeFile(sourcePath, "deterministic-stage-pixels", "utf8");

    const stored = await storeCameraStagePlate({
      identity: identity(),
      sourcePath,
      cacheRoot,
    });
    expect(await lookupCameraStagePlate(identity(), cacheRoot)).toEqual(stored);
    const manifest = JSON.parse(
      await fs.readFile(stored.platePath.replace(/\.mov$/, ".json"), "utf8"),
    ) as { identity: Record<string, unknown> };
    expect(manifest.identity).toMatchObject({
      storySignature: "story-a",
      stageSignature: "stage-a",
      stagePainterSignature: "painter-a",
    });
    expect(manifest.identity).not.toHaveProperty("cameraPlanId");
    expect(manifest.identity).not.toHaveProperty("cameraSignature");

    await fs.writeFile(stored.platePath, "corrupt", "utf8");
    expect(await lookupCameraStagePlate(identity(), cacheRoot)).toMatchObject({
      status: "miss",
      reason: "size-mismatch",
    });
  });
});
