/**
 * WhatsApp App Definition
 * 
 * Unified Plugin Export
 */

import { definePlugin, APP_IDS } from "@tokovo/core";
import { whatsappReducer } from "./runtime";
import { WhatsappChatView } from "./ui";
import { WHATSAPP_FRAMING } from "./provider";
import { WhatsAppMetadata } from "./metadata";
import { whatsappAdapter } from "./notification-adapter";

// Export Components & Types for direct usage if needed
export * from "./types";
export * from "./runtime";
export * from "./components";
export * from "./ui";
export * from "./config";
export * from "./camera";
export * from "./behaviors";
export * from "./layout";

// Define the Unified Plugin
export const WhatsApp = definePlugin({
    id: APP_IDS.WHATSAPP,
    name: "WhatsApp",
    version: "2.0.0",

    // 1. Metadata (Icon, Name, Color)
    metadata: WhatsAppMetadata,

    // 2. Routing / Views
    // We use the existing Wrapper View which handles internal routing for now.
    // In V3 we can expose `screens` directly.
    appView: WhatsappChatView as any,

    // 3. Logic (Reducer)
    reducer: whatsappReducer,

    // 4. Notifications
    notificationAdapter: whatsappAdapter,

    // 5. Camera Framing (Anchors)
    anchors: WHATSAPP_FRAMING,

    // 6. Assets (Sounds)
    sounds: {
        "whatsapp_sent": "whatsapp-sent.mp3",
        "whatsapp_received": "whatsapp-received.mp3",
        "whatsapp_typing": "typing.mp3",
    },

    // 7. Event Types
    eventTypes: [
        "MESSAGE_RECEIVED", "MESSAGE_SENT",
        "TYPING_START", "TYPING_END",
        "MESSAGE_READ", "VOICE_MESSAGE_RECEIVED"
    ]
});

// Default Export
export default WhatsApp;
