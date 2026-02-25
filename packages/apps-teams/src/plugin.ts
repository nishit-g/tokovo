import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { TEAMS_APP_ID, TEAMS_DISPLAY_NAME, TEAMS_VERSION } from "./constants.js";
import { teamsReducer } from "./runtime/reducer.js";
import { createTeamsInitialState } from "./runtime/initial-state.js";
import { TeamsView } from "./ui/index.js";
import { teamsV2Lowering } from "./lowering/index.js";
import { teamsLayoutStrategies } from "./layout/index.js";
import { TeamsAnchorProvider } from "./anchors/provider.js";

const teamsViews: PluginViews = {
  AppRoot: TeamsView,
  strategies: {
    ios: {
      ChatScreen: TeamsView,
    },
  },
};

const teamsAssets = {
  sounds: {
    "app_teams.message_in": "plugins/teams/received.wav",
    "app_teams.message_out": "plugins/teams/sent.wav",
    "app_teams.call_start": "plugins/teams/call_start.wav",
    "app_teams.call_end": "plugins/teams/call_end.wav",
    "app_teams.notify": "plugins/teams/notify.wav"
  },
  icons: {
    app_icon: "/icons/teams.svg",
  },
};

const teamsAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_DM_SEND" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.message_out",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_DM_RECEIVE" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.message_in",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_NOTIFICATION_PUSH" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.notify",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_CALL_START" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.call_start",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_CALL_END" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.call_end",
    bus: "ui",
  },
];

export const TeamsPlugin: TokovoPluginContract<"app_teams"> & {
  v2Lowering: typeof teamsV2Lowering;
} = {
  id: TEAMS_APP_ID,
  version: TEAMS_VERSION,
  displayName: TEAMS_DISPLAY_NAME,
  reducer: teamsReducer,
  views: teamsViews,
  createInitialState: createTeamsInitialState,
  eventKinds: [
    "TEAMS_DM_SEND",
    "TEAMS_DM_RECEIVE",
    "TEAMS_CHANNEL_POST",
    "TEAMS_CHANNEL_REPLY",
    "TEAMS_THREAD_OPEN",
    "TEAMS_THREAD_CLOSE",
    "TEAMS_SET_ACTIVE_CHAT",
    "TEAMS_SET_ACTIVE_CHANNEL",
    "TEAMS_MENTION_ADD",
    "TEAMS_PRESENCE_SET",
    "TEAMS_CALL_START",
    "TEAMS_CALL_END",
    "TEAMS_NOTIFICATION_PUSH",
    "TEAMS_NAVIGATE_SCREEN",
  ] as const,
  assets: {
    ...teamsAssets,
    designWidth: 393,
  },
  audioRules: teamsAudioRules,
  v2Lowering: teamsV2Lowering,
  layouts: teamsLayoutStrategies,
  anchorProvider: TeamsAnchorProvider,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerTeamsPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(TeamsPlugin);
}

export default TeamsPlugin;
