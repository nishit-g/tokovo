import { describe, expect, it } from "vitest";
import {
  DEFAULT_VOICE_DUCKING_CONFIG,
  computeVoiceDuckMultiplierAtFrame,
  type VoiceDuckingRange,
} from "../voice-ducking";

describe("computeVoiceDuckMultiplierAtFrame", () => {
  const ranges: VoiceDuckingRange[] = [
    { startFrame: 10, endFrame: 20 },
    { startFrame: 40, endFrame: 50 },
  ];

  it("returns neutral gain outside active and release windows", () => {
    expect(computeVoiceDuckMultiplierAtFrame(0, ranges)).toBe(1);
    expect(computeVoiceDuckMultiplierAtFrame(100, ranges)).toBe(1);
  });

  it("applies attack during the start of a voice segment", () => {
    const value = computeVoiceDuckMultiplierAtFrame(12, ranges);
    expect(value).toBeLessThan(1);
    expect(value).toBeGreaterThan(DEFAULT_VOICE_DUCKING_CONFIG.duckAmount);
  });

  it("hits the configured duck amount while voice is active", () => {
    expect(computeVoiceDuckMultiplierAtFrame(18, ranges)).toBe(
      DEFAULT_VOICE_DUCKING_CONFIG.duckAmount,
    );
  });

  it("releases back to full gain after voice ends", () => {
    const value = computeVoiceDuckMultiplierAtFrame(30, ranges);
    expect(value).toBeGreaterThan(DEFAULT_VOICE_DUCKING_CONFIG.duckAmount);
    expect(value).toBeLessThan(1);
  });
});
