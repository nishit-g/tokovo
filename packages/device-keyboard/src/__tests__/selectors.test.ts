import { describe, expect, it } from "vitest";
import { DEFAULT_KEYBOARD_STATE } from "@tokovo/core";
import { getTypedTextProgress } from "../runtime/selectors.js";

describe("getTypedTextProgress", () => {
  it("does not reveal the first character on the start frame", () => {
    const state = {
      ...DEFAULT_KEYBOARD_STATE,
      inputText: "hello",
      cursorPosition: 5,
      typingAnimation: {
        text: "hello",
        startFrame: 10,
        charDelay: 2,
      },
    };

    expect(getTypedTextProgress(state, 10)).toBe("");
    expect(getTypedTextProgress(state, 11)).toBe("");
    expect(getTypedTextProgress(state, 12)).toBe("h");
    expect(getTypedTextProgress(state, 14)).toBe("he");
  });
});
