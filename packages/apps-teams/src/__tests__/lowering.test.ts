import { describe, expect, it } from "vitest";
import { teamsV2Lowering } from "../lowering/index.js";

describe("teams lowering", () => {
  it("passes through non-typed events", () => {
    const events = teamsV2Lowering.lower({
      at: 10,
      kind: "APP",
      appId: "app_teams",
      deviceId: "phone",
      type: "TEAMS_OPEN_DM",
      payload: { dmId: "dm_1" },
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "TEAMS_OPEN_DM" });
  });

  it("expands typed message sends into keyboard choreography", () => {
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
        typed: true,
        target: { kind: "dm", dmId: "dm_1" },
      },
    });

    expect(events.map((event) => event.kind)).toContain("DEVICE");
    expect(events.some((event) => event.kind === "APP" && event.type === "TEAMS_MESSAGE_SEND")).toBe(true);
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
      } as never),
    ).toThrowError();
  });

  it("lowers notification events into device notification runtime events", () => {
    const events = teamsV2Lowering.lower({
      at: 24,
      kind: "APP",
      appId: "app_teams",
      deviceId: "phone",
      type: "TEAMS_NOTIFICATION_PUSH",
      payload: {
        id: "notif_1",
        title: "Escalation",
        text: "Finance needs approval",
        kind: "mention",
        target: { dmId: "dm_exec" },
      },
    });

    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      kind: "DEVICE",
      type: "SHOW_NOTIFICATION",
      payload: {
        kind: "show",
        id: "notif_1",
        appId: "app_teams",
        priority: "high",
      },
    });
  });
});
