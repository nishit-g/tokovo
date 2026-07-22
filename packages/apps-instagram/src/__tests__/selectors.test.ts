import { describe, expect, it } from "vitest";
import type { WorldState } from "@tokovo/core";
import { createDefaultAudioState } from "@tokovo/core";
import { createInstagramInitialState } from "../runtime/state.js";
import {
  getActiveStory,
  getUnreadDMCount,
  getVisibleFeedPosts,
  getVisibleNotifications,
} from "../runtime/selectors.js";

function createWorld(): WorldState {
  return {
    appInstances: {
      "phone:app_instagram": {
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
        storySets: [
          {
            id: "set1",
            userId: "u1",
            storyIds: ["story1"],
            lastViewedStoryId: null,
          },
        ],
        stories: [
          {
            id: "story1",
            authorId: "u1",
            mediaUrl: "/story.png",
            createdAt: 30,
            durationFrames: 90,
          },
        ],
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
    capabilityState: {},
    devices: {},
    audio: createDefaultAudioState(),
  } as WorldState;
}

describe("instagram selectors", () => {
  it("orders visible feed posts by recency", () => {
    const posts = getVisibleFeedPosts(createWorld(), "phone");
    expect(posts.map((post) => post.id)).toEqual(["p2", "p1"]);
  });

  it("returns active story and aggregate badge counts", () => {
    const world = createWorld();
    expect(getActiveStory(world, "phone")?.id).toBe("story1");
    expect(getUnreadDMCount(world, "phone")).toBe(2);
    expect(getVisibleNotifications(world, "phone")).toHaveLength(1);
  });
});
