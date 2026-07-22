import { describe, it, expect } from "vitest";
import {
  getNotificationBadgeCount,
  getXState,
  getTimelineTweets,
  getActiveTweet,
  getTweetsByAuthor,
  getUnreadThreadCount,
} from "../runtime/selectors.js";
import { createXInitialState, type XTweet } from "../runtime/state.js";
import type { WorldState } from "@tokovo/core";
import { createDefaultAudioState } from "@tokovo/core";

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
      appInstances: {
        "phone:app_x": createXInitialState(),
      },
      capabilityState: {},
      devices: {},
      audio: createDefaultAudioState(),
    } as WorldState;

    const state = getXState(world, "phone");
    expect(state).toBeDefined();
    expect(state?.tweets).toEqual([]);
  });

  it("getTimelineTweets returns tweets ordered by timeline", () => {
    const world: WorldState = {
      appInstances: {
        "phone:app_x": {
          ...createXInitialState(),
          tweets: [baseTweet({ id: "tw-1" })],
          timeline: ["tw-1"],
        },
      },
      capabilityState: {},
      devices: {},
      audio: createDefaultAudioState(),
    } as WorldState;

    const tweets = getTimelineTweets(world, "phone");
    expect(tweets).toHaveLength(1);
    expect(tweets[0].id).toBe("tw-1");
  });

  it("getActiveTweet returns active tweet", () => {
    const world: WorldState = {
      appInstances: {
        "phone:app_x": {
          ...createXInitialState(),
          tweets: [baseTweet({ id: "tw-2" })],
          activeTweetId: "tw-2",
        },
      },
      capabilityState: {},
      devices: {},
      audio: createDefaultAudioState(),
    } as WorldState;

    const tweet = getActiveTweet(world, "phone");
    expect(tweet?.id).toBe("tw-2");
  });

  it("getTweetsByAuthor returns authored tweets sorted by createdAt desc", () => {
    const world: WorldState = {
      appInstances: {
        "phone:app_x": {
          ...createXInitialState(),
          tweets: [
            baseTweet({ id: "tw-1", authorId: "u1", createdAt: 100 }),
            baseTweet({ id: "tw-2", authorId: "u2", createdAt: 200 }),
            baseTweet({ id: "tw-3", authorId: "u1", createdAt: 300 }),
          ],
          timeline: ["tw-2"],
        },
      },
      capabilityState: {},
      devices: {},
      audio: createDefaultAudioState(),
    } as WorldState;

    const tweets = getTweetsByAuthor(world, "phone", "u1");
    expect(tweets.map((tweet) => tweet.id)).toEqual(["tw-3", "tw-1"]);
  });

  it("getTimelineTweets respects following tab", () => {
    const world: WorldState = {
      appInstances: {
        "phone:app_x": {
          ...createXInitialState(),
          currentUserId: "u1",
          timelineTab: "following",
          users: [
            {
              id: "u1",
              name: "A",
              handle: "a",
              followers: 0,
              following: 1,
              followerIds: [],
              followingIds: ["u2"],
              verified: null,
            },
            {
              id: "u2",
              name: "B",
              handle: "b",
              followers: 0,
              following: 0,
              followerIds: [],
              followingIds: [],
              verified: null,
            },
            {
              id: "u3",
              name: "C",
              handle: "c",
              followers: 0,
              following: 0,
              followerIds: [],
              followingIds: [],
              verified: null,
            },
          ],
          tweets: [
            baseTweet({ id: "tw-1", authorId: "u2", createdAt: 200 }),
            baseTweet({ id: "tw-2", authorId: "u3", createdAt: 100 }),
          ],
          timeline: ["tw-1", "tw-2"],
        },
      },
      capabilityState: {},
      devices: {},
      audio: createDefaultAudioState(),
    } as WorldState;

    expect(getTimelineTweets(world, "phone").map((tweet) => tweet.id)).toEqual(["tw-1"]);
  });

  it("derives notification badge and unread thread totals", () => {
    const world: WorldState = {
      appInstances: {
        "phone:app_x": {
          ...createXInitialState(),
          notifications: [
            {
              id: "n1",
              type: "mention",
              actorId: "u2",
              createdAt: 0,
              read: false,
            },
            {
              id: "n2",
              type: "follow",
              actorId: "u3",
              createdAt: 0,
              read: true,
            },
          ],
          dmThreads: [
            {
              id: "dm-1",
              participantIds: ["u1", "u2"],
              messageIds: [],
              unreadCount: 2,
              pinned: false,
              typingUserId: null,
              lastMessageAt: 1,
            },
            {
              id: "dm-2",
              participantIds: ["u1", "u3"],
              messageIds: [],
              unreadCount: 1,
              pinned: true,
              typingUserId: null,
              lastMessageAt: 2,
            },
          ],
        },
      },
      capabilityState: {},
      devices: {},
      audio: createDefaultAudioState(),
    } as WorldState;

    expect(getNotificationBadgeCount(world, "phone")).toBe(1);
    expect(getUnreadThreadCount(world, "phone")).toBe(3);
  });
});
