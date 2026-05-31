import { describe, expect, it } from "vitest";
import { TeamsDslError } from "../errors.js";
import {
  TeamsTrackBuilderV2,
  createTeamsTrackBuilder,
  dmTarget,
  threadTarget,
} from "../dsl/index.js";

describe("teams dsl v2", () => {
  it("emits deterministic navigation and message events", () => {
    let order = 0;
    const builder = createTeamsTrackBuilder(30, "phone", () => ++order);

    builder.openDm("dm_exec", "1s");
    builder.at("2s").sendMessage({
      target: dmTarget("dm_exec"),
      text: "hello",
      typed: true,
    });

    expect(builder._events.map((event) => event.type)).toEqual([
      "TEAMS_OPEN_DM",
      "TEAMS_MESSAGE_SEND",
    ]);
    expect(builder._events[1].payload).toMatchObject({
      target: { kind: "dm", dmId: "dm_exec" },
      text: "hello",
    });
  });

  it("supports production thread flows", () => {
    let order = 0;
    const builder = new TeamsTrackBuilderV2(30, "phone", () => ++order);

    builder.at("1s").openThread("launch", "t1");
    builder.at("2s").receiveMessage({
      target: threadTarget("launch", "t1"),
      senderId: "u_pm",
      text: "Ship only on green checks.",
      mentionedUserIds: ["u_me"],
    });
    builder.at("3s").setDraft(threadTarget("launch", "t1"), "Draft response");

    expect(builder._events[1]).toMatchObject({
      type: "TEAMS_MESSAGE_RECEIVE",
      payload: {
        target: { kind: "thread", channelId: "launch", threadId: "t1" },
        mentionedUserIds: ["u_me"],
      },
    });
  });

  it("throws typed errors for invalid call input", () => {
    let order = 0;
    const builder = createTeamsTrackBuilder(30, "phone", () => ++order);

    expect(() => {
      builder.at("4s").startCall({
        callId: "call_1",
        participantIds: [],
        scope: "thread",
        channelId: "eng",
        threadId: "th_1",
      });
    }).toThrowError(TeamsDslError);
  });
});
