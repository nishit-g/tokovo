import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { RuntimeEvent, WorldState } from "@tokovo/core";
import { createDefaultAudioState } from "@tokovo/core";
import { xReducer } from "../runtime/reducer.js";
import { createXInitialState } from "../runtime/state.js";

function createTestWorldState(): WorldState {
  return {
    appInstances: {
      "phone:app_x": createXInitialState(),
    },
    capabilityState: {},
    devices: {},
    audio: createDefaultAudioState(),
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
    const app = world.appInstances?.["phone:app_x"] as any;
    expect(app.viewMode).toBe("FEED");
  });

  it("compose screen maps to FULLSCREEN", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      deviceId: "phone",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "compose" },
    });

    const app = next.appInstances?.["phone:app_x"] as any;
    expect(app.viewMode).toBe("FULLSCREEN");
    expect(app.conversationId).toBeUndefined();
  });

  it("thread screen maps to CHAT and sets conversationId", () => {
    const world = createTestWorldState();
    const next = runReducer(world, {
      at: 1,
      kind: "APP",
      deviceId: "phone",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });

    const app = next.appInstances?.["phone:app_x"] as any;
    expect(app.viewMode).toBe("CHAT");
    expect(app.conversationId).toBe("t1");
  });

  it("timeline screen maps back to FEED", () => {
    const world = createTestWorldState();
    const toThread = runReducer(world, {
      at: 1,
      kind: "APP",
      deviceId: "phone",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });
    const toTimeline = runReducer(toThread, {
      at: 2,
      kind: "APP",
      deviceId: "phone",
      appId: "app_x",
      type: "SET_SCREEN",
      payload: { screen: "timeline" },
    });

    const app = toTimeline.appInstances?.["phone:app_x"] as any;
    expect(app.viewMode).toBe("FEED");
    expect(app.conversationId).toBeUndefined();
  });
});
