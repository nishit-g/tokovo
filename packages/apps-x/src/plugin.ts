import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { XView } from "./ui/index.js";
import { xReducer } from "./runtime/reducer.js";
import { xLowering } from "./lowering/index.js";
import { xLayoutStrategies } from "./layout/index.js";
import { createXInitialState } from "./runtime/state.js";
import { XAnchorProvider } from "./anchors/provider.js";
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
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "BOOKMARK_TWEET" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "SHARE_TWEET" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_x", type: "ADD_DM_MESSAGE" },
    action: "PLAY_ONE_SHOT",
    sound: "notification_soft",
    bus: "ui",
    duckMusic: true,
  },
];

export const XPlugin: TokovoPluginContract<"app_x"> & {
  v2Lowering: typeof xLowering;
} = {
  id: "app_x",
  version: "0.0.0",
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
    "VIEW_TWEET",
    "BOOKMARK_TWEET",
    "SHARE_TWEET",
    "SET_SCREEN",
    "SET_ACTIVE_TWEET",
    "SET_ACTIVE_USER",
    "SET_ACTIVE_THREAD",
    "SET_COMPOSE_DRAFT",
    "SET_THREAD_DRAFT",
    "SET_THREAD_TYPING",
    "SET_TIMELINE_TAB",
    "SET_PROFILE_TAB",
    "SET_NOTIFICATIONS_TAB",
    "ADD_NOTIFICATION",
    "ADD_DM_THREAD",
    "ADD_DM_MESSAGE",
    "NAVIGATE_BACK",
    "SET_THEME_MODE",
  ] as const,
  assets: {
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
  anchorProvider: XAnchorProvider,
  notificationAdapter: xNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerXPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(XPlugin);
}

export type { XDslApi };
