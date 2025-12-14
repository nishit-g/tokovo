/**
 * Twitter/X Plugin Definition (Canonical)
 *
 * Self-contained app plugin using the canonical plugin system.
 *
 * @module @tokovo/apps-twitter/plugin
 */

import { canonical, APP_IDS, ReducerRegistry, PluginManager, definePlugin } from "@tokovo/core";
import type { AppPlugin, PluginSchema, TokovoPlugin, AppViewComponent } from "@tokovo/core";
import { twitterReducer, TWITTER_APP_ID } from "./runtime";
import { TwitterUI } from "./ui";
import { TWITTER_SCHEMA } from "./schema";

const { defineAppPlugin } = canonical;

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialTwitterState = {
    screen: "timeline" as const,
    activeTab: "for-you" as const,
    tweets: [],
};

// =============================================================================
// CANONICAL PLUGIN
// =============================================================================

/**
 * Twitter plugin schema (typed for canonical system).
 */
const twitterPluginSchema: PluginSchema = {
    contentKinds: [...TWITTER_SCHEMA.contentKinds],
    eventTypes: ["MESSAGE", "NAVIGATE", "FEED_ITEM", "FEED_SCROLL", "FEED_ACTION", "COMMENT"],
    feedIds: [...TWITTER_SCHEMA.feedIds],
    limits: TWITTER_SCHEMA.limits,
    allowedCustomEvents: [...TWITTER_SCHEMA.allowedCustomEvents],
};

/**
 * Twitter Plugin (Canonical)
 *
 * Use this plugin with createPluginRegistry():
 * ```ts
 * import { TwitterPlugin } from "@tokovo/apps-twitter";
 * const plugins = createPluginRegistry();
 * plugins.register(TwitterPlugin);
 * ```
 */
export const TwitterPlugin: AppPlugin = defineAppPlugin({
    id: TWITTER_APP_ID,
    name: "X (Twitter)",
    version: "2.0.0",

    capabilities: [
        "messaging",
        "feed",
        "navigation",
        "notifications",
    ],

    schema: twitterPluginSchema,

    reducer: twitterReducer as any,
    view: TwitterUI as any,

    icon: "twitter-icon.png",
    primaryColor: "#1DA1F2",

    sounds: {
        tweet_posted: "twitter-tweet.mp3",
        like: "twitter-like.mp3",
        notification: "twitter-notification.mp3",
    },

    notificationSound: "twitter-notification.mp3",
    defaultState: initialTwitterState,
});

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * @deprecated Use TwitterPlugin with createPluginRegistry() instead.
 */
export const TwitterPluginLegacy: TokovoPlugin = definePlugin({
    id: TWITTER_APP_ID,
    name: "X (Twitter)",
    version: "1.0.0",
    icon: "twitter-icon.png",
    primaryColor: "#1DA1F2",
    appView: TwitterUI as unknown as AppViewComponent,
    reducer: twitterReducer,
    eventTypes: [...TWITTER_SCHEMA.legacyEventTypes],
    sounds: {
        tweet_posted: "twitter-tweet.mp3",
        like: "twitter-like.mp3",
    },
    notificationSound: "twitter-notification.mp3",
});

/**
 * @deprecated Use TwitterPlugin with createPluginRegistry() instead.
 */
export function registerTwitterApp(): void {
    console.warn(
        "[Twitter] registerTwitterApp() is deprecated. " +
        "Use TwitterPlugin with createPluginRegistry() instead."
    );
    PluginManager.register(TwitterPluginLegacy);
    console.log(`[Tokovo] Twitter app registered: ${TWITTER_APP_ID}`);
}

// Auto-register on import (legacy compatibility)
registerTwitterApp();

export { TWITTER_APP_ID };
