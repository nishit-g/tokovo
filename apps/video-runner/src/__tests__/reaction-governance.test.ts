import { describe, expect, it } from "vitest";
import { createFixtureReactionPlan } from "@tokovo/reactions";
import {
  assertReactionPlanReadyForRender,
  getReactionPlanGovernanceStatus,
} from "../reaction-governance";

describe("reaction render governance", () => {
  it("rejects draft reaction plans for render mode", () => {
    const draftPlan = createFixtureReactionPlan({
      reviewState: "draft",
    });

    expect(getReactionPlanGovernanceStatus(draftPlan).canRender).toBe(false);
    expect(() => assertReactionPlanReadyForRender(draftPlan)).toThrowError(
      /approved-render/,
    );
  });

  it("allows approved reaction plans for render mode", () => {
    const approvedPlan = createFixtureReactionPlan({
      reviewState: "approved-render",
    });

    expect(getReactionPlanGovernanceStatus(approvedPlan).canRender).toBe(true);
    expect(() => assertReactionPlanReadyForRender(approvedPlan)).not.toThrow();
  });
});
