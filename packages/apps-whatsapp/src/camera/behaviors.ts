/**
 * WhatsApp Behaviors
 *
 * Defines how WhatsApp events map to camera intents.
 * Apps reference global presets by name, with optional delta overrides.
 */

import type { AppBehavior, CameraIntent } from "@tokovo/core";

const APP_ID = "app_whatsapp";

// =============================================================================
// EVENT → INTENT MAPPINGS
// =============================================================================

/**
 * WhatsApp event to camera intent mappings.
 *
 * Each event produces a camera intent:
 * - FOCUS: zoom to specific anchor
 * - RESET: return to neutral
 * - HOLD: maintain current position
 */
export const WHATSAPP_INTENT_MAPPINGS: Record<string, CameraIntent> = {
  // Message events
  MESSAGE_RECEIVED: {
    type: "FOCUS",
    anchor: "lastMessage",
    preset: "dramatic",
  },
  MESSAGE_SENT: { type: "FOCUS", anchor: "lastMessage", preset: "message" },

  // Typing events (use stable inputArea, not volatile typingIndicator)
  TYPING_START: { type: "FOCUS", anchor: "inputArea", preset: "subtle" },
  TYPING_END: { type: "RESET", preset: "reset" },

  // Reaction events
  REACTION_ADDED: { type: "FOCUS", anchor: "lastMessage", preset: "snap" },
  REACTION_REMOVED: { type: "HOLD" },

  // Read receipts
  MESSAGE_READ: { type: "FOCUS", anchor: "lastMessage", preset: "subtle" },
  MESSAGE_DELIVERED: { type: "HOLD" },

  // Media events
  IMAGE_SENT: { type: "FOCUS", anchor: "lastMessage", preset: "dramatic" },
  IMAGE_RECEIVED: { type: "FOCUS", anchor: "lastMessage", preset: "dramatic" },
  VOICE_NOTE_SENT: { type: "FOCUS", anchor: "lastMessage", preset: "message" },
  VOICE_NOTE_RECEIVED: {
    type: "FOCUS",
    anchor: "lastMessage",
    preset: "dramatic",
  },
};

// =============================================================================
// PRESET OVERRIDES (Deltas only)
// =============================================================================

/**
 * Optional preset overrides for WhatsApp.
 * Only delta values — not new presets.
 *
 * Example: WhatsApp wants slightly more zoom on snaps.
 */
export const WHATSAPP_PRESET_OVERRIDES: Partial<
  Record<string, Partial<{ scale: number; shake: number }>>
> = {
  // WhatsApp uses slightly less dramatic zoom on messages
  dramatic: { scale: 1.25 }, // Global is 1.3

  // Snaps for reactions are a bit snappier
  snap: { scale: 1.18 }, // Global is 1.15
};

// =============================================================================
// APP BEHAVIOR EXPORT
// =============================================================================

export const WhatsAppBehavior: AppBehavior = {
  appId: APP_ID,
  eventMappings: WHATSAPP_INTENT_MAPPINGS,
  presetOverrides: WHATSAPP_PRESET_OVERRIDES,
};

/**
 * Get camera intent for a WhatsApp event.
 *
 * @param eventType - Event type (e.g., MESSAGE_RECEIVED)
 * @returns Camera intent or undefined if no mapping
 */
export function getWhatsAppIntent(eventType: string): CameraIntent | undefined {
  return WHATSAPP_INTENT_MAPPINGS[eventType];
}
