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
export { GroupBuilder } from "./dsl";
export type { GroupBuilderOptions } from "./dsl";

// =============================================================================
// LAYOUT
// =============================================================================

export { computeChatLayout } from "./layout/chat";

// =============================================================================
// CAMERA
// =============================================================================

export { WhatsAppBehavior } from "./camera";

// =============================================================================
// ASSETS
// =============================================================================

export { whatsappAudioRules } from "./assets/audio-rules";

// =============================================================================
// LEGACY ALIASES
// =============================================================================

export { WhatsAppPluginV2 as WhatsApp } from "./plugin";

// =============================================================================
// DEFAULT
// =============================================================================

export { default } from "./plugin";
