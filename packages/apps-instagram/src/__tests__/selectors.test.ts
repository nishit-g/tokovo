import { describe, expect, it } from "vitest";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { createInstagramInitialState } from "../runtime/state.js";
import {
  getActiveStory,
  getUnreadDMCount,
  getVisibleFeedPosts,
  getVisibleNotifications,
} from "../runtime/selectors.js";

function createWorld(): WorldState {
  return {
    appState: {
      app_instagram: {
        ...createInstagramInitialState(),
        posts: [
          {
            id: "p1",
            authorId: "u1",
            imageUrl: "/p1.png",
            caption: "older",
            createdAt: 10,
            aspect: "portrait",
            likeCount: 0,
            commentCount: 0,
            commentIds: [],
            likedBy: [],
          },
          {
            id: "p2",
            authorId: "u1",
            imageUrl: "/p2.png",
            caption: "newer",
            createdAt: 20,
            aspect: "portrait",
            likeCount: 0,
            commentCount: 0,
            commentIds: [],
            likedBy: [],
          },
        ],
        storySets: [{ id: "set1", userId: "u1", storyIds: ["story1"], lastViewedStoryId: null }],
        stories: [{ id: "story1", authorId: "u1", mediaUrl: "/story.png", createdAt: 30, durationFrames: 90 }],
        activeStoryId: "story1",
        dmThreads: [
          {
            id: "thread1",
            participantIds: ["u1", "u2"],
            title: undefined,
            unreadCount: 2,
            pinned: false,
            typingUserId: null,
            messageIds: [],
            lastMessageAt: null,
          },
        ],
        notifications: [
          {
            id: "nt1",
            type: "like",
            actorId: "u2",
            createdAt: 40,
            read: false,
          },
        ],
      },
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

describe("instagram selectors", () => {
  it("orders visible feed posts by recency", () => {
    const posts = getVisibleFeedPosts(createWorld());
    expect(posts.map((post) => post.id)).toEqual(["p2", "p1"]);
  });

  it("returns active story and aggregate badge counts", () => {
    const world = createWorld();
    expect(getActiveStory(world)?.id).toBe("story1");
    expect(getUnreadDMCount(world)).toBe(2);
    expect(getVisibleNotifications(world)).toHaveLength(1);
  });
});
