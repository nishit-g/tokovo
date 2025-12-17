/**
 * WhatsApp Plugin Definition
 * 
 * Self-contained plugin registration for the WhatsApp app.
 * Registers reducer, view, sounds, and metadata with the PluginManager.
 */

import { definePlugin, PluginManager, APP_IDS, TokovoPlugin, AppViewComponent } from "@tokovo/core";
import { whatsappReducer } from "./logic/reducer";
import { WhatsappChatView } from "./ui";

/**
 * WhatsApp Plugin Configuration
 */
export const WhatsAppPlugin: TokovoPlugin = definePlugin({
    id: APP_IDS.WHATSAPP,
    name: "WhatsApp",
    version: "1.0.0",

    // Branding
    icon: "whatsapp-icon.png",
    primaryColor: "#25D366",

    // Core functionality - cast to match AppViewComponent signature
    appView: WhatsappChatView as unknown as AppViewComponent,
    reducer: whatsappReducer,

    // Event types this plugin handles
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

    // Sound effects
    sounds: {
        "message_in": "whatsapp-received.mp3",
        "message_out": "whatsapp-sent.mp3",
        "typing": "whatsapp-typing.mp3",
    },

    notificationSound: "whatsapp-notification.mp3",
});

/**
 * Register the WhatsApp plugin
 */
export function registerWhatsAppPlugin(): void {
    PluginManager.register(WhatsAppPlugin);
}
