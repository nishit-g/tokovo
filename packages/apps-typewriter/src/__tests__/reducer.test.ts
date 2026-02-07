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
    expect(s.cursor).toEqual({ page: 0, row: 0, col: 2 });
    expect(s.pages[0].cells[0].ch).toBe("H");
    expect(s.pages[0].cells[1].ch).toBe("i");
    expect(Object.keys(s.fx.pressedKeys).length).toBeGreaterThan(0);
  });

  it("newline splits the line and moves cursor", () => {
    const w = baseWorld();
    typewriterReducer(w, { at: 0, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_KEY", payload: { ch: "A" } } as any);
    typewriterReducer(w, { at: 1, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_NEWLINE", payload: {} } as any);
    typewriterReducer(w, { at: 2, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_KEY", payload: { ch: "B" } } as any);

    const s = (w.appState as any)[TYPEWRITER_APP_ID];
    expect(s.cursor).toEqual({ page: 0, row: 1, col: 1 });
    expect(s.pages[0].cells[0].ch).toBe("A");
    expect(s.pages[0].cells[44].ch).toBe("B");
    expect(typeof s.fx.lastCarriageFromCol).toBe("number");
  });

  it("page breaks when newline happens past last row", () => {
    const w = baseWorld();
    typewriterReducer(w, { at: 0, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_INIT_LETTER", payload: { reset: true } } as any);
    typewriterReducer(w, {
      at: 1,
      kind: "APP",
      appId: TYPEWRITER_APP_ID,
      type: "TYPEWRITER_SET_CURSOR",
      payload: { page: 0, row: 25, col: 43 },
    } as any);
    typewriterReducer(w, { at: 2, kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_KEY", payload: { ch: "X" } } as any);
    const s = (w.appState as any)[TYPEWRITER_APP_ID];
    expect(s.pages.length).toBeGreaterThan(1);
    expect(s.cursor.page).toBe(1);
    expect(s.cursor.row).toBe(0);
    expect(s.cursor.col).toBe(0);
  });
});
