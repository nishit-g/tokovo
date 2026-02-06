import { describe, expect, it } from "vitest";
import {
  TokovoConfig,
  createConfig,
  getTimingConfig,
  getKeyboardConfig,
  getAnimationConfig,
  getRenderingConfig,
  getAudioConfig,
  getCameraConfig,
  isDebugEnabled,
  ConfigValidationError,
} from "../config/index.js";

describe("engine config", () => {
  it("creates a new config without mutating the default", () => {
    const before = TokovoConfig.rendering.defaultFps;
    const custom = createConfig({ rendering: { defaultFps: 60 } });
    expect(custom.rendering.defaultFps).toBe(60);
    expect(TokovoConfig.rendering.defaultFps).toBe(before);
  });

  it("exposes config getters", () => {
    expect(getTimingConfig().effectCleanupBuffer).toBeGreaterThan(0);
    expect(getKeyboardConfig(undefined, "ios").height).toBeGreaterThan(0);
    expect(getAnimationConfig().defaultDuration).toBeGreaterThan(0);
    expect(getRenderingConfig().maxEventsPerFrame).toBeGreaterThan(0);
    expect(getAudioConfig().defaultVolume).toBeGreaterThan(0);
    expect(getCameraConfig().minZoom).toBeGreaterThan(0);
  });

  it("validates config overrides", () => {
    expect(
      () => createConfig({ rendering: { defaultFps: 0 } }),
    ).toThrow(ConfigValidationError);
  });

  it("reads debug flags from custom config", () => {
    const custom = createConfig({ debug: { logEvents: true } });
    expect(isDebugEnabled(custom, "logEvents")).toBe(true);
    expect(isDebugEnabled(custom, "showBoundingBoxes")).toBe(false);
  });
});
