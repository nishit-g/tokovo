/**
 * WhatsApp Plugin - Enterprise Contract
 *
 * Self-contained plugin with all tiers:
 * - Tier A: id, version, displayName, reducer, views
 * - Tier B: lowering handler, layouts
 * - Tier C: DSL extension (b.use() pattern)
 *
 * @see docs/ARCHITECTURE.md
 */

import { PluginManager, type PluginReducer } from "@tokovo/core";
import { WHATSAPP_APP_ID } from "./constants";
import type {
  TokovoPluginContract,
  PluginViews,
  PluginLayoutStrategy,
} from "@tokovo/core/src/types/plugin-contract";

// Runtime Layer
import { whatsappReducer } from "./runtime/reducer";
import { createWhatsAppInitialState } from "./runtime/initial-state";

// Views Layer
import { WhatsappChatView } from "./ui";

// Lowering Layer (V2 is default)
import { whatsappLowering, whatsappV2Lowering } from "./lowering";

// DSL Layer
import { whatsappDsl, type WhatsAppDslApi } from "./dsl";

// Layout Layer
import { computeChatLayout } from "./layout";

// Assets
import { whatsappAudioRules } from "./assets/audio-rules";

// Camera
import { WhatsAppBehavior } from "./camera";

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
    message_in: "plugins/whatsapp/received.wav",
    message_out: "plugins/whatsapp/sent.wav",
    typing_loop: "plugins/whatsapp/typing_loop.wav",
  },
  icons: {
    app_icon: "/icons/whatsapp.svg",
  },
};

// =============================================================================
// ENTERPRISE PLUGIN CONTRACT
// =============================================================================

export const WhatsAppPluginV2: TokovoPluginContract<"app_whatsapp"> & {
  appView: typeof WhatsappChatView;
  name: string;
  v2Lowering: typeof whatsappV2Lowering;
  behaviors: typeof WhatsAppBehavior;
  sounds: Record<string, string>;
} = {
  // === TIER A: Identity ===
  id: WHATSAPP_APP_ID as "app_whatsapp",
  version: "2.0.0",
  displayName: "WhatsApp",
  name: "WhatsApp",

  // === TIER A: Runtime ===
  reducer: whatsappReducer as PluginReducer<"app_whatsapp">,
  views: whatsappViews,
  appView: WhatsappChatView,
  createInitialState: createWhatsAppInitialState,

  // === TIER A: Event Routing ===
  eventKinds: [
    "MessageReceived",
    "MessageSent",
    "TypingStarted",
    "TypingEnded",
    "ImageReceived",
    "ImageSent",
    "VideoReceived",
    "VideoSent",
    "VoiceReceived",
    "VoiceSent",
    "VoicePlayStarted",
    "VoicePlayPaused",
    "GifReceived",
    "GifSent",
    "StickerReceived",
    "StickerSent",
    "DocumentReceived",
    "DocumentSent",
    "ContactReceived",
    "ContactSent",
    "LocationReceived",
    "LocationSent",
    "React",
    "ReactionAdded",
    "ReadMessages",
    "MessageDeleted",
    "MessageEdited",
    "MessageForwarded",
    "DateSeparator",
    "ConversationOpened",
    "NavigateScreen",
    "GroupMemberAdded",
    "GroupMemberRemoved",
    "ConversationPinned",
    "ConversationUnpinned",
    "ConversationMuted",
    "ConversationUnmuted",
    "ConversationArchived",
    "ConversationUnarchived",
    "SetDraft",
  ] as const,

  // === SOUNDS (for SoundRegistry via PluginManager) ===
  sounds: {
    "app_whatsapp.message_in": "plugins/whatsapp/received.wav",
    "app_whatsapp.message_out": "plugins/whatsapp/sent.wav",
    "app_whatsapp.typing_loop": "plugins/whatsapp/typing_loop.wav",
  },

  // === TIER A: Assets ===
  assets: whatsappAssets,
  audioRules: whatsappAudioRules,

  // === TIER B: Lowering ===
  v2Lowering: whatsappV2Lowering,

  // === TIER B: Layouts ===
  layouts: [
    {
      viewKind: "CHAT",
      computeLayout: computeChatLayout,
    } as PluginLayoutStrategy,
  ],

  // === TIER B: Behaviors ===
  behaviors: WhatsAppBehavior,

  // === TIER C: DSL ===
  dsl: whatsappDsl,

  // === Anchors ===
  anchors: WhatsAppAnchors as any,
};

// =============================================================================
// EXPORTS
// =============================================================================

export { WhatsAppPluginV2 as WhatsAppPlugin };

import { WhatsAppAnchors } from "./runtime/adapters/anchors";

let _registered = false;

export function registerWhatsAppPlugin(): void {
  if (_registered) return;
  _registered = true;

  PluginManager.register(WhatsAppPluginV2);
}

export type { WhatsAppDslApi };

export default WhatsAppPluginV2;
