import { describe, expect, it } from "vitest";

import {
  clamp01,
  easeOutCubic,
  frameProgress,
  loopProgress,
  pulse,
  triangleWave,
} from "./motion.js";

describe("deterministic motion primitives", () => {
  it("clamps and eases bounded progress", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(frameProgress(15, 10, 10)).toBe(0.5);
    expect(easeOutCubic(0.5)).toBe(0.875);
  });

  it("derives periodic motion from frame and fps only", () => {
    expect(loopProgress(0, 30, 1)).toBe(0);
    expect(loopProgress(15, 30, 1)).toBe(0.5);
    expect(loopProgress(30, 30, 1)).toBe(0);
    expect(pulse(0, 30, 1)).toBe(0);
    expect(pulse(15, 30, 1)).toBe(1);
    expect(triangleWave(15, 30, 1)).toBe(1);
  });

  it("keeps delayed loops stable before their nominal start", () => {
    expect(loopProgress(0, 30, 1, 0.25)).toBe(0.75);
    expect(loopProgress(0, 30, 1, 0.25)).toBe(loopProgress(0, 30, 1, 0.25));
  });
});
