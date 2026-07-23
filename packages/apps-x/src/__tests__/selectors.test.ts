import { describe, expect, it } from "vitest";
import {
  findXState,
  requireXState,
  selectActiveThread,
  selectActiveTweet,
  selectDMThreads,
  selectNotificationBadgeCount,
  selectThreadMessages,
  selectTimelineTweets,
  selectTweetConversation,
  selectVisibleNotifications,
} from "../runtime/selectors.js";
import {
  createTestState,
  createTestWorld,
  testTweet,
  testUser,
} from "./helpers.js";

describe("X VNext selectors", () => {
  it("separates optional app lookup from required rendering state", () => {
    const world = createTestWorld();
    expect(findXState(world, "phone")).toBeDefined();
    expect(findXState(world, "missing")).toBeUndefined();
    expect(() => requireXState(world, "missing")).toThrow();
  });

  it("reads normalized timeline order and following membership", () => {
    const state = createTestState();
    state.usersById.u_third = testUser("u_third");
    state.tweetsById.tw_2 = testTweet("tw_2", { authorId: "u_third" });
    state.timelineIds = ["tw_2", "tw_1"];
    state.timelineTab = "following";
    expect(
      selectTimelineTweets(createTestWorld(state), "phone").map(
        (tweet) => tweet.id,
      ),
    ).toEqual(["tw_1"]);
  });

  it("throws when an ordered index references a missing entity", () => {
    const state = createTestState();
    state.timelineIds.push("ghost");
    expect(() => selectTimelineTweets(createTestWorld(state), "phone")).toThrow(
      /X_TWEET_MISSING/,
    );
  });

  it("requires route targets for active selectors", () => {
    const state = createTestState();
    expect(() => selectActiveTweet(createTestWorld(state), "phone")).toThrow(
      /X_ROUTE_TARGET_REQUIRED/,
    );
    state.route = { screen: "tweet", tweetId: "tw_1" };
    expect(selectActiveTweet(createTestWorld(state), "phone").id).toBe("tw_1");
    state.route = { screen: "thread", threadId: "dm_1" };
    expect(selectActiveThread(createTestWorld(state), "phone").id).toBe("dm_1");
  });

  it("preserves canonical thread and message ordering", () => {
    const world = createTestWorld();
    expect(selectDMThreads(world, "phone").map((thread) => thread.id)).toEqual([
      "dm_1",
    ]);
    expect(
      selectThreadMessages(world, "phone", "dm_1").map((message) => message.id),
    ).toEqual(["msg_1"]);
  });

  it("derives unread totals without fallback state", () => {
    const state = createTestState();
    state.notificationsById.nt_1 = {
      id: "nt_1",
      type: "mention",
      actorId: "u_other",
      createdAt: state.tweetsById.tw_1.createdAt,
      read: false,
    };
    state.notificationIds = ["nt_1"];
    expect(selectNotificationBadgeCount(createTestWorld(state), "phone")).toBe(
      1,
    );
  });

  it("filters the Verified tab by actor verification instead of notification type", () => {
    const state = createTestState();
    state.notificationsTab = "verified";
    state.notificationsById.nt_verified_actor = {
      id: "nt_verified_actor",
      type: "like",
      actorId: "u_other",
      createdAt: state.tweetsById.tw_1.createdAt,
      read: false,
    };
    state.notificationsById.nt_unverified_actor = {
      id: "nt_unverified_actor",
      type: "verified",
      actorId: "u_me",
      createdAt: state.tweetsById.tw_1.createdAt - 1,
      read: false,
    };
    state.notificationIds = ["nt_verified_actor", "nt_unverified_actor"];
    expect(
      selectVisibleNotifications(createTestWorld(state), "phone").map(
        (item) => item.id,
      ),
    ).toEqual(["nt_verified_actor"]);
  });

  it("projects ancestors, focus, and nested descendants as one stable conversation", () => {
    const state = createTestState();
    state.tweetsById.tw_root = testTweet("tw_root", {
      replyIds: ["tw_1"],
      createdAt: state.tweetsById.tw_1.createdAt - 2_000,
    });
    state.tweetsById.tw_1.replyToId = "tw_root";
    state.tweetsById.tw_1.replyIds = ["tw_reply_b", "tw_reply_a"];
    state.tweetsById.tw_reply_a = testTweet("tw_reply_a", {
      replyToId: "tw_1",
      replyIds: ["tw_nested"],
      createdAt: state.tweetsById.tw_1.createdAt + 1_000,
    });
    state.tweetsById.tw_reply_b = testTweet("tw_reply_b", {
      replyToId: "tw_1",
      createdAt: state.tweetsById.tw_1.createdAt + 2_000,
    });
    state.tweetsById.tw_nested = testTweet("tw_nested", {
      replyToId: "tw_reply_a",
      createdAt: state.tweetsById.tw_1.createdAt + 3_000,
    });
    const conversation = selectTweetConversation(
      createTestWorld(state),
      "phone",
      "tw_1",
    );
    expect(
      conversation.map((item) => [item.tweet.id, item.role, item.depth]),
    ).toEqual([
      ["tw_root", "ancestor", 0],
      ["tw_1", "focus", 1],
      ["tw_reply_a", "reply", 2],
      ["tw_nested", "reply", 3],
      ["tw_reply_b", "reply", 2],
    ]);
  });
});
