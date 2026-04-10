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
} from "./plugin.js";

// =============================================================================
// TYPES
// =============================================================================

export * from "./types/index.js";

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
} from "./runtime/index.js";
export type { WhatsAppSnapshot, WhatsAppInitialView } from "./bootstrap.js";

// =============================================================================
// VIEWS
// =============================================================================

export * from "./ui/index.js";

// =============================================================================
// IR (Intermediate Representation)
// =============================================================================

export type { WhatsAppPayloads, WhatsAppTrackEvent } from "./ir/index.js";
export { isWhatsAppEvent, isWhatsAppGroupEvent } from "./ir/index.js";

// =============================================================================
// LOWERING
// =============================================================================

export { whatsappLowering, whatsappV2Lowering } from "./lowering/index.js";

// =============================================================================
// DSL
// =============================================================================

export {
  whatsappDsl,
  WhatsAppTrackBuilder,
  WhatsAppPointBuilder,
  WhatsAppSpanBuilder,
  createWhatsAppTrackBuilder,
} from "./dsl/index.js";
export type {
  ReceiveOptions,
  SendOptions,
  ImageOptions,
  TypingOptions,
} from "./dsl/index.js";
export { GroupBuilder } from "./dsl/index.js";
export type { GroupBuilderOptions } from "./dsl/index.js";

// =============================================================================
// LAYOUT
// =============================================================================

export { computeChatLayout } from "./layout/chat.js";

// =============================================================================
// CAMERA
// =============================================================================

export { WhatsAppBehavior } from "./camera/index.js";

// =============================================================================
// ASSETS
// =============================================================================

export { whatsappAudioRules } from "./assets/audio-rules.js";

// =============================================================================
// LEGACY ALIASES
// =============================================================================

export { WhatsAppPluginV2 as WhatsApp } from "./plugin.js";

// =============================================================================
// DEFAULT
// =============================================================================

export { default } from "./plugin.js";
