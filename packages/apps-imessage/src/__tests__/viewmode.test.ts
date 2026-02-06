import { describe, it, expect } from "vitest";
import type { RuntimeEvent, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { iMessageReducer } from "../runtime/reducer";
import { createIMessageInitialState } from "../runtime/initial-state";

function createTestWorldState(): WorldState {
  return {
    appState: {
      app_imessage: createIMessageInitialState(),
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  const draft = JSON.parse(JSON.stringify(state)) as WorldState;
  iMessageReducer(draft, event as any);
  return draft;
}

describe("iMessage viewMode invariants", () => {
  it("initial state is FEED", () => {
    const world = createTestWorldState();
    const app = world.appState?.app_imessage as any;
    expect(app.viewMode).toBe("FEED");
  });

  it("chat screen maps to CHAT and sets conversationId", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_SET_SCREEN",
      payload: { screen: "chat", conversationId: "c1" },
    });

    const app = next.appState?.app_imessage as any;
    expect(app.viewMode).toBe("CHAT");
    expect(app.conversationId).toBe("c1");
  });

  it("list screen maps to FEED and clears conversationId", () => {
    const world = createTestWorldState();
    const toChat = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_SET_SCREEN",
      payload: { screen: "chat", conversationId: "c1" },
    });
    const toList = runReducer(toChat, {
      at: 2,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_SET_SCREEN",
      payload: { screen: "list" },
    });

    const app = toList.appState?.app_imessage as any;
    expect(app.viewMode).toBe("FEED");
    expect(app.conversationId).toBeUndefined();
  });

  it("media screen maps to FULLSCREEN", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_SET_SCREEN",
      payload: { screen: "media", conversationId: "c1" },
    });

    const app = next.appState?.app_imessage as any;
    expect(app.viewMode).toBe("FULLSCREEN");
    expect(app.conversationId).toBeUndefined();
  });
});

