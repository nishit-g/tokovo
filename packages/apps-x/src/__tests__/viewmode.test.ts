import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { RuntimeEvent, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { xReducer } from "../runtime/reducer.js";
import { createXInitialState } from "../runtime/state.js";

function createTestWorldState(): WorldState {
  return {
    appState: {
      app_x: createXInitialState(),
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  return produce(state, (draft) => {
    xReducer(draft, event as any);
  });
}

describe("X viewMode invariants", () => {
  it("initial state is FEED", () => {
    const world = createTestWorldState();
    const app = world.appState?.app_x as any;
    expect(app.viewMode).toBe("FEED");
  });

  it("compose screen maps to FULLSCREEN", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "compose" },
    });

    const app = next.appState?.app_x as any;
    expect(app.viewMode).toBe("FULLSCREEN");
    expect(app.conversationId).toBeUndefined();
  });

  it("thread screen maps to CHAT and sets conversationId", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });

    const app = next.appState?.app_x as any;
    expect(app.viewMode).toBe("CHAT");
    expect(app.conversationId).toBe("t1");
  });

  it("timeline screen maps back to FEED", () => {
    const world = createTestWorldState();
    const toThread = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });
    const toTimeline = runReducer(toThread, {
      at: 2,
      kind: "APP",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "timeline" },
    });

    const app = toTimeline.appState?.app_x as any;
    expect(app.viewMode).toBe("FEED");
    expect(app.conversationId).toBeUndefined();
  });
});

