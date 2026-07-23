import { describe, expect, it } from "vitest";
import { createXTrackBuilder, type XInputIntent } from "../dsl/index.js";

describe("X VNext track builder", () => {
  it("emits canonical input intents for posts, replies, and outgoing DMs", () => {
    let order = 0;
    const intents: XInputIntent[] = [];
    const track = createXTrackBuilder(
      30,
      "phone",
      () => order++,
      (intent) => intents.push(intent),
    );

    track.at("2s").postTweet(
      {
        id: "tw_post",
        authorId: "u_me",
        text: "A real post draft",
        createdAt: 1_782_000_000_000,
      },
      { input: { duration: "1s", style: "fast" } },
    );
    track.at("3s").replyTweet(
      {
        id: "tw_reply",
        authorId: "u_me",
        replyToId: "tw_post",
        text: "A real reply draft",
        createdAt: 1_782_000_001_000,
      },
      { input: { duration: "1s" } },
    );
    track.at("4s").sendMessage(
      {
        id: "msg_out",
        threadId: "dm_1",
        senderId: "u_me",
        text: "A real DM draft",
        createdAt: 1_782_000_002_000,
      },
      { input: { duration: "1s" } },
    );

    expect(
      intents.map((intent) => [
        intent.fieldId,
        intent.submitFrame,
        intent.text,
      ]),
    ).toEqual([
      ["post", 60, "A real post draft"],
      ["tweet:tw_post:reply", 90, "A real reply draft"],
      ["thread:dm_1:composer", 120, "A real DM draft"],
    ]);
    expect(track._events.map((event) => event.type)).toEqual([
      "TWEET_CREATE",
      "TWEET_REPLY",
      "DM_SEND",
    ]);
  });

  it("fails loudly when structured input is used outside the canonical episode integration", () => {
    const track = createXTrackBuilder(30, "phone", () => 0);
    expect(() =>
      track.at("1s").postTweet(
        {
          authorId: "u_me",
          text: "No silent fake typing",
          createdAt: 1_782_000_000_000,
        },
        { input: { duration: "1s" } },
      ),
    ).toThrow(/X_INPUT_INTEGRATION_MISSING/);
  });
});
