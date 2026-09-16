import { describe, expect, it } from "vitest";
import { teamsNotificationAdapter } from "../notifications/adapter.js";

describe("notification destinations", () => {
  it.each([
    [{ dmId: "dm-1" }, "TEAMS_OPEN_DM", { dmId: "dm-1" }],
    [{ channelId: "channel-1" }, "TEAMS_OPEN_THREAD", { channelId: "channel-1", threadId: "thread-1" }],
  ])("routes to authored destinations", (metadata, type, payload) => {
    const target = teamsNotificationAdapter.defaultAction!({
      id: "notice", deviceId: "phone", appId: "app_teams", deliverAtFrame: 0,
      content: { title: "Team", body: "Update" }, threadId: "thread-1", metadata,
    });
    expect(target.appEvent).toEqual({ appId: "app_teams", type, payload });
  });
  it("does not invent a destination from a thread id alone", () => {
    expect(teamsNotificationAdapter.defaultAction!({
      id: "notice", deviceId: "phone", appId: "app_teams", deliverAtFrame: 0,
      content: { title: "Team", body: "Update" }, threadId: "thread-1",
    }).appEvent).toBeUndefined();
  });
});
