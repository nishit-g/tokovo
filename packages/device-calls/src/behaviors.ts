/**
 * Phone Behaviors
 *
 * Defines how Phone/Call events map to camera intents.
 */

import type { AppBehavior, CameraIntent, ShotPresetId } from "@tokovo/core";

const APP_ID = "app_phone";

// =============================================================================
// EVENT → INTENT MAPPINGS
// =============================================================================

export const PHONE_INTENT_MAPPINGS: Record<string, CameraIntent> = {
    // Call incoming
    INCOMING_CALL: { type: "FOCUS", anchor: "callPoster", preset: "dramatic" },

    // Call answered
    CALL_ANSWERED: { type: "FOCUS", anchor: "callPoster", preset: "subtle" },

    // Call declined
    CALL_DECLINED: { type: "RESET", preset: "reset" },

    // Call ended
    CALL_ENDED: { type: "RESET", preset: "reset" },

    // Button interactions
    MUTE_TOGGLED: { type: "HOLD" },
    SPEAKER_TOGGLED: { type: "HOLD" },
    HOLD_TOGGLED: { type: "HOLD" },
};

// =============================================================================
// PRESET OVERRIDES
// =============================================================================

export const PHONE_PRESET_OVERRIDES: Partial<
    Record<ShotPresetId, Partial<{ scale: number; shake: number }>>
> = {
    // Phone uses more dramatic effects for incoming calls
    dramatic: { scale: 1.35, shake: 5 },
};

// =============================================================================
// APP BEHAVIOR EXPORT
// =============================================================================

export const PhoneBehavior: AppBehavior = {
    appId: APP_ID,
    eventMappings: PHONE_INTENT_MAPPINGS,
    presetOverrides: PHONE_PRESET_OVERRIDES,
};

export function getPhoneIntent(eventType: string): CameraIntent | undefined {
    return PHONE_INTENT_MAPPINGS[eventType];
}
