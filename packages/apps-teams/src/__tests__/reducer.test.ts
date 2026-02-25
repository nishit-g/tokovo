import { describe, expect, it } from "vitest";
import { produce } from "immer";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { teamsReducer } from "../runtime/reducer.js";
import type { TeamsState } from "../types/state.js";

function createWorld(): WorldState {
  return {
    appState: {},
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

type TeamsReducerEvent = Parameters<typeof teamsReducer>[1];

function run(state: WorldState, event: TeamsReducerEvent): WorldState {
  return produce(state, (draft: WorldState) => {
    teamsReducer(draft, event);
  });
}

function getTeamsState(world: WorldState): TeamsState {
  const appState = world.appState.app_teams;
  expect(appState).toBeDefined();
  return appState as TeamsState;
}

describe("teams reducer", () => {
  it("handles dm send/receive", () => {
    const s0 = createWorld();
    const s1 = run(s0, {
      at: 1,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_DM_SEND",
      payload: {
        dmId: "dm_1",
        messageId: "m1",
        senderId: "u_me",
        senderName: "Me",
        text: "hi",
      },
      deviceId: "phone",
    });

    const s2 = run(s1, {
      at: 2,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_DM_RECEIVE",
      payload: {
        dmId: "dm_1",
        messageId: "m2",
        fromId: "u_a",
        fromName: "Alex",
        text: "yo",
      },
      deviceId: "phone",
    });

    const app = getTeamsState(s2);
    expect(app.dms.dm_1.messageIds).toEqual(["m1", "m2"]);
  });

  it("handles channel thread and call lifecycle", () => {
    const s0 = createWorld();
    const s1 = run(s0, {
      at: 5,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_THREAD_OPEN",
      payload: { channelId: "general", threadId: "t1" },
      deviceId: "phone",
    });
    const s2 = run(s1, {
      at: 6,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_CALL_START",
      payload: {
        callId: "c1",
        participantIds: ["u_me", "u_a"],
        scope: "channel",
        channelId: "general",
      },
      deviceId: "phone",
    });
    const s3 = run(s2, {
      at: 7,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_CALL_END",
      payload: { callId: "c1" },
      deviceId: "phone",
    });

    const app = getTeamsState(s3);
    expect(app.calls.c1.status).toBe("ended");
    expect(app.screen).toBe("channel_thread");
  });

  it("increments unread for inactive dm", () => {
    const world = run(createWorld(), {
      at: 12,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_DM_RECEIVE",
      payload: {
        dmId: "dm_unread",
        messageId: "m_unread",
        fromId: "u_b",
        fromName: "Blake",
        text: "ping",
      },
      deviceId: "phone",
    });

    const app = getTeamsState(world);
    expect(app.dms.dm_unread.unreadCount).toBe(1);
  });

  it("keeps view mode aligned with screen on navigation", () => {
    const world = run(createWorld(), {
      at: 1,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_NAVIGATE_SCREEN",
      payload: { screen: "dm_thread" },
      deviceId: "phone",
    });

    const app = getTeamsState(world);
    expect(app.screen).toBe("dm_thread");
    expect(app.viewMode).toBe("CHAT");
  });
});
