import { describe, expect, it } from "vitest";
import type { CameraProjectionPass } from "@tokovo/camera";
import {
  CameraProjectionPassRegistrationError,
  CameraProjectionPassRegistry,
  createBuiltinCameraProjectionPassRegistry,
  selectCameraProjectionBackend,
} from "../camera/projectionBackend.js";

const perspective: CameraProjectionPass = {
  kind: "projective-warp",
  tiltXDeg: 10,
  tiltYDeg: 0,
  perspectivePx: 1200,
  cropCompensation: 1.05,
};

const fisheye: CameraProjectionPass = {
  kind: "fisheye-warp",
  center: [0.5, 0.5],
  strength: 0.2,
  radius: 1,
  cropCompensation: 1.1,
};

describe("camera projection backend selection", () => {
  it("keeps affine/projective output on the composited fast path", () => {
    expect(selectCameraProjectionBackend({ mode: "render", passes: [] })).toBe(
      "affine-css",
    );
    expect(
      selectCameraProjectionBackend({ mode: "render", passes: [perspective] }),
    ).toBe("affine-css");
  });

  it("allows SVG only for preview and requires textures for release optics", () => {
    expect(
      selectCameraProjectionBackend({ mode: "preview", passes: [fisheye] }),
    ).toBe("preview-svg");
    expect(
      selectCameraProjectionBackend({ mode: "render", passes: [fisheye] }),
    ).toBe("texture-compositor");
  });

  it("requires explicit kind/version renderer registration", () => {
    const builtins = createBuiltinCameraProjectionPassRegistry();
    expect(builtins.list()).toHaveLength(6);
    expect(() =>
      selectCameraProjectionBackend({
        mode: "render",
        passes: [perspective],
        registry: new CameraProjectionPassRegistry(),
      }),
    ).toThrow(CameraProjectionPassRegistrationError);
  });
});
