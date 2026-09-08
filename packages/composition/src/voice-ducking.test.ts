import { describe, expect, it } from "vitest";
import {
  DEFAULT_VOICE_DUCKING_CONFIG,
  computeVoiceDuckMultiplierAtFrame,
  type VoiceDuckingRange,
} from "./voice-ducking.js";

describe("computeVoiceDuckMultiplierAtFrame", () => {
  const ranges: VoiceDuckingRange[] = [
    { startFrame: 10, endFrame: 20 },
    { startFrame: 40, endFrame: 50 },
  ];

  it("returns neutral gain outside active and release windows", () => {
    expect(computeVoiceDuckMultiplierAtFrame(0, ranges)).toBe(1);
    expect(computeVoiceDuckMultiplierAtFrame(100, ranges)).toBe(1);
  });

  it("attacks, holds, and releases without gain discontinuities", () => {
    const attack = computeVoiceDuckMultiplierAtFrame(12, ranges);
    const hold = computeVoiceDuckMultiplierAtFrame(18, ranges);
    const release = computeVoiceDuckMultiplierAtFrame(30, ranges);

    expect(attack).toBeLessThan(1);
    expect(attack).toBeGreaterThan(
      DEFAULT_VOICE_DUCKING_CONFIG.duckAmount,
    );
    expect(hold).toBe(DEFAULT_VOICE_DUCKING_CONFIG.duckAmount);
    expect(release).toBeGreaterThan(
      DEFAULT_VOICE_DUCKING_CONFIG.duckAmount,
    );
    expect(release).toBeLessThan(1);
  });
});
