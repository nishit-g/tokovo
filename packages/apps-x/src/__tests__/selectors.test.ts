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
} from "../runtime/selectors.js";
import { createTestState, createTestWorld, testTweet, testUser } from "./helpers.js";

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
    expect(selectTimelineTweets(createTestWorld(state), "phone").map((tweet) => tweet.id)).toEqual(["tw_1"]);
  });

  it("throws when an ordered index references a missing entity", () => {
    const state = createTestState();
    state.timelineIds.push("ghost");
    expect(() => selectTimelineTweets(createTestWorld(state), "phone")).toThrow(/X_TWEET_MISSING/);
  });

  it("requires route targets for active selectors", () => {
    const state = createTestState();
    expect(() => selectActiveTweet(createTestWorld(state), "phone")).toThrow(/X_ROUTE_TARGET_REQUIRED/);
    state.route = { screen: "tweet", tweetId: "tw_1" };
    expect(selectActiveTweet(createTestWorld(state), "phone").id).toBe("tw_1");
    state.route = { screen: "thread", threadId: "dm_1" };
    expect(selectActiveThread(createTestWorld(state), "phone").id).toBe("dm_1");
  });

  it("preserves canonical thread and message ordering", () => {
    const world = createTestWorld();
    expect(selectDMThreads(world, "phone").map((thread) => thread.id)).toEqual(["dm_1"]);
    expect(selectThreadMessages(world, "phone", "dm_1").map((message) => message.id)).toEqual(["msg_1"]);
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
    expect(selectNotificationBadgeCount(createTestWorld(state), "phone")).toBe(1);
  });
});
