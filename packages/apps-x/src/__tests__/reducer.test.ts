import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { xReducer } from "../runtime/reducer";
import { createXInitialState } from "../runtime/state";
import { getXState } from "../runtime/selectors";
import type { WorldState, RuntimeEvent } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";

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

describe("X Reducer", () => {
  it("ADD_USER stores a new user", () => {
    const state = createTestWorldState();
    const nextState = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_x",
      type: "ADD_USER",
      payload: {
        id: "u1",
        name: "Alex",
        handle: "alex",
      },
    });

    const appState = getXState(nextState);
    if (!appState) throw new Error("Missing X app state after reducer run");
    expect(appState.users).toHaveLength(1);
    expect(appState.users[0].handle).toBe("alex");
  });

  it("ADD_TWEET adds tweet to timeline", () => {
    const state = createTestWorldState();
    const nextState = runReducer(state, {
      at: 10,
      kind: "APP",
      appId: "app_x",
      type: "ADD_TWEET",
      payload: {
        id: "tw-1",
        authorId: "u1",
        text: "Hello",
        createdAt: 10,
      },
    });

    const appState = getXState(nextState);
    if (!appState) throw new Error("Missing X app state after reducer run");
    expect(appState.tweets).toHaveLength(1);
    expect(appState.timeline[0]).toBe("tw-1");
  });

  it("LIKE_TWEET increments like count", () => {
    const state = createTestWorldState();
    const withTweet = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_x",
      type: "ADD_TWEET",
      payload: {
        id: "tw-1",
        authorId: "u1",
        text: "Hello",
        createdAt: 0,
      },
    });

    const liked = runReducer(withTweet, {
      at: 1,
      kind: "APP",
      appId: "app_x",
      type: "LIKE_TWEET",
      payload: { tweetId: "tw-1", userId: "u2" },
    });

    const appState = getXState(liked);
    if (!appState) throw new Error("Missing X app state after reducer run");
    expect(appState.tweets[0].likeCount).toBe(1);
  });
});
