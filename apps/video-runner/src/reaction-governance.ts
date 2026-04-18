import type { ReactionPlan } from "@tokovo/reactions";

export interface ReactionPlanGovernanceStatus {
  reviewState: ReactionPlan["reviewState"];
  canPreview: boolean;
  canRender: boolean;
}

export function getReactionPlanGovernanceStatus(
  plan: ReactionPlan,
): ReactionPlanGovernanceStatus {
  return {
    reviewState: plan.reviewState,
    canPreview: true,
    canRender: plan.reviewState === "approved-render",
  };
}

export function assertReactionPlanReadyForRender(
  plan: ReactionPlan,
): ReactionPlan {
  if (plan.reviewState !== "approved-render") {
    throw new Error(
      `Reaction plan "${plan.id}" must be in approved-render state before render. Current state: ${plan.reviewState}`,
    );
  }

  return plan;
}
