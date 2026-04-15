import type { TokovoPluginContract, PluginViews, PluginReducer } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { LINKEDIN_APP_ID, LINKEDIN_DISPLAY_NAME, LINKEDIN_VERSION } from "./constants.js";
import { linkedInReducer } from "./runtime/reducer.js";
import { createLinkedInInitialState } from "./runtime/state.js";
import { LinkedInView } from "./ui/index.js";
import { linkedInLowering } from "./lowering/index.js";
import { linkedInLayoutStrategies } from "./layout/index.js";
import { LinkedInAnchorProvider } from "./anchors/provider.js";
import { collectLinkedInAssetRefs } from "./asset-refs.js";
import { linkedInBootstrap } from "./bootstrap.js";
import { linkedInAudioRules } from "./assets/audio-rules.js";
import { linkedInDsl, type LinkedInDslApi } from "./dsl/index.js";
import { linkedInNotificationAdapter } from "./notifications/adapter.js";

const views: PluginViews = {
  AppRoot: LinkedInView,
};

export const LinkedInPlugin: TokovoPluginContract<"app_linkedin"> & {
  v2Lowering: typeof linkedInLowering;
} = {
  id: LINKEDIN_APP_ID,
  version: LINKEDIN_VERSION,
  displayName: LINKEDIN_DISPLAY_NAME,
  views,
  reducer: linkedInReducer as PluginReducer<"app_linkedin">,
  createInitialState: createLinkedInInitialState,
  bootstrap: linkedInBootstrap,
  eventKinds: [
    "LINKEDIN_ADD_USER",
    "LINKEDIN_SET_CURRENT_USER",
    "LINKEDIN_CONNECT_USERS",
    "LINKEDIN_DISCONNECT_USERS",
    "LINKEDIN_ADD_POST",
    "LINKEDIN_REPOST_POST",
    "LINKEDIN_REACT_POST",
    "LINKEDIN_ADD_COMMENT",
    "LINKEDIN_VIEW_POST",
    "LINKEDIN_SET_SCREEN",
    "LINKEDIN_SET_ACTIVE_POST",
    "LINKEDIN_SET_ACTIVE_USER",
    "LINKEDIN_SET_ACTIVE_THREAD",
    "LINKEDIN_SET_COMPOSE_DRAFT",
    "LINKEDIN_SET_THEME_MODE",
    "LINKEDIN_ADD_NOTIFICATION",
    "LINKEDIN_ADD_DM_THREAD",
    "LINKEDIN_ADD_DM_MESSAGE",
    "LINKEDIN_NAVIGATE_BACK",
  ] as const,
  assets: {
    icons: { app_icon: "/icons/linkedin.svg" },
    designWidth: 393,
  },
  audioRules: linkedInAudioRules,
  v2Lowering: linkedInLowering,
  layouts: linkedInLayoutStrategies,
  dsl: linkedInDsl,
  collectAssetRefs: collectLinkedInAssetRefs,
  anchorProvider: LinkedInAnchorProvider,
  notificationAdapter: linkedInNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerLinkedInPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(LinkedInPlugin);
}

export const linkedInRuntimeEntry = {
  id: "@tokovo/apps-linkedin",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerLinkedInPlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [linkedInRuntimeEntry] as const;

export default LinkedInPlugin;
export type { LinkedInDslApi };
