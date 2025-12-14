/**
 * Phone App Plugin Definition
 * 
 * Self-contained plugin registration for the Phone app.
 * Registers reducer, view, sounds, widgets, and metadata with the PluginManager.
 */

import {
    definePlugin,
    PluginManager,
    APP_IDS,
    TokovoPlugin,
    AppViewComponent,
    WidgetSlot,
} from "@tokovo/core";
import { phoneReducer } from "./runtime";
import { PhoneApp } from "./ui";

// Import widgets
import { PhoneDynamicIsland } from "./widgets/PhoneDynamicIsland";
import { IncomingCallBanner } from "./widgets/IncomingCallBanner";

/**
 * Phone App Widget Slots
 */
const phoneWidgets: WidgetSlot[] = [
    // iOS Dynamic Island - Active Call
    {
        mode: "dynamicIsland",
        platforms: ["ios"],
        priority: 100, // Calls have highest priority
        component: PhoneDynamicIsland,
        expansionModes: ["minimal", "compact", "expanded"],
    },
    // Notification Banner - Incoming Call (overlay mode)
    {
        mode: "notification",
        platforms: ["ios", "android"],
        priority: 100,
        component: IncomingCallBanner,
    },
];

/**
 * Phone App Plugin Configuration
 */
export const PhonePlugin: TokovoPlugin = definePlugin({
    id: APP_IDS.PHONE,
    name: "Phone",
    version: "1.0.0",

    // Branding
    icon: "phone-icon.png",
    primaryColor: "#34C759",

    // Core functionality
    appView: PhoneApp as unknown as AppViewComponent,
    reducer: phoneReducer,

    // Event types this plugin handles
    eventTypes: [
        "INCOMING",
        "ANSWER",
        "DECLINE",
        "END",
        "TOGGLE_MUTE",
        "TOGGLE_SPEAKER",
        "TOGGLE_HOLD",
    ],

    // Sound effects
    sounds: {
        "ringtone": "ringtone.mp3",
        "call_end": "call-end.mp3",
        "dial_tone": "dial-tone.mp3",
    },

    notificationSound: "ringtone.mp3",

    // Widgets
    widgets: phoneWidgets,
});

/**
 * Register the Phone plugin
 */
export function registerPhonePlugin(): void {
    PluginManager.register(PhonePlugin);
}
