import { describe, expect, it } from "vitest";
import { CHAT_INTENT_PROFILES, resolveBlurbUtterance } from "./chat-intents.js";

describe("chat voice intent direction", () => {
  it("turns a dramatic job into complete performance direction", () => {
    const direction = resolveBlurbUtterance({
      id: "warning",
      performer: "amber",
      text: "Do not open X.",
      intent: "urgent-warning",
    });

    expect(direction.emotion).toBe("panic");
    expect(direction.length).toBe("short");
    expect(direction.finalContour).toBe("fall");
    expect(direction.direction.interruption).toBe("cuts-current");
    expect(direction.direction.postSilenceMs).toBeGreaterThan(300);
  });

  it("preserves explicit director overrides", () => {
    const direction = resolveBlurbUtterance({
      id: "quiet-warning",
      performer: "amber",
      text: "Do not open X.",
      intent: "urgent-warning",
      emotion: "deadpan",
      intensity: 0.2,
      length: "tiny",
      finalContour: "flat",
      pauseAfterMs: 900,
    });

    expect(direction.emotion).toBe("deadpan");
    expect(direction.intensity).toBe(0.2);
    expect(direction.length).toBe("tiny");
    expect(direction.finalContour).toBe("flat");
    expect(direction.direction.postSilenceMs).toBe(900);
  });

  it("uses emotion-appropriate contours without a chat intent", () => {
    const sad = resolveBlurbUtterance({
      id: "sad",
      performer: "coral",
      text: "Okay.",
      emotion: "sad",
    });

    expect(sad.finalContour).toBe("fall");
  });

  it("keeps the deadpan verdict sparse and button-like", () => {
    const profile = CHAT_INTENT_PROFILES["deadpan-verdict"];

    expect(profile.length).toBe("tiny");
    expect(profile.preSilenceMs).toBeGreaterThanOrEqual(250);
    expect(profile.postSilenceMs).toBeGreaterThanOrEqual(600);
    expect(profile.prominence).toBe("button");
  });

  it("defines safe timing for every supported intent", () => {
    for (const profile of Object.values(CHAT_INTENT_PROFILES)) {
      expect(profile.preSilenceMs).toBeGreaterThanOrEqual(0);
      expect(profile.postSilenceMs).toBeGreaterThanOrEqual(200);
      expect(profile.intensity).toBeGreaterThanOrEqual(0);
      expect(profile.intensity).toBeLessThanOrEqual(1);
    }
  });
});
