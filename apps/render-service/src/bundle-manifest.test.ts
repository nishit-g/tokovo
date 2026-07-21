import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createStagePainterSourceSignature,
  getBundleInputManifest,
  getStagePainterInputManifest,
} from "./bundle-manifest";

function normalizedDirectories(directories: readonly string[]): string[] {
  return directories.map((directory) => directory.split(path.sep).join("/"));
}

describe("render source manifests", () => {
  it("tracks Camera VNext kernels in the complete bundle", () => {
    const directories = normalizedDirectories(getBundleInputManifest().directories);
    expect(directories.some((directory) => directory.endsWith("/packages/camera/src"))).toBe(true);
    expect(directories.some((directory) => directory.endsWith("/packages/stage/src"))).toBe(true);
  });

  it("isolates stage-painting code from episode CameraPlan source", () => {
    const directories = normalizedDirectories(getStagePainterInputManifest().directories);
    expect(directories.some((directory) => directory.endsWith("/packages/renderer/dist"))).toBe(
      true,
    );
    expect(
      directories.some((directory) => directory.endsWith("/packages/apps-whatsapp/dist")),
    ).toBe(true);
    expect(directories.some((directory) => directory.endsWith("/packages/stage/dist"))).toBe(true);
    expect(directories.some((directory) => directory.endsWith("/packages/episodes/dist"))).toBe(
      false,
    );
    expect(createStagePainterSourceSignature()).toMatch(/^[a-f0-9]{32}$/);
  });
});
