export const REFERENCE_RELEASE_PERFORMANCE_BUDGET = {
  episodeId: "x-the-last-frame",
  cameraPlanId: "optical",
  durationInFrames: 1140,
  coldMs: 300_000,
  warmMs: 60_000,
  maximumWarmToColdRatio: 0.5,
} as const;

export interface ReferenceRenderPerformanceResult {
  passed: boolean;
  violations: string[];
  coldMs: number;
  warmMs: number;
  warmToColdRatio: number;
  outputHashesMatch: boolean;
}

export function evaluateReferenceRenderPerformance(input: {
  coldMs: number;
  warmMs: number;
  coldVideoSha256: string;
  warmVideoSha256: string;
  coldPosterSha256: string;
  warmPosterSha256: string;
  coldDurationInFrames?: number;
  warmDurationInFrames?: number;
  expectedDurationInFrames?: number;
  coldBudgetMs?: number;
  warmBudgetMs?: number;
  maximumWarmToColdRatio?: number;
}): ReferenceRenderPerformanceResult {
  const coldBudgetMs = input.coldBudgetMs ?? REFERENCE_RELEASE_PERFORMANCE_BUDGET.coldMs;
  const warmBudgetMs = input.warmBudgetMs ?? REFERENCE_RELEASE_PERFORMANCE_BUDGET.warmMs;
  const maximumWarmToColdRatio =
    input.maximumWarmToColdRatio ?? REFERENCE_RELEASE_PERFORMANCE_BUDGET.maximumWarmToColdRatio;
  const warmToColdRatio =
    input.coldMs <= 0 ? Number.POSITIVE_INFINITY : input.warmMs / input.coldMs;
  const outputHashesMatch =
    input.coldVideoSha256 === input.warmVideoSha256 &&
    input.coldPosterSha256 === input.warmPosterSha256;
  const violations: string[] = [];

  if (input.coldMs > coldBudgetMs) {
    violations.push(`Cold release ${input.coldMs}ms exceeded ${coldBudgetMs}ms budget.`);
  }
  if (input.warmMs > warmBudgetMs) {
    violations.push(`Warm release ${input.warmMs}ms exceeded ${warmBudgetMs}ms budget.`);
  }
  if (warmToColdRatio > maximumWarmToColdRatio) {
    violations.push(
      `Warm/cold ratio ${warmToColdRatio.toFixed(3)} exceeded ${maximumWarmToColdRatio.toFixed(3)}.`,
    );
  }
  if (!outputHashesMatch) {
    violations.push("Cold and warm release artifacts were not byte-identical.");
  }
  const expectedDurationInFrames =
    input.expectedDurationInFrames ?? REFERENCE_RELEASE_PERFORMANCE_BUDGET.durationInFrames;
  if (
    input.coldDurationInFrames !== undefined &&
    input.coldDurationInFrames !== expectedDurationInFrames
  ) {
    violations.push(
      `Cold artifact has ${input.coldDurationInFrames} frames; expected ${expectedDurationInFrames}.`,
    );
  }
  if (
    input.warmDurationInFrames !== undefined &&
    input.warmDurationInFrames !== expectedDurationInFrames
  ) {
    violations.push(
      `Warm artifact has ${input.warmDurationInFrames} frames; expected ${expectedDurationInFrames}.`,
    );
  }

  return {
    passed: violations.length === 0,
    violations,
    coldMs: input.coldMs,
    warmMs: input.warmMs,
    warmToColdRatio,
    outputHashesMatch,
  };
}
