import { describe, expect, it } from "vitest";
import { produce } from "immer";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { teamsReducer } from "../runtime/reducer.js";
import type { TeamsState } from "../types/state.js";
import { dmTarget, threadTarget } from "../dsl/index.js";
import { teamsBootstrap } from "../bootstrap.js";

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

function createBootstrapContext(
  baseState: TeamsState,
  snapshot: Record<string, unknown>,
) {
  return {
    appId: "app_teams" as const,
    deviceId: "phone",
    device: { id: "phone", app: "app_teams", profile: "iphone16" } as never,
    ir: { id: "test-ir", devices: [], timeline: [] } as never,
    baseState,
    snapshot: {
      appId: "app_teams" as const,
      deviceId: "phone",
      snapshotVersion: 1,
      snapshot,
    },
  } as const;
}

describe("teams reducer", () => {
  it("hydrates bootstrap snapshots and thread messages", () => {
    const hydrated = createWorld();
    hydrated.appState.app_teams = teamsBootstrap.hydrate(createBootstrapContext(
      getTeamsState(run(createWorld(), {
        at: 0,
        kind: "APP",
        appId: "app_teams",
        type: "TEAMS_OPEN_CHAT_LIST",
        payload: { filter: "all" },
        deviceId: "phone",
      })),
      {
        users: [{ id: "u_pm", displayName: "Priya" }],
        channels: [{ id: "launch", name: "launch", memberIds: ["u_pm", "u_me"], threadIds: [], unreadCount: 0, mentionCount: 0 }],
        threads: [{ id: "th_1", channelId: "launch", title: "War room", participantIds: ["u_pm", "u_me"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" }],
      },
    ));
    const next = run(hydrated, {
      at: 3,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_MESSAGE_RECEIVE",
      payload: {
        target: threadTarget("launch", "th_1"),
        senderId: "u_pm",
        messageId: "m1",
        text: "Ship only after green checks.",
        mentionedUserIds: ["u_me"],
      },
      deviceId: "phone",
    });

    const app = getTeamsState(next);
    expect(app.channels.launch.threadIds).toContain("th_1");
    expect(app.threads.th_1.messageIds).toEqual(["m1"]);
    expect(app.channels.launch.mentionCount).toBe(1);
  });

  it("tracks draft, typing, unread, and active thread transitions", () => {
    const world = createWorld();
    world.appState.app_teams = teamsBootstrap.hydrate(createBootstrapContext(
      getTeamsState(run(createWorld(), {
        at: 0,
        kind: "APP",
        appId: "app_teams",
        type: "TEAMS_OPEN_CHAT_LIST",
        payload: { filter: "all" },
        deviceId: "phone",
      })),
      {
        dms: [{ id: "dm_exec", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 0, mentionCount: 0 }],
      },
    ));
    let next = world;
    next = run(next, {
      at: 1,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_DRAFT_SET",
      payload: { target: dmTarget("dm_exec"), text: "Draft update" },
      deviceId: "phone",
    });
    next = run(next, {
      at: 2,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_TYPING_START",
      payload: { target: dmTarget("dm_exec"), userId: "u_exec" },
      deviceId: "phone",
    });
    next = run(next, {
      at: 3,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_MESSAGE_RECEIVE",
      payload: {
        target: dmTarget("dm_exec"),
        senderId: "u_exec",
        messageId: "m_exec",
        text: "Where is the update?",
      },
      deviceId: "phone",
    });
    next = run(next, {
      at: 4,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_OPEN_DM",
      payload: { dmId: "dm_exec" },
      deviceId: "phone",
    });

    const app = getTeamsState(next);
    expect(app.dms.dm_exec.draftText).toBe("Draft update");
    expect(app.typing["dm:dm_exec"].userIds).toContain("u_exec");
    expect(app.dms.dm_exec.unreadCount).toBe(0);
    expect(app.screen).toBe("dm_thread");
  });

  it("handles notifications and call lifecycle", () => {
    let world = run(createWorld(), {
      at: 5,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_NOTIFICATION_PUSH",
      payload: {
        id: "n1",
        title: "War room",
        text: "New executive update",
        kind: "message",
      },
      deviceId: "phone",
    });
    world = run(world, {
      at: 6,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_CALL_START",
      payload: {
        callId: "c1",
        participantIds: ["u_me", "u_pm"],
        scope: "dm",
        dmId: "dm_exec",
        mode: "audio",
      },
      deviceId: "phone",
    });
    world = run(world, {
      at: 7,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_CALL_END",
      payload: { callId: "c1" },
      deviceId: "phone",
    });

    const app = getTeamsState(world);
    expect(app.notifications.n1.title).toBe("War room");
    expect(app.calls.c1.status).toBe("ended");
    expect(app.screen).toBe("chat_list");
  });
});
