import { describe, expect, it } from "vitest";
import type { TrackEvent } from "@tokovo/ir";
import { teamsV2Lowering } from "../lowering/index.js";
import { TeamsLoweringError } from "../errors.js";

describe("teams lowering", () => {
  it("returns empty for non-teams events", () => {
    const events = teamsV2Lowering.lower({
      at: 1,
      kind: "DEVICE",
      type: "OPEN_APP",
      payload: { appId: "app_teams" },
    } as TrackEvent);

    expect(events).toEqual([]);
  });

  it("expands typed send into deterministic keyboard plan", () => {
    const runtime = teamsV2Lowering.lower({
      at: 60,
      kind: "APP",
      appId: "app_teams",
      deviceId: "phone",
      type: "TEAMS_DM_SEND",
      payload: {
        dmId: "dm_1",
        messageId: "m_1",
        senderId: "u_me",
        senderName: "Me",
        text: "hello",
        typed: true,
      },
    } as TrackEvent);

    expect(runtime.length).toBeGreaterThanOrEqual(4);
    const appEvents = runtime.filter((e) => e.kind === "APP");
    expect(appEvents).toHaveLength(1);
    expect(appEvents[0]).toMatchObject({
      appId: "app_teams",
      type: "TEAMS_DM_SEND",
    });
  });

  it("throws typed lowering error for unsupported teams event", () => {
    const invalidEvent = JSON.parse(
      JSON.stringify({
        at: 1,
        kind: "APP",
        appId: "app_teams",
        deviceId: "phone",
        type: "TEAMS_INVALID",
        payload: {},
      }),
    ) as TrackEvent;

    expect(() => {
      teamsV2Lowering.lower(invalidEvent);
    }).toThrowError(TeamsLoweringError);
  });
});
