import { describe, expect, it } from "vitest";
import {
  buildReactionDirectorPrompts,
  assertReactionPlanApprovedForRender,
  createFixtureReactionPlan,
  createNormalizedReactionSource,
  draftReactionPlanFromSource,
  transitionReactionPlanState,
} from "./index.js";

describe("reaction director", () => {
  it("builds pinned prompt refs for the full director prompt set", () => {
    const source = createNormalizedReactionSource({
      id: "source-1",
      sourceRef: { kind: "tokovo_episode", episodeId: "episode-1" },
      title: "Text thread meltdown",
      synopsis: "A short chat escalates into a public roast.",
      transcript: [
        {
          id: "line-1",
          text: "The first reply is already out of pocket.",
          startFrame: 10,
          endFrame: 36,
        },
      ],
    });

    const prompts = buildReactionDirectorPrompts({
      id: "req-1",
      mode: "assist",
      source,
      cast: createFixtureReactionPlan().cast,
      formatPreset: "stream-chaos-vertical",
    });

    expect(prompts).toHaveLength(5);
    expect(prompts.map((prompt) => prompt.versionRef)).toEqual([
      "reaction.setup@v1",
      "reaction.interruption-points@v1",
      "reaction.escalation@v1",
      "reaction.punchline@v1",
      "reaction.exit-hook@v1",
    ]);
    expect(prompts[0]?.userPrompt).toMatch(/Text thread meltdown/);
  });

  it("creates deterministic draft plans from normalized sources", () => {
    const source = createNormalizedReactionSource({
      id: "source-2",
      sourceRef: { kind: "tokovo_episode", episodeId: "episode-2" },
      title: "Scam call chaos",
      synopsis: "An obvious scam caller still manages to surprise everyone.",
      transcript: [
        {
          id: "line-1",
          text: "Why is he still pretending to be from the bank?",
          startFrame: 18,
          endFrame: 46,
        },
        {
          id: "line-2",
          text: "He just asked for the OTP on speaker.",
          startFrame: 52,
          endFrame: 84,
        },
      ],
    });
    const cast = createFixtureReactionPlan().cast;

    const first = draftReactionPlanFromSource({
      id: "draft-1",
      mode: "assist",
      source,
      cast,
      formatPreset: "stream-chaos-vertical",
      version: "1",
      targetDurationFrames: 120,
    });
    const second = draftReactionPlanFromSource({
      id: "draft-1",
      mode: "assist",
      source,
      cast,
      formatPreset: "stream-chaos-vertical",
      version: "1",
      targetDurationFrames: 120,
    });

    expect(first.contentHash).toBe(second.contentHash);
    expect(first.promptVersionRefs).toEqual([
      "reaction.setup@v1",
      "reaction.interruption-points@v1",
      "reaction.escalation@v1",
      "reaction.punchline@v1",
      "reaction.exit-hook@v1",
    ]);
    expect(first.segments).toHaveLength(2);
    expect(first.segments[0]?.speakerId).toBe(cast[0]?.id);
  });

  it("honors caller-pinned prompt refs when drafting a plan", () => {
    const source = createNormalizedReactionSource({
      id: "source-3",
      sourceRef: { kind: "tokovo_episode", episodeId: "episode-3" },
      title: "Receipts dropped",
      synopsis: "The group chat finds the leaked screenshots.",
      transcript: [
        {
          id: "line-1",
          text: "The receipts are public now.",
        },
      ],
    });

    const plan = draftReactionPlanFromSource({
      id: "draft-2",
      mode: "assist",
      source,
      cast: createFixtureReactionPlan().cast,
      formatPreset: "stream-chaos-vertical",
      version: "1",
      promptVersionRefs: [
        "studio.setup@v7",
        "studio.interruptions@v7",
        "studio.escalation@v7",
        "studio.punchline@v7",
        "studio.exit@v7",
      ],
    });

    expect(plan.promptVersionRefs).toEqual([
      "studio.setup@v7",
      "studio.interruptions@v7",
      "studio.escalation@v7",
      "studio.punchline@v7",
      "studio.exit@v7",
    ]);
  });

  it("enforces monotonic review-state transitions", () => {
    const plan = createFixtureReactionPlan();
    const lockedScript = transitionReactionPlanState(plan, "locked-script");
    const approved = transitionReactionPlanState(
      {
        ...lockedScript,
        reviewState: "locked-audio",
      },
      "approved-render",
    );

    expect(lockedScript.reviewState).toBe("locked-script");
    expect(approved.reviewState).toBe("approved-render");
    expect(() =>
      transitionReactionPlanState(lockedScript, "draft"),
    ).toThrowError(/Invalid reaction review state transition/);
  });

  it("rejects rendering plans that are not approved", () => {
    const draftPlan = createFixtureReactionPlan({
      reviewState: "draft",
    });

    expect(() => assertReactionPlanApprovedForRender(draftPlan)).toThrowError(
      /approved-render/,
    );
  });
});
