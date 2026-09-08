import { describe, expect, it } from "vitest";

import {
  evaluateReferenceRenderPerformance,
  REFERENCE_RELEASE_PERFORMANCE_BUDGET,
} from "./render-performance";

describe("reference release performance budget", () => {
  it("accepts a fast byte-identical cold/warm pair", () => {
    expect(
      evaluateReferenceRenderPerformance({
        coldMs: 150_127,
        warmMs: 10_648,
        coldVideoSha256: "video",
        warmVideoSha256: "video",
        coldPosterSha256: "poster",
        warmPosterSha256: "poster",
      }),
    ).toMatchObject({
      passed: true,
      outputHashesMatch: true,
    });
  });

  it("reports budget, reuse ratio, and determinism regressions", () => {
    const result = evaluateReferenceRenderPerformance({
      coldMs: REFERENCE_RELEASE_PERFORMANCE_BUDGET.coldMs + 1,
      warmMs: REFERENCE_RELEASE_PERFORMANCE_BUDGET.warmMs * 3 + 1,
      coldVideoSha256: "cold-video",
      warmVideoSha256: "warm-video",
      coldPosterSha256: "poster",
      warmPosterSha256: "poster",
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(4);
  });
});
