import { describe, it, expect } from "vitest";
import {
  getDemoState,
  getNotes,
  getActiveNote,
  getCurrentScreen,
} from "../runtime/selectors";
import { createDemoInitialState } from "../runtime/state";
import type { WorldState } from "@tokovo/core";

describe("Demo Selectors", () => {
  it("getDemoState returns plugin state", () => {
    const world: WorldState = {
      appState: {
        "app_demo": createDemoInitialState(),
      },
      devices: {},
      camera: { mode: "default" as const },
    } as WorldState;

    const state = getDemoState(world);
    expect(state).toBeDefined();
    expect(state?.notes).toEqual([]);
  });

  it("getNotes returns notes array", () => {
    const world: WorldState = {
      appState: {
        "app_demo": {
          ...createDemoInitialState(),
          notes: [
            {
              id: "1",
              title: "Test",
              content: "Content",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        },
      },
      devices: {},
      camera: { mode: "default" as const },
    } as WorldState;

    const notes = getNotes(world);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("Test");
  });

  it("getActiveNote returns active note", () => {
    const now = Date.now();
    const world: WorldState = {
      appState: {
        "app_demo": {
          notes: [
            { id: "1", title: "Test", content: "Content", createdAt: now, updatedAt: now },
          ],
          activeNoteId: "1",
          currentScreen: "detail" as const,
        },
      },
      devices: {},
      camera: { mode: "default" as const },
    } as WorldState;

    const note = getActiveNote(world);
    expect(note).toBeDefined();
    expect(note?.title).toBe("Test");
  });

  it("getCurrentScreen returns current screen", () => {
    const world: WorldState = {
      appState: {
        "app_demo": {
          ...createDemoInitialState(),
          currentScreen: "editor" as const,
        },
      },
      devices: {},
      camera: { mode: "default" as const },
    } as WorldState;

    const screen = getCurrentScreen(world);
    expect(screen).toBe("editor");
  });
});
