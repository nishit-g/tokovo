import { describe, expect, it } from "vitest";
import { teamsV2Lowering } from "../lowering/index.js";

function notificationContext() {
  const intents: unknown[] = [];
  const interactions: unknown[] = [];
  return {
    intents,
    interactions,
    emitNotification: (intent: unknown) => intents.push(intent),
    emitNotificationInteraction: (interaction: unknown) =>
      interactions.push(interaction),
  };
}

describe("teams lowering", () => {
  it("passes through app events", () => {
    const events = teamsV2Lowering.lower({
      at: 10,
      kind: "APP",
      appId: "app_teams",
      deviceId: "phone",
      type: "TEAMS_OPEN_DM",
      payload: { dmId: "dm_1" },
    }, notificationContext());

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "TEAMS_OPEN_DM" });
  });

  it("keeps message sends app-owned", () => {
    const events = teamsV2Lowering.lower({
      at: 60,
      kind: "APP",
      appId: "app_teams",
      deviceId: "phone",
      type: "TEAMS_MESSAGE_SEND",
      payload: {
        messageId: "m1",
        senderId: "u_me",
        text: "hello",
        target: { kind: "dm", dmId: "dm_1" },
      },
    }, notificationContext());

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "APP", type: "TEAMS_MESSAGE_SEND" });
  });

  it("rejects unknown teams events", () => {
    expect(() =>
      teamsV2Lowering.lower({
        at: 1,
        kind: "APP",
        appId: "app_teams",
        deviceId: "phone",
        type: "TEAMS_DM_SEND",
        payload: { dmId: "legacy" },
      } as never, notificationContext()),
    ).toThrowError();
  });

  it("emits a semantic notification intent for incoming messages", () => {
    const ctx = notificationContext();
    const events = teamsV2Lowering.lower({
      at: 24,
      kind: "APP",
      appId: "app_teams",
      deviceId: "phone",
      type: "TEAMS_MESSAGE_RECEIVE",
      payload: {
        messageId: "notif_1",
        senderId: "u_finance",
        senderName: "Finance",
        text: "Finance needs approval",
        mentionedUserIds: ["u_me"],
        target: { kind: "dm", dmId: "dm_exec" },
      },
    }, ctx);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "APP", type: "TEAMS_MESSAGE_RECEIVE" });
    expect(ctx.intents).toEqual([expect.objectContaining({
      id: "notif_1",
      appId: "app_teams",
      interruption: "timeSensitive",
      threadId: "dm:dm_exec",
      category: "work",
    })]);
  });
});
