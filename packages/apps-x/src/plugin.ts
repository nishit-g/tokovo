import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { XView } from "./ui/index.js";
import { xReducer } from "./runtime/reducer.js";
import { xLowering } from "./lowering/index.js";
import { xLayoutStrategies } from "./layout/index.js";
import { createXInitialState } from "./runtime/state.js";
import { XCinematicSubjects } from "./camera/subjects.js";
import { collectXAssetRefs } from "./asset-refs.js";
import { xBootstrap } from "./bootstrap.js";
import { xDsl, type XDslApi } from "./dsl/extension.js";
import { xNotificationAdapter } from "./notifications/adapter.js";

const xViews: PluginViews = {
  AppRoot: XView,
};

const xAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
  {
    match: { kind: "APP", appId: "app_x", type: "LIKE_TWEET" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.action",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "BOOKMARK_TWEET" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.action",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "SHARE_TWEET" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.action",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "ADD_DM_MESSAGE_OUTGOING" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.message_out",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: "app_x", type: "ADD_DM_MESSAGE_INCOMING" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.message_in",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: "app_x", type: "ADD_DM_REACTION" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.reaction",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "ADD_NOTIFICATION" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.notification",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: "app_x", type: "VOTE_POLL" },
    action: "PLAY_ONE_SHOT",
    sound: "app_x.action",
    bus: "ui",
  },
];

export const XPlugin: TokovoPluginContract<"app_x"> & {
  v2Lowering: typeof xLowering;
  notificationAdapter: typeof xNotificationAdapter;
} = {
  id: "app_x",
  version: "2.0.0",
  displayName: "X",
  views: xViews,
  reducer: xReducer,
  createInitialState: createXInitialState,
  bootstrap: xBootstrap,
  eventKinds: [
    "ADD_USER",
    "SET_CURRENT_USER",
    "FOLLOW_USER",
    "UNFOLLOW_USER",
    "ADD_TWEET",
    "LIKE_TWEET",
    "UNLIKE_TWEET",
    "VIEW_TWEET",
    "BOOKMARK_TWEET",
    "UNBOOKMARK_TWEET",
    "SHARE_TWEET",
    "VOTE_POLL",
    "SET_MEDIA_PLAYBACK",
    "SET_SCREEN",
    "SET_COMPOSE_DRAFT",
    "SET_COMPOSER_STATUS",
    "SET_THREAD_DRAFT",
    "SET_SCROLL",
    "START_DM_TYPING",
    "STOP_DM_TYPING",
    "SET_TIMELINE_TAB",
    "SET_PROFILE_TAB",
    "SET_NOTIFICATIONS_TAB",
    "ADD_NOTIFICATION",
    "ADD_DM_THREAD",
    "ADD_DM_MESSAGE_OUTGOING",
    "ADD_DM_MESSAGE_INCOMING",
    "ADD_DM_REACTION",
    "REMOVE_DM_REACTION",
    "SET_DM_DELIVERY",
    "NAVIGATE_BACK",
  ] as const,
  assets: {
    sounds: {
      "app_x.action": "generated/core/tap.wav",
      "app_x.notification": "generated/core/notification-soft.wav",
      "app_x.message_out": "generated/core/notification-soft.wav",
      "app_x.message_in": "generated/core/notification-soft.wav",
      "app_x.reaction": "generated/core/tap.wav",
    },
    icons: {
      app_icon: "/icons/x.svg",
    },
    designWidth: 393,
  },
  audioRules: xAudioRules,
  v2Lowering: xLowering,
  layouts: xLayoutStrategies,
  dsl: xDsl,
  collectAssetRefs: collectXAssetRefs,
  cinematicSubjects: XCinematicSubjects,
  notificationAdapter: xNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerXPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(XPlugin);
}

export const xRuntimeEntry = {
  id: "@tokovo/apps-x",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerXPlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [xRuntimeEntry] as const;

export type { XDslApi };
