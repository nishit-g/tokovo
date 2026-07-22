/**
 * WhatsApp Plugin - Production Contract
 *
 * Self-contained plugin with runtime, lowering, layout, camera, and authoring
 * contracts:
 * - Tier A: id, version, displayName, reducer, views
 * - Tier B: lowering handler, layouts
 *
 * @see docs/ARCHITECTURE.md
 */

import { WHATSAPP_APP_ID } from "./constants.js";
import type {
  TokovoPluginContract,
  PluginViews,
  PluginReducer,
} from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";

// Runtime Layer
import { whatsappReducer } from "./runtime/reducer.js";
import { createWhatsAppInitialState } from "./runtime/initial-state.js";

// Views Layer
import { WhatsappChatView } from "./ui/index.js";

// Lowering Layer (V2 is default)
import { whatsappV2Lowering } from "./lowering/index.js";

// Layout Layer
import { computeChatLayout, computeFeedLayout } from "./layout/index.js";

// Assets
import { whatsappAudioRules } from "./assets/audio-rules.js";

// Camera
import { WhatsAppCinematicSubjects } from "./camera/subjects.js";
import { collectWhatsAppAssetRefs } from "./asset-refs.js";
import { whatsappBootstrap } from "./bootstrap.js";
import { whatsappNotificationAdapter } from "./notifications/adapter.js";

// =============================================================================
// PLUGIN VIEWS
// =============================================================================

const whatsappViews: PluginViews = {
  AppRoot: WhatsappChatView,
  strategies: {
    ios: {
      ChatScreen: WhatsappChatView,
    },
  },
};

// =============================================================================
// PLUGIN ASSETS
// =============================================================================

const whatsappAssets = {
  sounds: {
    "app_whatsapp.message_out": "plugins/whatsapp/sent.wav",
    "app_whatsapp.typing_loop": "plugins/whatsapp/typing_loop.wav",
  },
  icons: {
    app_icon: "/icons/whatsapp.svg",
  },
  designWidth: 393,
};

// =============================================================================
// ENTERPRISE PLUGIN CONTRACT
// =============================================================================

export const WhatsAppPluginV2: TokovoPluginContract<"app_whatsapp"> & {
  v2Lowering: typeof whatsappV2Lowering;
  notificationAdapter: typeof whatsappNotificationAdapter;
} = {
  // === TIER A: Identity ===
  id: WHATSAPP_APP_ID as "app_whatsapp",
  version: "2.0.0",
  displayName: "WhatsApp",

  // === TIER A: Runtime ===
  reducer: whatsappReducer as PluginReducer<"app_whatsapp">,
  views: whatsappViews,
  createInitialState: createWhatsAppInitialState,
  bootstrap: whatsappBootstrap,

  // === TIER A: Event Routing ===
  eventKinds: [
    "MESSAGE_RECEIVED",
    "MESSAGE_SENT",
    "TYPING_START",
    "TYPING_END",
    "IMAGE_RECEIVED",
    "IMAGE_SENT",
    "VIDEO_RECEIVED",
    "VIDEO_SENT",
    "VOICE_RECEIVED",
    "VOICE_SENT",
    "MEDIA_DOWNLOAD_STARTED",
    "MEDIA_DOWNLOAD_PROGRESS",
    "MEDIA_DOWNLOAD_COMPLETED",
    "MEDIA_DOWNLOAD_FAILED",
    "MEDIA_PLAYBACK_STARTED",
    "MEDIA_PLAYBACK_PROGRESS",
    "MEDIA_PLAYBACK_PAUSED",
    "MEDIA_PLAYBACK_COMPLETED",
    "MEDIA_VIEWER_OPENED",
    "MEDIA_VIEWER_CLOSED",
    "STATUS_VIEWER_OPENED",
    "STATUS_VIEWER_ADVANCED",
    "STATUS_VIEWER_CLOSED",
    "GESTURE_STARTED",
    "GESTURE_UPDATED",
    "GESTURE_COMPLETED",
    "GESTURE_CANCELLED",
    "REPLY_COMPOSER_DISMISSED",
    "SET_LOCALE",
    "GIF_RECEIVED",
    "GIF_SENT",
    "STICKER_RECEIVED",
    "STICKER_SENT",
    "DOCUMENT_RECEIVED",
    "DOCUMENT_SENT",
    "CONTACT_RECEIVED",
    "CONTACT_SENT",
    "LOCATION_RECEIVED",
    "LOCATION_SENT",
    "REACTION_ADDED",
    "READ",
    "MESSAGE_READ",
    "MESSAGE_DELIVERY_FAILED",
    "MESSAGE_RETRY_STARTED",
    "MESSAGE_RETRY_COMPLETED",
    "MESSAGE_DELETED",
    "MESSAGE_EDITED",
    "MESSAGE_FORWARDED",
    "CONVERSATION_OPENED",
    "NAVIGATE_SCREEN",
    "GROUP_MEMBER_ADDED",
    "GROUP_MEMBER_REMOVED",
    "GROUP_ADMIN_CHANGED",
    "GROUP_INFO_UPDATED",
    "PIN_CONVERSATION",
    "UNPIN_CONVERSATION",
    "MUTE_CONVERSATION",
    "UNMUTE_CONVERSATION",
    "ARCHIVE_CONVERSATION",
    "UNARCHIVE_CONVERSATION",
    "SET_DRAFT",
  ] as const,

  // === TIER A: Assets ===
  assets: whatsappAssets,
  audioRules: whatsappAudioRules,
  notificationAdapter: whatsappNotificationAdapter,

  // === TIER B: Lowering ===
  v2Lowering: whatsappV2Lowering,

  // === TIER B: Layouts ===
  layouts: [
    {
      viewKind: "FEED",
      computeLayout: computeFeedLayout,
    },
    {
      viewKind: "CHAT",
      computeLayout: computeChatLayout,
    },
  ],

  collectAssetRefs: collectWhatsAppAssetRefs,

  // === Subjects ===
  cinematicSubjects: WhatsAppCinematicSubjects,
};

// =============================================================================
// EXPORTS
// =============================================================================

export { WhatsAppPluginV2 as WhatsAppPlugin };

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerWhatsAppPlugin(
  pluginManager: PluginManagerClass,
): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);

  pluginManager.register(WhatsAppPluginV2);
}

export const whatsappRuntimeEntry = {
  id: "@tokovo/apps-whatsapp",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerWhatsAppPlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [whatsappRuntimeEntry] as const;

export default WhatsAppPluginV2;
