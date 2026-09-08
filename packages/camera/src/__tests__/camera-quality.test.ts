import { describe, expect, it } from "vitest";

import { analyzeCameraTemporalQuality } from "../quality.js";
import type { CameraQualitySample } from "../types.js";

function sample(frame: number, patch: Partial<CameraQualitySample> = {}): CameraQualitySample {
  return {
    frame,
    outputId: "main",
    viewport: { x: 0, y: 0, width: 1080, height: 1920 },
    pose: {
      centerX: frame * 2,
      centerY: frame,
      scale: 1 + frame * 0.001,
      rotationDeg: 0,
    },
    subjectResolution: "direct",
    subjectFillRatio: 0.72,
    cropCompensation: 0,
    intentionalDiscontinuity: false,
    travel: {
      mode: "stabilized",
      driftPx: [12, 18],
      maxDriftPx: [54, 72],
    },
    ...patch,
  };
}

describe("camera temporal quality", () => {
  it("accepts a contiguous smooth random-access trajectory", () => {
    const report = analyzeCameraTemporalQuality([sample(0), sample(1), sample(2), sample(3)]);

    expect(report.passed).toBe(true);
    expect(report.sampleCount).toBe(4);
    expect(report.outputs[0]?.missingFrameRanges).toEqual([]);
    expect(report.outputs[0]?.discontinuityFrames).toEqual([]);
  });

  it("reports missing frames and unauthored pose jumps", () => {
    const report = analyzeCameraTemporalQuality([
      sample(0),
      sample(2, {
        pose: { centerX: 10_000, centerY: 10_000, scale: 4, rotationDeg: 45 },
      }),
    ]);

    expect(report.passed).toBe(false);
    expect(report.violations.map((violation) => violation.code)).toEqual([
      "CAM_QUALITY_FRAME_GAP",
      "CAM_QUALITY_POSE_DISCONTINUITY",
    ]);
  });

  it("allows a jump only when the camera program marks it intentional", () => {
    const report = analyzeCameraTemporalQuality([
      sample(0),
      sample(1, {
        pose: { centerX: 10_000, centerY: 10_000, scale: 4, rotationDeg: 45 },
        intentionalDiscontinuity: true,
      }),
    ]);

    expect(report.violations).toEqual([]);
    expect(report.passed).toBe(true);
  });

  it("rejects smooth camera motion that drags a stabilized device out of composition", () => {
    const report = analyzeCameraTemporalQuality([
      sample(0),
      sample(1, {
        travel: {
          mode: "stabilized",
          driftPx: [55, -120],
          maxDriftPx: [54, 72],
        },
      }),
    ]);

    expect(report.passed).toBe(false);
    expect(report.violations).toEqual([
      expect.objectContaining({
        code: "CAM_QUALITY_MOUNT_DRIFT",
        frame: 1,
      }),
    ]);
  });

  it("records explicit macro travel without applying a stabilization limit", () => {
    const report = analyzeCameraTemporalQuality([
      sample(0, { travel: { mode: "intentional" } }),
      sample(1, { travel: { mode: "intentional" } }),
    ]);

    expect(report.passed).toBe(true);
    expect(report.outputs[0]).toEqual(
      expect.objectContaining({
        stabilizedFrameCount: 0,
        intentionalTravelFrameCount: 2,
        maximumMountDriftPx: [0, 0],
      }),
    );
  });
});
