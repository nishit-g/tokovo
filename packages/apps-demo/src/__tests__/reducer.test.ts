import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { demoReducer } from "../runtime/reducer";
import { createDemoInitialState } from "../runtime/state";
import type { WorldState, RuntimeEvent } from "@tokovo/core";

// Helper to create a minimal WorldState with plugin state
function createTestWorldState(): WorldState {
  return {
    appState: {
      "app_demo": createDemoInitialState(),
    },
    devices: {},
    camera: { mode: "default" as const },
  } as WorldState;
}

// Helper to run reducer and get new state
function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  // Wrap in produce() because reducer mutates draft and returns void
  return produce(state, (draft) => {
    demoReducer(draft, event as any);
  });
}

describe("Demo Reducer", () => {
  it("ADD_NOTE creates a new note", () => {
    const state = createTestWorldState();
    const newState = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_demo",
      type: "ADD_NOTE",
      payload: {
        id: "1",
        title: "Test",
        content: "Content",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    const appState = newState.appState?.["app_demo"];
    expect(appState.notes).toHaveLength(1);
    expect(appState.notes[0].title).toBe("Test");
  });

  it("UPDATE_NOTE modifies existing note", () => {
    const state = createTestWorldState();
    const stateWithNote = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_demo",
      type: "ADD_NOTE",
      payload: {
        id: "1",
        title: "Original",
        content: "Content",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    const updatedState = runReducer(stateWithNote, {
      at: 1,
      kind: "APP",
      appId: "app_demo",
      type: "UPDATE_NOTE",
      payload: { noteId: "1", title: "Updated", updatedAt: Date.now() },
    });

    const appState = updatedState.appState?.["app_demo"];
    expect(appState.notes[0].title).toBe("Updated");
  });

  it("DELETE_NOTE removes note", () => {
    const state = createTestWorldState();
    const stateWithNote = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_demo",
      type: "ADD_NOTE",
      payload: {
        id: "1",
        title: "Test",
        content: "Content",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    const deletedState = runReducer(stateWithNote, {
      at: 1,
      kind: "APP",
      appId: "app_demo",
      type: "DELETE_NOTE",
      payload: { noteId: "1" },
    });

    const appState = deletedState.appState?.["app_demo"];
    expect(appState.notes).toHaveLength(0);
  });

  it("SET_ACTIVE_NOTE updates activeNoteId", () => {
    const state = createTestWorldState();
    const newState = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_demo",
      type: "SET_ACTIVE_NOTE",
      payload: { noteId: "1" },
    });

    const appState = newState.appState?.["app_demo"];
    expect(appState.activeNoteId).toBe("1");
  });

  it("SET_SCREEN changes currentScreen", () => {
    const state = createTestWorldState();
    const newState = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_demo",
      type: "SET_SCREEN",
      payload: { screen: "detail" },
    });

    const appState = newState.appState?.["app_demo"];
    expect(appState.currentScreen).toBe("detail");
  });
});
