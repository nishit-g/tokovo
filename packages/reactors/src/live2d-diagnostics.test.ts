import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateLive2DModelManifest } from "./live2d-diagnostics.js";

describe("validateLive2DModelManifest", () => {
  it("rejects placeholder manifests without real file references", () => {
    const result = validateLive2DModelManifest({
      version: 3,
      name: "stub",
      motions: {
        Idle: ["Idle_01"],
      },
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/FileReferences/);
  });

  it("accepts Cubism model3 manifests with moc and textures", () => {
    const result = validateLive2DModelManifest({
      Version: 3,
      FileReferences: {
        Moc: "model.moc3",
        Textures: ["texture_00.png"],
      },
    });

    expect(result.ok).toBe(true);
  });

  it("accepts the vendored Haru sample manifest used by the studio demo", () => {
    const manifestPath = fileURLToPath(
      new URL("../../../apps/video-runner/public/live2d/haru/Haru.model3.json", import.meta.url),
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const result = validateLive2DModelManifest(manifest);

    expect(result.ok).toBe(true);
    expect(manifest.FileReferences.Motions.Idle).toBeDefined();
    expect(manifest.FileReferences.Motions.TapBody).toBeDefined();
  });
});
