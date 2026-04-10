import type { PluginViews, TokovoPluginContract } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { INSTAGRAM_APP_ID, INSTAGRAM_DISPLAY_NAME, INSTAGRAM_VERSION } from "./constants.js";
import { instagramAssets, instagramAudioRules } from "./assets/index.js";
import { InstagramView } from "./ui/index.js";
import { instagramReducer } from "./runtime/reducer.js";
import { createInstagramInitialState } from "./runtime/state.js";
import { instagramLowering } from "./lowering/index.js";
import { instagramLayoutStrategies } from "./layout/index.js";
import { InstagramAnchorProvider } from "./anchors/provider.js";
import { instagramDsl, type InstagramDslApi } from "./dsl/extension.js";
import { instagramNotificationAdapter } from "./notifications/adapter.js";
import { instagramBootstrap } from "./bootstrap.js";

const instagramViews: PluginViews = {
  AppRoot: InstagramView,
};

export const InstagramPlugin: TokovoPluginContract<"app_instagram"> & {
  v2Lowering: typeof instagramLowering;
} = {
  id: INSTAGRAM_APP_ID,
  version: INSTAGRAM_VERSION,
  displayName: INSTAGRAM_DISPLAY_NAME,
  views: instagramViews,
  reducer: instagramReducer,
  createInitialState: createInstagramInitialState,
  bootstrap: instagramBootstrap,
  eventKinds: [
    "INSTAGRAM_ADD_USER",
    "INSTAGRAM_SET_CURRENT_USER",
    "INSTAGRAM_FOLLOW_USER",
    "INSTAGRAM_ADD_POST",
    "INSTAGRAM_LIKE_POST",
    "INSTAGRAM_ADD_COMMENT",
    "INSTAGRAM_ADD_STORY_SET",
    "INSTAGRAM_OPEN_STORY",
    "INSTAGRAM_ADVANCE_STORY",
    "INSTAGRAM_ADD_DM_THREAD",
    "INSTAGRAM_ADD_DM_MESSAGE",
    "INSTAGRAM_SET_THREAD_DRAFT",
    "INSTAGRAM_SET_THREAD_TYPING",
    "INSTAGRAM_ADD_NOTIFICATION",
    "INSTAGRAM_DISMISS_NOTIFICATION",
    "INSTAGRAM_SET_SCREEN",
    "INSTAGRAM_SET_ACTIVE_POST",
    "INSTAGRAM_SET_ACTIVE_PROFILE",
    "INSTAGRAM_SET_ACTIVE_THREAD",
    "INSTAGRAM_SET_ACTIVE_STORY_SET",
    "INSTAGRAM_SET_ACTIVE_STORY",
    "INSTAGRAM_NAVIGATE_BACK",
    "INSTAGRAM_SET_COMPOSER_DRAFT",
    "INSTAGRAM_SET_PROFILE_TAB",
    "INSTAGRAM_SET_THEME_MODE",
  ] as const,
  assets: instagramAssets,
  audioRules: instagramAudioRules,
  v2Lowering: instagramLowering,
  layouts: instagramLayoutStrategies,
  anchorProvider: InstagramAnchorProvider,
  dsl: instagramDsl,
  notificationAdapter: instagramNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerInstagramPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(InstagramPlugin);
}

export default InstagramPlugin;
export type { InstagramDslApi };
