import { describe, expect, it } from "vitest";
import { buildLabReactionPlan } from "./lab-state.js";
import { buildWorkbenchCard } from "./workstation.js";

describe("live2d workstation helpers", () => {
  it("uses timeline-driven state when no override is provided", () => {
    const plan = buildLabReactionPlan("duo-crossfire");
    const heroCard = buildWorkbenchCard({
      plan,
      actorId: "hero",
      frame: 170,
    });

    expect(heroCard.state).toBe("speaking");
    expect(heroCard.emotion).toBe("shocked");
    expect(heroCard.avatar.kind).toBe("live2d");
    expect(heroCard.avatar.kind === "live2d" ? heroCard.avatar.motion : null).toBe(
      "TapBody",
    );
  });

  it("supports deterministic manual overrides for workstation inspection", () => {
    const plan = buildLabReactionPlan("duo-crossfire");
    const guestCard = buildWorkbenchCard({
      plan,
      actorId: "guest",
      frame: 40,
      override: {
        state: "speaking",
        emotion: "deadpan",
      },
    });

    expect(guestCard.state).toBe("speaking");
    expect(guestCard.emotion).toBe("deadpan");
    expect(guestCard.avatar.kind).toBe("pngtuber");
    expect(guestCard.avatar.kind === "pngtuber" ? guestCard.avatar.frameKey : null).toBe(
      "deadpan",
    );
  });

  it("passes live2d avatar overrides through the workstation path", () => {
    const plan = buildLabReactionPlan("duo-crossfire");
    const heroCard = buildWorkbenchCard({
      plan,
      actorId: "hero",
      frame: 170,
      override: {
        state: "speaking",
        emotion: "happy",
        avatar: {
          kind: "live2d",
          motion: "Idle",
          expression: "F05",
          scale: 1.16,
          offsetX: 12,
          offsetY: -8,
          runtimeState: {
            mouthOpen: 0.88,
            blink: 0.1,
            focusEnergy: 0.94,
            swayX: 6,
            bobY: -4,
            motionProgress: 0.42,
          },
        },
      },
    });

    expect(heroCard.avatar.kind).toBe("live2d");
    if (heroCard.avatar.kind !== "live2d") {
      throw new Error("Expected a live2d avatar");
    }

    expect(heroCard.avatar.motion).toBe("Idle");
    expect(heroCard.avatar.expression).toBe("F05");
    expect(heroCard.avatar.scale).toBe(1.16);
    expect(heroCard.avatar.offsetX).toBe(12);
    expect(heroCard.avatar.offsetY).toBe(-8);
    expect(heroCard.avatar.runtimeState.mouthOpen).toBe(0.88);
    expect(heroCard.avatar.runtimeState.motionProgress).toBe(0.42);
  });
});
