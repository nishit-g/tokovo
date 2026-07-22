import { describe, expect, it } from "vitest";
import {
  TIMING,
  LAYOUT,
  DEFAULTS,
  DEVICE_PROFILES,
  EVENT_KINDS,
  secondsToFrames,
  framesToSeconds,
  DURATION_FRAMES,
} from "../constants.js";

describe("core constants", () => {
  it("exposes timing helpers and duration frames", () => {
    expect(secondsToFrames(1, 30)).toBe(30);
    expect(framesToSeconds(60, 30)).toBe(2);
    expect(DURATION_FRAMES.ONE_SECOND).toBe(30);
  });

  it("exports engine constants", () => {
    expect(TIMING.FPS_DEFAULT).toBe(30);
    expect(LAYOUT.MESSAGE_BUBBLE_RADIUS).toBeGreaterThan(0);
    expect(DEFAULTS.VOLUME).toBe(1);
    expect(DEVICE_PROFILES.IPHONE_16).toBe("iphone16");
    expect(EVENT_KINDS.DEVICE).toBe("DEVICE");
  });
});
