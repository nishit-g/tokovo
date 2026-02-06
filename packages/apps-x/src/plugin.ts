import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { XView } from "./ui";
import { xReducer } from "./runtime/reducer";
import { xLowering } from "./lowering";
import { xLayoutStrategies } from "./layout";
import { xAnchors } from "./runtime/adapters/anchors";
import { createXInitialState } from "./runtime/state";

const xViews: PluginViews = {
  AppRoot: XView,
};

export const XPlugin: TokovoPluginContract<"app_x"> & {
  v2Lowering: typeof xLowering;
} = {
  id: "app_x",
  version: "0.0.0",
  displayName: "X",
  views: xViews,
  reducer: xReducer,
  createInitialState: createXInitialState,
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
  v2Lowering: xLowering,
  layouts: xLayoutStrategies,
  anchors: xAnchors,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerXPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(XPlugin);
}
