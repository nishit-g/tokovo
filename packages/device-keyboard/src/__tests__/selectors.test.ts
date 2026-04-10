import { describe, expect, it } from "vitest";
import { DEFAULT_KEYBOARD_STATE } from "@tokovo/core";
import { getTypedTextProgress } from "../runtime/selectors.js";
import { keyboardReducer } from "../runtime/reducer.js";

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

  it("reveals grapheme clusters instead of UTF-16 fragments", () => {
    const state = {
      ...DEFAULT_KEYBOARD_STATE,
      inputText: "👍🏽a",
      cursorPosition: 2,
      typingAnimation: {
        text: "👍🏽a",
        startFrame: 10,
        charDelay: 2,
      },
    };

    expect(getTypedTextProgress(state, 12)).toBe("👍🏽");
    expect(getTypedTextProgress(state, 14)).toBe("👍🏽a");
  });
});

describe("keyboardReducer multilingual safety", () => {
  it("backspaces whole grapheme clusters", () => {
    const afterType = keyboardReducer(
      {
        ...DEFAULT_KEYBOARD_STATE,
        visible: true,
      },
      {
        kind: "DEVICE",
        type: "KEYBOARD_TYPE",
        deviceId: "phone",
        at: 0,
        payload: { text: "👍🏽a", charDelay: 2 },
      },
      0,
    );

    const afterBackspace = keyboardReducer(
      afterType,
      {
        kind: "DEVICE",
        type: "KEYBOARD_KEY_PRESS",
        deviceId: "phone",
        at: 1,
        payload: { key: "backspace" },
      },
      1,
    );

    expect(afterBackspace.inputText).toBe("👍🏽");
    expect(afterBackspace.cursorPosition).toBe(1);
  });
});
