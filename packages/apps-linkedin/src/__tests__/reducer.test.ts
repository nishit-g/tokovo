import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { RuntimeEvent, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { linkedInReducer } from "../runtime/reducer.js";
import { createLinkedInInitialState } from "../runtime/state.js";

function createWorld(): WorldState {
  return {
    appState: { app_linkedin: createLinkedInInitialState() },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function run(world: WorldState, event: RuntimeEvent): WorldState {
  return produce(world, (draft) => {
    linkedInReducer(draft, event as any);
  });
}

describe("LinkedIn reducer basics", () => {
  it("adds posts to feed", () => {
    const w0 = createWorld();
    const w1 = run(w0, {
      at: 1,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_ADD_POST",
      payload: { id: "p1", authorId: "u1", text: "Hello", createdAt: 1 },
    });
    const app = w1.appState?.app_linkedin as any;
    expect(app.posts.length).toBe(1);
    expect(app.feed[0]).toBe("p1");
  });

  it("uses event time when post payload omits createdAt", () => {
    const w0 = createWorld();
    const w1 = run(w0, {
      at: 42,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_ADD_POST",
      payload: { id: "p1", authorId: "u1", text: "Hello" },
    });

    const app = w1.appState?.app_linkedin as any;
    expect(app.posts[0].createdAt).toBe(42);
  });

  it("tracks reactions per user and supports switching", () => {
    const w0 = createWorld();
    const w1 = run(w0, {
      at: 1,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_ADD_POST",
      payload: { id: "p1", authorId: "u1", text: "Hello", createdAt: 1 },
    });
    const w2 = run(w1, {
      at: 2,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_REACT_POST",
      payload: { postId: "p1", userId: "me", reaction: "like" },
    });
    const w3 = run(w2, {
      at: 3,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_REACT_POST",
      payload: { postId: "p1", userId: "me", reaction: "celebrate" },
    });
    const post = (w3.appState?.app_linkedin as any).posts[0];
    expect(post.reactions.like ?? 0).toBe(0);
    expect(post.reactions.celebrate ?? 0).toBe(1);
    expect(post.reactedBy.me).toBe("celebrate");
  });

  it("clears stale active targets when changing screens", () => {
    const w0 = createWorld();
    const w1 = run(w0, {
      at: 1,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_SET_SCREEN",
      payload: { screen: "thread", threadId: "t1" },
    });
    const w2 = run(w1, {
      at: 2,
      kind: "APP",
      appId: "app_linkedin",
      type: "LINKEDIN_SET_SCREEN",
      payload: { screen: "feed" },
    });

    const app = w2.appState?.app_linkedin as any;
    expect(app.activePostId).toBeNull();
    expect(app.activeUserId).toBeNull();
    expect(app.activeThreadId).toBeNull();
    expect(app.currentScreen).toBe("feed");
  });
});
