/**
 * WhatsApp Package - Public API
 *
 * This is the main entry point for the WhatsApp plugin.
 * All exports follow the Enterprise Gold Standard structure.
 */

// =============================================================================
// PLUGIN (Primary Export)
// =============================================================================

export {
  WhatsAppPluginV2,
  WhatsAppPluginV2 as WhatsAppPlugin,
  registerWhatsAppPlugin,
  type WhatsAppDslApi,
} from "./plugin";

// =============================================================================
// TYPES
// =============================================================================

export * from "./types";

// =============================================================================
// RUNTIME
// =============================================================================

export {
  whatsappReducer,
  createWhatsAppInitialState,
  selectAppState,
  selectConversations,
  selectCurrentConversation,
  selectMessages,
  selectLastMessage,
  selectTypingMembers,
} from "./runtime";

// =============================================================================
// VIEWS
// =============================================================================

export * from "./ui";
// Note: ./views re-exports from ./ui, so we don't export it again

// =============================================================================
// IR (Intermediate Representation)
// =============================================================================

export type { WhatsAppPayloads, WhatsAppTrackEvent } from "./ir";
export { isWhatsAppEvent, isWhatsAppGroupEvent } from "./ir";

// =============================================================================
// LOWERING
// =============================================================================

export { whatsappLowering, whatsappV2Lowering } from "./lowering";

// =============================================================================
// DSL
// =============================================================================

export {
  whatsappDsl,
  WhatsAppTrackBuilder,
  WhatsAppPointBuilder,
  WhatsAppSpanBuilder,
  createWhatsAppTrackBuilder,
} from "./dsl";
export type {
  ReceiveOptions,
  SendOptions,
  ImageOptions,
  TypingOptions,
} from "./dsl";

// =============================================================================
// LAYOUT
// =============================================================================

export { computeChatLayout } from "./layout";

// =============================================================================
// CAMERA
// =============================================================================

export {
  WhatsAppDirector,
  createWhatsAppDirector,
  WhatsAppBehavior,
} from "./camera";

// =============================================================================
// ASSETS
// =============================================================================

export { whatsappAudioRules } from "./assets/audio-rules";

// =============================================================================
// SIDE EFFECTS (Auto-registration)
// =============================================================================

import "./ui/strategies";
import {
  AutoSoundRegistry,
  AppMetadataRegistry,
  SoundRegistry,
  registerAnchorProvider,
  LayoutRegistry,
  APP_IDS,
} from "@tokovo/core";
import { whatsappAudioRules } from "./assets/audio-rules";
import { WhatsAppAnchors } from "./runtime/adapters/anchors";
import { computeChatLayout } from "./layout";

// WhatsApp sound paths
const whatsappSounds = {
  "app_whatsapp.message_in": "plugins/whatsapp/received.wav",
  "app_whatsapp.message_out": "plugins/whatsapp/sent.wav",
  "app_whatsapp.typing_loop": "plugins/whatsapp/typing_loop.wav",
};

AutoSoundRegistry.register(whatsappAudioRules);
SoundRegistry.registerMany(whatsappSounds);

// Register anchor provider for camera system
registerAnchorProvider(WhatsAppAnchors);

// Register layout strategy for CHAT view (produces ChatLayoutState with semantic.regions)
LayoutRegistry.register({
  appId: APP_IDS.WHATSAPP,
  viewKind: "CHAT",
  computeLayout: computeChatLayout,
});

AppMetadataRegistry.register("app_whatsapp", {
  displayName: "WhatsApp",
  themeColor: "#25D366",
  icon: "💬",
  viewStrategy: "CHAT",
});

// =============================================================================
// LEGACY ALIASES
// =============================================================================

export { WhatsAppPluginV2 as WhatsApp } from "./plugin";

// =============================================================================
// DEFAULT
// =============================================================================

export { default } from "./plugin";
