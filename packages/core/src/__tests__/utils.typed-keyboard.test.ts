import { describe, expect, it } from "vitest";
import { planTypedKeyboard } from "../utils/typed-keyboard.js";

describe("planTypedKeyboard", () => {
  it("returns ok=false for empty text", () => {
    const plan = planTypedKeyboard({
      deviceId: "phone",
      submitAt: 100,
      text: "",
    });
    expect(plan.ok).toBe(false);
    expect(plan.reason).toBe("empty_text");
    expect(plan.events.length).toBe(0);
  });

  it("plans events bounded by notBeforeFrame", () => {
    const plan = planTypedKeyboard({
      deviceId: "phone",
      submitAt: 80,
      text: "hello",
      notBeforeFrame: 70,
    });
    expect(plan.ok).toBe(true);
    expect(plan.events.length).toBeGreaterThan(0);
    for (const e of plan.events) {
      expect(e.at).toBeGreaterThanOrEqual(70);
    }
  });
});

