/**
 * Keyboard Camera Behaviors
 * 
 * Defines how keyboard events map to camera intents.
 */

import type { AppBehavior, CameraIntent, ShotPresetId } from "@tokovo/core";

const APP_ID = "device_keyboard";

// =============================================================================
// EVENT → INTENT MAPPINGS
// =============================================================================

/**
 * Keyboard event to camera intent mappings.
 * 
 * Each event can produce a camera intent:
 * - FOCUS: zoom to specific anchor
 * - RESET: return to neutral
 * - HOLD: maintain current position
 */
export const KEYBOARD_INTENT_MAPPINGS: Record<string, CameraIntent> = {
    // Visibility events
    KEYBOARD_SHOW: { type: "FOCUS", anchor: "keyboard", preset: "reveal" },
    KEYBOARD_HIDE: { type: "RESET", preset: "reset" },

    // Typing events - focus on input field, not individual keys
    KEYBOARD_TYPE: { type: "FOCUS", anchor: "inputField", preset: "subtle" },
    KEYBOARD_KEY_DOWN: { type: "HOLD" }, // Don't jitter on each key
    KEYBOARD_KEY_UP: { type: "HOLD" },

    // Layout switch
    KEYBOARD_SWITCH_LAYOUT: { type: "HOLD" },

    // Autocomplete
    KEYBOARD_ACCEPT_SUGGESTION: { type: "FOCUS", anchor: "predictionBar", preset: "snap" },
};

// =============================================================================
// PRESET OVERRIDES
// =============================================================================

/**
 * Optional preset overrides for keyboard.
 * Deltas from global presets.
 */
export const KEYBOARD_PRESET_OVERRIDES: Partial<
    Record<ShotPresetId, Partial<{ scale: number; shake: number }>>
> = {
    // Reveal keyboard with slight zoom
    reveal: { scale: 1.1 },

    // Subtle focus on input field
    subtle: { scale: 1.05 },

    // Snap to autocomplete suggestion
    snap: { scale: 1.08 },
};

// =============================================================================
// APP BEHAVIOR EXPORT
// =============================================================================

export const KeyboardBehavior: AppBehavior = {
    appId: APP_ID,
    eventMappings: KEYBOARD_INTENT_MAPPINGS,
    presetOverrides: KEYBOARD_PRESET_OVERRIDES,
};

/**
 * Get camera intent for a keyboard event.
 */
export function getKeyboardIntent(eventType: string): CameraIntent | undefined {
    return KEYBOARD_INTENT_MAPPINGS[eventType];
}
