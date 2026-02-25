import { describe, expect, it } from "vitest";
import { TeamsDslError } from "../errors.js";
import { createTeamsTrackBuilder } from "../dsl/track-builder.js";

describe("teams dsl", () => {
  it("emits deterministic event sequence for switchDm + dmSend", () => {
    let order = 0;
    const builder = createTeamsTrackBuilder(30, "phone", () => ++order);

    builder.switchDm("dm_1", "1s");
    builder.at("2s").dmSend({
      dmId: "dm_1",
      senderId: "me",
      senderName: "Me",
      text: "hello",
    });

    expect(builder._events.map((e) => e.type)).toEqual([
      "TEAMS_SET_ACTIVE_CHAT",
      "TEAMS_NAVIGATE_SCREEN",
      "TEAMS_DM_SEND",
    ]);
    expect(builder._events[2].payload).toMatchObject({ dmId: "dm_1", text: "hello" });
  });

  it("throws typed error on invalid payload", () => {
    let order = 0;
    const builder = createTeamsTrackBuilder(30, "phone", () => ++order);

    expect(() => {
      builder.at(10).dmSend({
        dmId: "",
        senderId: "me",
        senderName: "Me",
        text: "hello",
      });
    }).toThrowError(TeamsDslError);
  });

  it("emits mention event and validates call participants", () => {
    let order = 0;
    const builder = createTeamsTrackBuilder(30, "phone", () => ++order);

    builder.at("3s").mention("thread_1", "message_1", "user_1");
    expect(builder._events[0]).toMatchObject({
      type: "TEAMS_MENTION_ADD",
      payload: {
        threadId: "thread_1",
        messageId: "message_1",
        targetUserId: "user_1",
        targetType: "user",
      },
    });

    expect(() => {
      builder.at("4s").startCall({
        callId: "call_1",
        participantIds: [],
        scope: "channel",
        channelId: "eng",
      });
    }).toThrowError(TeamsDslError);
  });
});
