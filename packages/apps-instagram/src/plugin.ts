/**
 * Instagram Plugin Definition (Canonical)
 *
 * Self-contained app plugin using the canonical plugin system.
 *
 * @module @tokovo/apps-instagram/plugin
 */

import { canonical, ReducerRegistry, PluginManager, definePlugin } from "@tokovo/core";
import type { AppPlugin, PluginSchema, TokovoPlugin, AppViewComponent } from "@tokovo/core";
import { instagramRuntime } from "./runtime";
import { InstagramApp } from "./ui";
import { INSTAGRAM_SCHEMA } from "./schema";
import { initialInstagramState } from "./types";

const { defineAppPlugin } = canonical;

export const INSTAGRAM_APP_ID = "app_instagram";

// =============================================================================
// CANONICAL PLUGIN
// =============================================================================

/**
 * Instagram plugin schema (typed for canonical system).
 */
const instagramPluginSchema: PluginSchema = {
    contentKinds: [...INSTAGRAM_SCHEMA.contentKinds],
    eventTypes: ["MESSAGE", "TYPING", "NAVIGATE", "STORY_ITEM", "STORY_VIEW", "FEED_ITEM", "FEED_ACTION"],
    feedIds: [...INSTAGRAM_SCHEMA.feedIds],
    limits: INSTAGRAM_SCHEMA.limits,
    allowedCustomEvents: [...INSTAGRAM_SCHEMA.allowedCustomEvents],
};

/**
 * Instagram Plugin (Canonical)
 *
 * Use this plugin with createPluginRegistry():
 * ```ts
 * import { InstagramPlugin } from "@tokovo/apps-instagram";
 * const plugins = createPluginRegistry();
 * plugins.register(InstagramPlugin);
 * ```
 */
export const InstagramPlugin: AppPlugin = defineAppPlugin({
    id: INSTAGRAM_APP_ID,
    name: "Instagram",
    version: "2.0.0",

    capabilities: [
        "messaging",
        "typing",
        "voice",
        "video",
        "stickers",
        "stories",
        "feed",
        "navigation",
        "notifications",
    ],

    schema: instagramPluginSchema,

    reducer: instagramRuntime as any,
    view: InstagramApp as any,

    icon: "instagram-icon.png",
    primaryColor: "#E4405F",

    sounds: {
        message_in: "instagram-message.mp3",
        like: "instagram-like.mp3",
        notification: "instagram-notification.mp3",
    },

    notificationSound: "instagram-notification.mp3",
    defaultState: initialInstagramState,
});

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * @deprecated Use InstagramPlugin with createPluginRegistry() instead.
 */
export const InstagramPluginLegacy: TokovoPlugin = definePlugin({
    id: INSTAGRAM_APP_ID,
    name: "Instagram",
    version: "1.0.0",
    icon: "instagram-icon.png",
    primaryColor: "#E4405F",
    appView: InstagramApp as unknown as AppViewComponent,
    reducer: instagramRuntime,
    eventTypes: [...INSTAGRAM_SCHEMA.legacyEventTypes],
    sounds: {
        message_in: "instagram-message.mp3",
        like: "instagram-like.mp3",
    },
    notificationSound: "instagram-notification.mp3",
});

/**
 * @deprecated Use InstagramPlugin with createPluginRegistry() instead.
 */
export function registerInstagramApp(): void {
    console.warn(
        "[Instagram] registerInstagramApp() is deprecated. " +
        "Use InstagramPlugin with createPluginRegistry() instead."
    );
    PluginManager.register(InstagramPluginLegacy);
}
