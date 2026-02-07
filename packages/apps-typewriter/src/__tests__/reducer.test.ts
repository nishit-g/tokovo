import { describe, expect, it } from "vitest";
import type { WorldState } from "@tokovo/core";
import { typewriterReducer } from "../runtime/reducer.js";
import { TYPEWRITER_APP_ID } from "../constants.js";

function baseWorld(): WorldState {
  return {
    devices: { desk: { id: "desk", profileId: "canvas-1080x1920", isLocked: false, notifications: [], foregroundAppId: TYPEWRITER_APP_ID } as any },
    appState: {} as any,
    camera: { activeDeviceId: "desk" } as any,
    audio: { activeSounds: {}, autoSoundRules: [] } as any,
  } as WorldState;
}

describe("typewriterReducer", () => {
  it("types characters and moves cursor", () => {
    const w = baseWorld();
    typewriterReducer(w, {
      at: 0,
      kind: "APP",
      appId: TYPEWRITER_APP_ID,
      type: "TYPEWRITER_KEY",
      payload: { ch: "H" },
      deviceId: "desk",
    } as any);
    typewriterReducer(w, {
      at: 1,
      kind: "APP",
      appId: TYPEWRITER_APP_ID,
      type: "TYPEWRITER_KEY",
      payload: { ch: "i" },
      deviceId: "desk",
    } as any);

    const s = (w.appState as any)[TYPEWRITER_APP_ID];
    expect(s.lines[0]).toBe("Hi");
    expect(s.cursor).toEqual({ row: 0, col: 2 });
    expect(Object.keys(s.fx.pressedKeys).length).toBeGreaterThan(0);
  });

  it("newline splits the line and moves cursor", () => {
    const w = baseWorld();
    typewriterReducer(w, { at: 0, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_KEY", payload: { ch: "A" } } as any);
    typewriterReducer(w, { at: 1, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_NEWLINE", payload: {} } as any);
    typewriterReducer(w, { at: 2, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_KEY", payload: { ch: "B" } } as any);

    const s = (w.appState as any)[TYPEWRITER_APP_ID];
    expect(s.lines).toEqual(["A", "B"]);
    expect(s.cursor).toEqual({ row: 1, col: 1 });
    expect(typeof s.fx.lastCarriageFromCol).toBe("number");
  });
});
