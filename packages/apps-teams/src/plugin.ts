import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import {
  TEAMS_APP_ID,
  TEAMS_DEFAULT_DEVICE_WIDTH,
  TEAMS_DISPLAY_NAME,
  TEAMS_VERSION,
} from "./constants.js";
import { teamsReducer } from "./runtime/reducer.js";
import { createTeamsInitialState } from "./runtime/initial-state.js";
import { TeamsView } from "./ui/index.js";
import { teamsV2Lowering } from "./lowering/index.js";
import { teamsLayoutStrategies } from "./layout/index.js";
import { TeamsAnchorProvider } from "./anchors/provider.js";
import { TEAMS_EVENT_TYPES } from "./schemas/index.js";
import { teamsAudioRules } from "./assets/audio-rules.js";
import { TeamsMetadata } from "./assets/metadata.js";
import { teamsDsl, type TeamsDslApi } from "./dsl/index.js";
import { collectTeamsAssetRefs } from "./asset-refs.js";
import { TeamsBehavior } from "./camera/index.js";
import { teamsNotificationAdapter } from "./notifications/adapter.js";
import { teamsBootstrap } from "./bootstrap.js";

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
    "app_teams.notify": "plugins/teams/notify.wav",
  },
  icons: {
    app_icon: "/icons/teams.svg",
  },
  designWidth: TEAMS_DEFAULT_DEVICE_WIDTH,
};

export const TeamsPluginV2: TokovoPluginContract<"app_teams"> & {
  v2Lowering: typeof teamsV2Lowering;
  behaviors: typeof TeamsBehavior;
} = {
  id: TEAMS_APP_ID,
  version: TEAMS_VERSION,
  displayName: TEAMS_DISPLAY_NAME,
  themeColor: TeamsMetadata.themeColor,
  icon: TeamsMetadata.icon,
  reducer: teamsReducer,
  views: teamsViews,
  createInitialState: createTeamsInitialState,
  bootstrap: teamsBootstrap,
  eventKinds: TEAMS_EVENT_TYPES,
  assets: teamsAssets,
  audioRules: teamsAudioRules,
  v2Lowering: teamsV2Lowering,
  layouts: teamsLayoutStrategies,
  dsl: teamsDsl,
  collectAssetRefs: collectTeamsAssetRefs,
  anchorProvider: TeamsAnchorProvider,
  notificationAdapter: teamsNotificationAdapter,
  behaviors: TeamsBehavior,
};

export const TeamsPlugin = TeamsPluginV2;

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerTeamsPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(TeamsPluginV2);
}

export const teamsRuntimeEntry = {
  id: "@tokovo/apps-teams",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerTeamsPlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [teamsRuntimeEntry] as const;

export default TeamsPluginV2;
export type { TeamsDslApi };
