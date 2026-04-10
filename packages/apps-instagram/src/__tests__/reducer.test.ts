import { describe, expect, it } from "vitest";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { createInstagramInitialState, type InstagramState } from "../runtime/state.js";
import { instagramReducer } from "../runtime/reducer.js";

function createWorld(): WorldState {
  return {
    appState: {
      app_instagram: createInstagramInitialState(),
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

describe("instagram reducer", () => {
  it("adds comments and increments post comment counts", () => {
    const world = createWorld();
    instagramReducer(world, {
      at: 0,
      kind: "APP",
      appId: "app_instagram",
      type: "ADD_POST",
      deviceId: "phone",
      payload: {
        id: "p1",
        authorId: "u1",
        imageUrl: "/post.png",
        caption: "hello",
        createdAt: 1,
      },
    } as never);

    instagramReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_instagram",
      type: "ADD_COMMENT",
      deviceId: "phone",
      payload: {
        id: "c1",
        postId: "p1",
        authorId: "u2",
        text: "nice",
        createdAt: 2,
      },
    } as never);

    const state = world.appState?.app_instagram as InstagramState | undefined;
    expect(state?.posts[0]?.commentCount).toBe(1);
    expect(state?.posts[0]?.commentIds).toEqual(["c1"]);
  });

  it("marks threads unread unless they are active", () => {
    const world = createWorld();
    instagramReducer(world, {
      at: 0,
      kind: "APP",
      appId: "app_instagram",
      type: "ADD_DM_THREAD",
      deviceId: "phone",
      payload: {
        id: "thread1",
        participantIds: ["u1", "u2"],
        unreadCount: 0,
      },
    } as never);

    instagramReducer(world, {
      at: 1,
      kind: "APP",
      appId: "app_instagram",
      type: "ADD_DM_MESSAGE",
      deviceId: "phone",
      payload: {
        id: "m1",
        threadId: "thread1",
        senderId: "u2",
        text: "hey",
        createdAt: 2,
      },
    } as never);

    let state = world.appState?.app_instagram as InstagramState | undefined;
    expect(state?.dmThreads[0]?.unreadCount).toBe(1);

    instagramReducer(world, {
      at: 2,
      kind: "APP",
      appId: "app_instagram",
      type: "SET_SCREEN",
      deviceId: "phone",
      payload: { screen: "thread", threadId: "thread1" },
    } as never);

    state = world.appState?.app_instagram as InstagramState | undefined;
    expect(state?.dmThreads[0]?.unreadCount).toBe(0);
  });
});
