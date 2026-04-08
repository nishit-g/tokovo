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
      submitAt: 96,
      text: "hello",
      notBeforeFrame: 70,
    });
    expect(plan.ok).toBe(true);
    expect(plan.events.length).toBeGreaterThan(0);
    for (const e of plan.events) {
      expect(e.at).toBeGreaterThanOrEqual(70);
    }
  });

  it("keeps keyboard show ahead of typing when a valid window exists", () => {
    const plan = planTypedKeyboard({
      deviceId: "phone",
      submitAt: 20,
      text: "hey",
      notBeforeFrame: 10,
    });

    expect(plan.ok).toBe(true);
    expect(plan.keyboardShowAt).toBeLessThan(plan.typeStartAt ?? Infinity);
    expect(plan.charDelay).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(plan.charDelay)).toBe(true);
  });

  it("skips impossible windows instead of faking multi-character jumps", () => {
    const plan = planTypedKeyboard({
      deviceId: "phone",
      submitAt: 10,
      text: "hello",
      notBeforeFrame: 9,
    });

    expect(plan.ok).toBe(false);
    expect(plan.reason).toBe("insufficient_window");
  });

  it("supports bounded compressed typing for authored windows", () => {
    const plan = planTypedKeyboard({
      deviceId: "phone",
      submitAt: 180,
      text: "subah 7 baje kaunsi emergency hoti hai be",
      notBeforeFrame: 135,
      requestedCharDelay: 3,
      allowCompressedCharDelay: true,
    });

    expect(plan.ok).toBe(true);
    expect(plan.keyboardShowAt).toBeGreaterThanOrEqual(135);
    expect(plan.typeStartAt).toBeGreaterThan(plan.keyboardShowAt ?? -Infinity);
    expect(plan.charDelay).toBeLessThan(1);
    expect(plan.charDelay).toBeGreaterThanOrEqual(0.5);
  });
});
