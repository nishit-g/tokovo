import { describe, it, expect } from "vitest";
import {
  getXState,
  getTimelineTweets,
  getActiveTweet,
} from "../runtime/selectors";
import { createXInitialState, type XTweet } from "../runtime/state";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";

const baseTweet = (override: Partial<XTweet>): XTweet => ({
  id: "tw-1",
  authorId: "u1",
  text: "A",
  createdAt: 0,
  replyIds: [],
  likedBy: [],
  likeCount: 0,
  repostCount: 0,
  viewCount: 0,
  bookmarkCount: 0,
  shareCount: 0,
  hashtags: [],
  mentions: [],
  ...override,
});

describe("X Selectors", () => {
  it("getXState returns plugin state", () => {
    const world: WorldState = {
      appState: {
        app_x: createXInitialState(),
      },
      devices: {},
      camera: DEFAULT_BASE_CAMERA_STATE,
      audio: DEFAULT_AUDIO_STATE,
    } as WorldState;

    const state = getXState(world);
    expect(state).toBeDefined();
    expect(state?.tweets).toEqual([]);
  });

  it("getTimelineTweets returns tweets ordered by timeline", () => {
    const world: WorldState = {
      appState: {
        app_x: {
          ...createXInitialState(),
          tweets: [baseTweet({ id: "tw-1" })],
          timeline: ["tw-1"],
        },
      },
      devices: {},
      camera: DEFAULT_BASE_CAMERA_STATE,
      audio: DEFAULT_AUDIO_STATE,
    } as WorldState;

    const tweets = getTimelineTweets(world);
    expect(tweets).toHaveLength(1);
    expect(tweets[0].id).toBe("tw-1");
  });

  it("getActiveTweet returns active tweet", () => {
    const world: WorldState = {
      appState: {
        app_x: {
          ...createXInitialState(),
          tweets: [baseTweet({ id: "tw-2" })],
          activeTweetId: "tw-2",
        },
      },
      devices: {},
      camera: DEFAULT_BASE_CAMERA_STATE,
      audio: DEFAULT_AUDIO_STATE,
    } as WorldState;

    const tweet = getActiveTweet(world);
    expect(tweet?.id).toBe("tw-2");
  });
});
