import { describe, expect, it } from "vitest";
import {
  projectXConversation,
  projectXFeed,
  projectXThread,
} from "../layout/project.js";
import { selectTweetConversation } from "../runtime/selectors.js";
import { createTestState, createTestWorld, testTweet } from "./helpers.js";

describe("X VNext long-content projection", () => {
  it("projects a 10k post feed into a bounded render window", () => {
    const state = createTestState();
    state.tweetsById = {};
    state.timelineIds = [];
    const tweets = Array.from({ length: 10_000 }, (_, index) => {
      const tweet = testTweet(`tw_${index}`, {
        text:
          index % 7 === 0
            ? "A longer post that wraps across multiple deterministic lines to exercise the measurement path."
            : `Post ${index}`,
        createdAt: Date.UTC(2026, 6, 23) - index * 1_000,
      });
      state.tweetsById[tweet.id] = tweet;
      state.timelineIds.push(tweet.id);
      return tweet;
    });
    const started = performance.now();
    const projection = projectXFeed({
      state,
      tweets,
      width: 393,
      viewportHeight: 620,
      scrollY: 420_000,
    });
    const elapsed = performance.now() - started;
    expect(projection.items).toHaveLength(10_000);
    expect(projection.visibleItems.length).toBeLessThan(20);
    expect(elapsed).toBeLessThan(250);
  });

  it("projects a 10k message thread into a bounded bottom window", () => {
    const state = createTestState();
    const thread = state.dmThreadsById.dm_1;
    thread.messageIds = [];
    state.dmMessagesById = {};
    const messages = Array.from({ length: 10_000 }, (_, index) => {
      const id = `msg_${index}`;
      const senderId = index % 2 === 0 ? "u_me" : "u_other";
      const message = {
        id,
        threadId: "dm_1",
        senderId,
        text: `Deterministic message ${index}`,
        createdAt: Date.UTC(2026, 6, 23) + index * 1_000,
        reactions: [],
        delivery: senderId === "u_me" ? ("sent" as const) : ("read" as const),
      };
      state.dmMessagesById[id] = message;
      thread.messageIds.push(id);
      return message;
    });
    const started = performance.now();
    const projection = projectXThread({
      state,
      threadId: "dm_1",
      messages,
      width: 393,
      viewportHeight: 650,
    });
    const elapsed = performance.now() - started;
    expect(projection.items).toHaveLength(10_000);
    expect(projection.visibleItems.length).toBeLessThan(30);
    expect(elapsed).toBeLessThan(250);
  });

  it("projects a 10k reply conversation without recursive rendering or an unbounded paint window", () => {
    const state = createTestState();
    const focus = state.tweetsById.tw_1;
    focus.replyIds = [];
    for (let index = 0; index < 9_999; index += 1) {
      const id = `tw_reply_${index}`;
      state.tweetsById[id] = testTweet(id, {
        text: `Reply ${index}`,
        replyToId: focus.id,
        createdAt: focus.createdAt + index + 1,
      });
      focus.replyIds.push(id);
    }
    const started = performance.now();
    const conversation = selectTweetConversation(
      createTestWorld(state),
      "phone",
      focus.id,
    );
    const projection = projectXConversation({
      state,
      conversation,
      width: 393,
      viewportHeight: 620,
      scrollY: 600_000,
    });
    const elapsed = performance.now() - started;
    expect(projection.items).toHaveLength(10_000);
    expect(projection.visibleItems.length).toBeLessThan(20);
    expect(elapsed).toBeLessThan(250);
  });
});
