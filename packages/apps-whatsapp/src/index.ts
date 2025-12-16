import { APP_IDS, definePlugin } from "@tokovo/core";
import { whatsappReducer } from "./logic/reducer";
import { ui } from "./ui";
import { WhatsAppAnchors } from "./adapters/anchors";
import { WhatsAppMetadata } from "./assets/metadata";
import "./assets/sounds"; // Register sounds
import { WhatsAppNotificationAdapter } from "./adapters/notifications";

// Export Internal Parts (Enterprise Standard)
export * from "./logic/reducer";
export * from "./ui";
export * from "./types";
export * from "./adapters/anchors";
export * from "./adapters/notifications";
export * from "./layout";

// Define Plugin
export const WhatsAppPlugin = definePlugin({
    id: APP_IDS.WHATSAPP,
    name: "WhatsApp",
    version: "2.0.0", // Bumped for Enterprise Refactor

    // Metadata
    metadata: WhatsAppMetadata,

    // UI & Logic
    appView: ui.WhatsappChatView,
    reducer: whatsappReducer,

    // Adapters (Enterprise Standard)
    anchors: WhatsAppAnchors.framing,
    getAnchors: WhatsAppAnchors.getAnchors,
    notificationAdapter: WhatsAppNotificationAdapter,

    // Events (Standard IR events + Custom)
    // Core events like MESSAGE_RECEIVED are handled, but we declare custom ones if any.
    // Currently WhatsApp uses mostly standard events.
    eventTypes: [
        "GROUP_MEMBER_ADDED",
        "GROUP_MEMBER_REMOVED",
        "VOICE_MESSAGE_RECEIVED" // Should be standard or namespaced?
        // Note: VOICE_MESSAGE_RECEIVED might fail namespacing if not in CORE_EVENTS.
        // It likely should be `whatsapp.VOICE_MESSAGE_RECEIVED`.
    ]
});

export const WhatsApp = WhatsAppPlugin;

export default WhatsAppPlugin;
