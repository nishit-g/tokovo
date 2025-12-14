/**
 * Phone App Plugin Definition (Canonical)
 *
 * Self-contained app plugin using the canonical plugin system.
 *
 * @module @tokovo/apps-phone/plugin
 */

import {
    canonical,
    APP_IDS,
    PluginManager,
    definePlugin,
} from "@tokovo/core";
import type {
    AppPlugin,
    PluginSchema,
    TokovoPlugin,
    AppViewComponent,
    WidgetSlot,
} from "@tokovo/core";
import { phoneReducer } from "./runtime";
import { PhoneApp } from "./ui";

// Import widgets
import { PhoneDynamicIsland } from "./widgets/PhoneDynamicIsland";
import { IncomingCallBanner } from "./widgets/IncomingCallBanner";

const { defineAppPlugin } = canonical;

export const PHONE_APP_ID = APP_IDS.PHONE;

// =============================================================================
// SCHEMA
// =============================================================================

const PHONE_SCHEMA = {
    id: "app_phone",
    name: "Phone",
    version: "2.0.0",

    contentKinds: ["system"] as const,

    eventTypes: [
        "INCOMING",
        "ANSWER",
        "DECLINE",
        "END",
        "TOGGLE_MUTE",
        "TOGGLE_SPEAKER",
        "TOGGLE_HOLD",
    ] as const,

    capabilities: ["calls", "notifications"] as const,

    limits: {},

    allowedCustomEvents: [] as string[],
} as const;

// =============================================================================
// WIDGETS
// =============================================================================

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

// =============================================================================
// CANONICAL PLUGIN
// =============================================================================

/**
 * Phone plugin schema (typed for canonical system).
 */
const phonePluginSchema: PluginSchema = {
    contentKinds: ["system"],
    eventTypes: ["NAVIGATE"], // Phone uses CALL events, not APP events
    limits: {},
    allowedCustomEvents: [],
};

/**
 * Phone Plugin (Canonical)
 *
 * Use this plugin with createPluginRegistry():
 * ```ts
 * import { PhonePlugin } from "@tokovo/apps-phone";
 * const plugins = createPluginRegistry();
 * plugins.register(PhonePlugin);
 * ```
 */
export const PhonePluginCanonical: AppPlugin = defineAppPlugin({
    id: PHONE_APP_ID,
    name: "Phone",
    version: "2.0.0",

    capabilities: ["calls", "notifications"],

    schema: phonePluginSchema,

    reducer: phoneReducer as any,
    view: PhoneApp as any,

    icon: "phone-icon.png",
    primaryColor: "#34C759",

    sounds: {
        ringtone: "ringtone.mp3",
        call_end: "call-end.mp3",
        dial_tone: "dial-tone.mp3",
    },

    notificationSound: "ringtone.mp3",
});

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Phone App Plugin Configuration (Legacy)
 * @deprecated Use PhonePluginCanonical with createPluginRegistry() instead.
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
        ringtone: "ringtone.mp3",
        call_end: "call-end.mp3",
        dial_tone: "dial-tone.mp3",
    },

    notificationSound: "ringtone.mp3",

    // Widgets
    widgets: phoneWidgets,
});

/**
 * @deprecated Use PhonePluginCanonical with createPluginRegistry() instead.
 */
export function registerPhonePlugin(): void {
    console.warn(
        "[Phone] registerPhonePlugin() is deprecated. " +
        "Use PhonePluginCanonical with createPluginRegistry() instead."
    );
    PluginManager.register(PhonePlugin);
}
