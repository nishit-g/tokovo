/**
 * WhatsApp Plugin Definition (Canonical)
 *
 * Self-contained app plugin using the canonical plugin system.
 * No singleton registration - exports the plugin for explicit composition.
 *
 * @module @tokovo/apps-whatsapp/plugin
 */

import { canonical, APP_IDS } from "@tokovo/core";
import type { AppPlugin, PluginSchema } from "@tokovo/core";
import { whatsappReducer } from "./runtime";
import { WhatsappChatView } from "./ui";
import { WHATSAPP_SCHEMA } from "./schema";

const { defineAppPlugin } = canonical;

/**
 * WhatsApp plugin schema (typed for canonical system).
 */
const whatsappPluginSchema: PluginSchema = {
    contentKinds: [...WHATSAPP_SCHEMA.contentKinds],
    eventTypes: ["MESSAGE", "TYPING", "READ", "REACTION", "NAVIGATE"],
    // Note: systemTypes omitted - WhatsApp schema uses app-specific types
    // that extend the canonical set. Cast if needed for validation.
    limits: WHATSAPP_SCHEMA.limits,
    allowedCustomEvents: [...WHATSAPP_SCHEMA.allowedCustomEvents],
};

/**
 * WhatsApp Plugin (Canonical)
 *
 * Use this plugin with createPluginRegistry():
 * ```ts
 * import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";
 * const plugins = createPluginRegistry();
 * plugins.register(WhatsAppPlugin);
 * ```
 */
export const WhatsAppPlugin: AppPlugin = defineAppPlugin({
    id: APP_IDS.WHATSAPP,
    name: "WhatsApp",
    version: "2.0.0",

    // Capabilities
    capabilities: [
        "messaging",
        "typing",
        "read_receipts",
        "reactions",
        "voice",
        "video",
        "stickers",
        "location",
        "contacts",
        "groups",
        "calls",
        "navigation",
        "notifications",
    ],

    schema: whatsappPluginSchema,

    // Core functionality
    reducer: whatsappReducer as any, // Legacy reducer signature differs slightly
    view: WhatsappChatView as any, // Legacy view props differ slightly

    // Branding
    icon: "whatsapp-icon.png",
    primaryColor: "#25D366",

    // Sound effects
    sounds: {
        message_in: "whatsapp-received.mp3",
        message_out: "whatsapp-sent.mp3",
        typing: "whatsapp-typing.mp3",
    },

    notificationSound: "whatsapp-notification.mp3",
});

// =============================================================================
// LEGACY COMPATIBILITY (to be removed)
// =============================================================================

import { PluginManager, TokovoPlugin, definePlugin, AppViewComponent } from "@tokovo/core";

/**
 * @deprecated Use WhatsAppPlugin with createPluginRegistry() instead.
 * Legacy plugin definition for backward compatibility.
 */
export const WhatsAppPluginLegacy: TokovoPlugin = definePlugin({
    id: APP_IDS.WHATSAPP,
    name: "WhatsApp",
    version: "1.0.0",
    icon: "whatsapp-icon.png",
    primaryColor: "#25D366",
    appView: WhatsappChatView as unknown as AppViewComponent,
    reducer: whatsappReducer,
    eventTypes: [
        "MESSAGE_RECEIVED",
        "MESSAGE_SENT",
        "TYPING_START",
        "TYPING_END",
        "MESSAGE_READ",
        "VOICE_MESSAGE_RECEIVED",
        "VOICE_MESSAGE_PLAY",
        "GROUP_MEMBER_ADDED",
        "GROUP_MEMBER_REMOVED",
    ],
    sounds: {
        message_in: "whatsapp-received.mp3",
        message_out: "whatsapp-sent.mp3",
        typing: "whatsapp-typing.mp3",
    },
    notificationSound: "whatsapp-notification.mp3",
});

/**
 * @deprecated Use WhatsAppPlugin with createPluginRegistry() instead.
 * Legacy function for backward compatibility.
 */
export function registerWhatsAppPlugin(): void {
    console.warn(
        "[WhatsApp] registerWhatsAppPlugin() is deprecated. " +
        "Use WhatsAppPlugin with createPluginRegistry() instead."
    );
    PluginManager.register(WhatsAppPluginLegacy);
}
