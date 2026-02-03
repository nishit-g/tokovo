import { describe, expect, it } from "vitest";
import { getAppConfig } from "../apps-config";
import {
  TIMING,
  LAYOUT,
  DEFAULTS,
  DEVICE_PROFILES,
  EVENT_KINDS,
  secondsToFrames,
  framesToSeconds,
  DURATION_FRAMES,
} from "../constants";
import { iOSTokens, androidTokens } from "../tokens";

describe("core constants and tokens", () => {
  it("returns homescreen configs by platform", () => {
    const ios = getAppConfig("homescreen", "ios");
    const android = getAppConfig("homescreen", "android");
    const unknown = getAppConfig("unknown", "ios");

    expect(ios.gridColumns).toBe(4);
    expect(android.gridColumns).toBe(5);
    expect(unknown).toEqual({});
  });

  it("exposes timing helpers and duration frames", () => {
    expect(secondsToFrames(1, 30)).toBe(30);
    expect(framesToSeconds(60, 30)).toBe(2);
    expect(DURATION_FRAMES.ONE_SECOND).toBe(30);
  });

  it("exports constants and tokens", () => {
    expect(TIMING.FPS_DEFAULT).toBe(30);
    expect(LAYOUT.MESSAGE_BUBBLE_RADIUS).toBeGreaterThan(0);
    expect(DEFAULTS.CAMERA_EASING).toBe("ease-out");
    expect(DEVICE_PROFILES.IPHONE_16).toBe("iphone16");
    expect(EVENT_KINDS.DEVICE).toBe("DEVICE");

    expect(iOSTokens.colors.primary).toBe("#007AFF");
    expect(androidTokens.colors.primary).toBe("#1A73E8");
  });
});
