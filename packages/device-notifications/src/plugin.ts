/**
 * Notification Plugin
 * 
 * Plugin contract and registration for device notifications.
 */

import { notificationAudioRules, defaultNotificationSounds } from "./assets/audio-rules";

// =============================================================================
// PLUGIN CONTRACT
// =============================================================================

export const NotificationPlugin = {
    id: "device_notifications",
    version: "1.0.0",
    name: "Device Notifications",

    metadata: {
        name: "Device Notifications",
        icon: "🔔",
        themeColor: "#FF3B30",
    },

    eventTypes: [
        "NOTIFICATION_SHOW",
        "NOTIFICATION_DISMISS",
        "NOTIFICATION_TAP",
        "NOTIFICATION_SWIPE",
        "NOTIFICATION_DYNAMIC_ISLAND",
        "NOTIFICATION_OPEN_PANEL",
        "NOTIFICATION_CLOSE_PANEL",
        "NOTIFICATION_CLEAR_ALL",
        "NOTIFICATION_REPLY",
    ],

    sounds: defaultNotificationSounds,
};

// =============================================================================
// REGISTRATION
// =============================================================================

let registered = false;

/**
 * Register the notification plugin with core registries
 */
export function registerNotificationPlugin(): void {
    if (registered) return;
    registered = true;

    // Dynamic import to avoid circular deps
    import("@tokovo/core").then(({
        ReducerRegistry,
        AutoSoundRegistry,
        SoundRegistry
    }) => {
        // Register reducer for notification events
        // Note: Core already has notification handling in engine
        // We just need to register audio rules and sounds

        // Register audio rules
        AutoSoundRegistry.register(notificationAudioRules as any);
        console.log("[NotificationPlugin] Registered audio rules");

        // Register default sounds (device can override)
        SoundRegistry.registerMany(defaultNotificationSounds);
        console.log("[NotificationPlugin] Registered default sounds");

    }).catch(err => {
        console.warn("[NotificationPlugin] Failed to register with core:", err);
    });
}
