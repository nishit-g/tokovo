import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { RuntimeEvent, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { linkedInReducer } from "../runtime/reducer.js";
import { createLinkedInInitialState } from "../runtime/state.js";

function createTestWorldState(): WorldState {
  return {
    appState: {
      app_linkedin: createLinkedInInitialState(),
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  return produce(state, (draft) => {
    linkedInReducer(draft, event as any);
  });
}

describe("LinkedIn viewMode invariants", () => {
  it("initial state is FEED", () => {
    const world = createTestWorldState();
    const app = world.appState?.app_linkedin as any;
    expect(app.viewMode).toBe("FEED");
  });

  it("compose screen maps to FULLSCREEN", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_SET_SCREEN",
      payload: { screen: "compose" },
    });
    const app = next.appState?.app_linkedin as any;
    expect(app.viewMode).toBe("FULLSCREEN");
    expect(app.conversationId).toBeUndefined();
  });

  it("thread screen maps to CHAT and sets conversationId", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });
    const app = next.appState?.app_linkedin as any;
    expect(app.viewMode).toBe("CHAT");
    expect(app.conversationId).toBe("t1");
  });

  it("feed screen maps back to FEED", () => {
    const world = createTestWorldState();
    const toThread = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });
    const toFeed = runReducer(toThread, {
      at: 2,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_SET_SCREEN",
      payload: { screen: "feed" },
    });
    const app = toFeed.appState?.app_linkedin as any;
    expect(app.viewMode).toBe("FEED");
    expect(app.conversationId).toBeUndefined();
  });
});
