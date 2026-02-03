import { describe, expect, it } from "vitest";
import {
  configureEngine,
  getConfig,
  resetConfig,
  getTimingConfig,
  getKeyboardConfig,
  getAnimationConfig,
  getRenderingConfig,
  getAudioConfig,
  getCameraConfig,
  isDebugEnabled,
  enableDebug,
  disableDebug,
  ConfigValidationError,
} from "../config";

describe("engine config", () => {
  it("configures and resets config", () => {
    resetConfig();
    const before = getConfig();
    configureEngine({ rendering: { defaultFps: 60 } });
    expect(getConfig().rendering.defaultFps).toBe(60);
    resetConfig();
    expect(getConfig().rendering.defaultFps).toBe(before.rendering.defaultFps);
  });

  it("exposes config getters", () => {
    expect(getTimingConfig().effectCleanupBuffer).toBeGreaterThan(0);
    expect(getKeyboardConfig("ios").height).toBeGreaterThan(0);
    expect(getAnimationConfig().defaultDuration).toBeGreaterThan(0);
    expect(getRenderingConfig().maxEventsPerFrame).toBeGreaterThan(0);
    expect(getAudioConfig().defaultVolume).toBeGreaterThan(0);
    expect(getCameraConfig().minZoom).toBeGreaterThan(0);
  });

  it("validates config overrides", () => {
    expect(
      () => configureEngine({ rendering: { defaultFps: 0 } }),
    ).toThrow(ConfigValidationError);
  });

  it("toggles debug flags", () => {
    enableDebug("logEvents");
    expect(isDebugEnabled("logEvents")).toBe(true);
    disableDebug("logEvents");
    expect(isDebugEnabled("logEvents")).toBe(false);
  });
});
