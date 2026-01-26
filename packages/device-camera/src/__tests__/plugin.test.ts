import { describe, it, expect } from "vitest";
import { createDefaultCameraState, createZoomEffect } from "./fixtures";

describe("device-camera package", () => {
  it("fixtures should create valid camera state", () => {
    const state = createDefaultCameraState();
    expect(state.baseView).toBe("APP_VIEW");
    expect(state.layout.mode).toBe("SINGLE");
  });

  it("fixtures should create valid zoom effect", () => {
    const effect = createZoomEffect();
    expect(effect.type).toBe("zoom");
    expect(effect.targetScale).toBe(1.5);
  });
});
