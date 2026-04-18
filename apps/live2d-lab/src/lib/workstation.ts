import type { ReactionPlan } from "@tokovo/reactions";
import {
  buildReactorFrameState,
  type ReactorCardOverride,
  type ReactorCardState,
} from "@tokovo/reactors";

export type WorkbenchCardOverride = ReactorCardOverride;

export interface BuildWorkbenchCardOptions {
  plan: ReactionPlan;
  actorId: string;
  frame: number;
  override?: WorkbenchCardOverride;
}

export function buildWorkbenchCard({
  plan,
  actorId,
  frame,
  override,
}: BuildWorkbenchCardOptions): ReactorCardState {
  const frameState = buildReactorFrameState(plan, frame, {
    showCaptions: true,
    showChrome: true,
    cardOverrides: override
      ? {
          [actorId]: override,
        }
      : undefined,
  });
  const existingCard = frameState.cards.find((card) => card.id === actorId);

  if (!existingCard) {
    throw new Error(`Unknown workstation actor: ${actorId}`);
  }
  return existingCard;
}
