import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createCameraLayerPainterSourceSignature,
  getBundleInputManifest,
  getCameraLayerPainterInputManifest,
} from "./bundle-manifest";

function normalizedDirectories(directories: readonly string[]): string[] {
  return directories.map((directory) => directory.split(path.sep).join("/"));
}

describe("render source manifests", () => {
  it("tracks authored sources and the compiled modules consumed by the bundle", () => {
    const directories = normalizedDirectories(
      getBundleInputManifest().directories,
    );
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/camera/src"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/camera/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/episodes/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/visual-system/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/stage/src"),
      ),
    ).toBe(true);
  });

  it("isolates camera-layer painting code from episode CameraPlan source", () => {
    const directories = normalizedDirectories(
      getCameraLayerPainterInputManifest().directories,
    );
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/renderer/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/apps-whatsapp/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/background/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/overlay/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/stage/dist"),
      ),
    ).toBe(true);
    expect(
      directories.some((directory) =>
        directory.endsWith("/packages/episodes/dist"),
      ),
    ).toBe(false);
    expect(createCameraLayerPainterSourceSignature()).toMatch(/^[a-f0-9]{32}$/);
  });
});
