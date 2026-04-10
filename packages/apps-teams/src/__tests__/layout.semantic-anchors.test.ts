import { describe, expect, it } from "vitest";
import type { LayoutContext, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { createTeamsInitialState } from "../runtime/initial-state.js";
import { computeTeamsChatLayout, computeTeamsFeedLayout } from "../layout/index.js";
import { TeamsAnchorProvider } from "../anchors/provider.js";
import { dmTarget, threadTarget } from "../dsl/index.js";
import { teamsReducer } from "../runtime/reducer.js";
import { produce } from "immer";
import { teamsBootstrap } from "../bootstrap.js";

function createWorld(): WorldState {
  return {
    appState: { app_teams: createTeamsInitialState() },
    devices: {
      phone: {
        screenDimensions: {
          width: 393,
          height: 852,
          safeAreaTop: 44,
          safeAreaBottom: 34,
        },
      },
    },
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as unknown as WorldState;
}

function reduce(world: WorldState, event: Parameters<typeof teamsReducer>[1]): WorldState {
  return produce(world, (draft) => teamsReducer(draft, event));
}

function baseCtx(world: WorldState, viewKind: LayoutContext["viewKind"]): LayoutContext {
  return {
    world,
    t: 30,
    activeDeviceId: "phone",
    activeAppId: "app_teams",
    viewKind,
    viewportWidth: 393,
    viewportHeight: 852,
    safeAreaInsets: { top: 44, bottom: 34, left: 0, right: 0 },
  };
}

function createBootstrapContext(
  baseState: ReturnType<typeof createTeamsInitialState>,
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

describe("teams layout semantic anchors", () => {
  it("emits semantic feed anchors for chat list", () => {
    let world = createWorld();
    world.appState.app_teams = teamsBootstrap.hydrate(
      createBootstrapContext(createTeamsInitialState(), {
        dms: [{ id: "dm_exec", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 0, mentionCount: 0 }],
      }),
    );

    const layout = computeTeamsFeedLayout(baseCtx(world, "FEED"));
    const anchors = TeamsAnchorProvider.getAnchors(world, layout, "phone");

    expect(layout.semantic?.regions.teams_header).toBeDefined();
    expect(layout.semantic?.regions.teams_content).toBeDefined();
    expect(anchors.anchors.teams_content).toBeDefined();
  });

  it("emits semantic chat anchors for last message and composer", () => {
    let world = createWorld();
    world.appState.app_teams = teamsBootstrap.hydrate(
      createBootstrapContext(createTeamsInitialState(), {
        channels: [{ id: "launch", name: "launch", memberIds: ["u_me", "u_pm"], threadIds: [], unreadCount: 0, mentionCount: 0 }],
        threads: [{ id: "th_1", channelId: "launch", title: "War room", participantIds: ["u_me", "u_pm"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" }],
        dms: [{ id: "dm_exec", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 0, mentionCount: 0 }],
      }),
    );
    world = reduce(world, {
      at: 2,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_OPEN_THREAD",
      payload: { channelId: "launch", threadId: "th_1" },
      deviceId: "phone",
    });
    world = reduce(world, {
      at: 3,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_MESSAGE_RECEIVE",
      payload: {
        target: threadTarget("launch", "th_1"),
        senderId: "u_pm",
        messageId: "m1",
        text: "Go/no-go call at 10.",
      },
      deviceId: "phone",
    });
    world = reduce(world, {
      at: 4,
      kind: "APP",
      appId: "app_teams",
      type: "TEAMS_DRAFT_SET",
      payload: { target: dmTarget("dm_exec"), text: "draft" },
      deviceId: "phone",
    });

    const layout = computeTeamsChatLayout(baseCtx(world, "CHAT"));
    const anchors = TeamsAnchorProvider.getAnchors(world, layout, "phone");

    expect(layout.semantic?.groups.message.length).toBeGreaterThan(0);
    expect(anchors.anchors.lastMessage).toBeDefined();
    expect(anchors.anchors.teams_composer).toBeDefined();
  });
});
