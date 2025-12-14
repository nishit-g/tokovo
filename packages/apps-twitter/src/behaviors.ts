/**
 * Twitter Behaviors
 *
 * Defines how Twitter/X events map to camera intents.
 */

import type { AppBehavior, CameraIntent, ShotPresetId } from "@tokovo/core";

const APP_ID = "app_twitter";

// =============================================================================
// EVENT → INTENT MAPPINGS
// =============================================================================

export const TWITTER_INTENT_MAPPINGS: Record<string, CameraIntent> = {
    // Tweet events
    TWEET_POSTED: { type: "FOCUS", anchor: "focusedTweet", preset: "dramatic" },
    TWEET_RECEIVED: { type: "FOCUS", anchor: "focusedTweet", preset: "message" },

    // Engagement events
    LIKE_ADDED: { type: "FOCUS", anchor: "likeButton", preset: "snap" },
    RETWEET_ADDED: { type: "FOCUS", anchor: "focusedTweet", preset: "snap" },
    REPLY_STARTED: { type: "FOCUS", anchor: "replyBox", preset: "subtle" },
    REPLY_SENT: { type: "FOCUS", anchor: "focusedTweet", preset: "message" },

    // Navigation
    PROFILE_OPENED: { type: "FOCUS", anchor: "profileCard", preset: "subtle" },
    PROFILE_CLOSED: { type: "RESET", preset: "reset" },
};

// =============================================================================
// PRESET OVERRIDES
// =============================================================================

export const TWITTER_PRESET_OVERRIDES: Partial<
    Record<ShotPresetId, Partial<{ scale: number; shake: number }>>
> = {
    // Twitter uses quick snaps for likes
    snap: { scale: 1.12 },
};

// =============================================================================
// APP BEHAVIOR EXPORT
// =============================================================================

export const TwitterBehavior: AppBehavior = {
    appId: APP_ID,
    eventMappings: TWITTER_INTENT_MAPPINGS,
    presetOverrides: TWITTER_PRESET_OVERRIDES,
};

export function getTwitterIntent(eventType: string): CameraIntent | undefined {
    return TWITTER_INTENT_MAPPINGS[eventType];
}
