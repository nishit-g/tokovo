/**
 * Notification Audio Rules
 * 
 * Auto-sound rules for notification events.
 */

// =============================================================================
// AUDIO RULES
// =============================================================================

export interface NotificationAutoSoundRule {
    match: {
        kind: string;
        type?: string;
    };
    action: "PLAY_ONE_SHOT" | "START_LOOP" | "STOP_SOUND";
    sound: string;
    bus?: string;
    volume?: number;
}

export const notificationAudioRules: NotificationAutoSoundRule[] = [
    // =========================================================================
    // SHOW NOTIFICATION
    // =========================================================================
    {
        match: { kind: "DEVICE", type: "SHOW_NOTIFICATION" },
        action: "PLAY_ONE_SHOT",
        sound: "device.notification",
        bus: "ui",
        volume: 0.8,
    },
    {
        match: { kind: "DEVICE", type: "NOTIFICATION_SHOW" },
        action: "PLAY_ONE_SHOT",
        sound: "device.notification",
        bus: "ui",
        volume: 0.8,
    },

    // =========================================================================
    // TAP NOTIFICATION
    // =========================================================================
    {
        match: { kind: "DEVICE", type: "TAP_NOTIFICATION" },
        action: "PLAY_ONE_SHOT",
        sound: "ui.tap",
        bus: "ui",
        volume: 0.5,
    },

    // =========================================================================
    // SWIPE NOTIFICATION
    // =========================================================================
    {
        match: { kind: "DEVICE", type: "SWIPE_NOTIFICATION" },
        action: "PLAY_ONE_SHOT",
        sound: "ui.swipe",
        bus: "ui",
        volume: 0.4,
    },

    // =========================================================================
    // CLEAR ALL
    // =========================================================================
    {
        match: { kind: "DEVICE", type: "CLEAR_ALL_NOTIFICATIONS" },
        action: "PLAY_ONE_SHOT",
        sound: "ui.clear",
        bus: "ui",
        volume: 0.6,
    },
];

// =============================================================================
// DEFAULT SOUNDS
// =============================================================================

/**
 * Default sounds to register if device doesn't provide them
 */
export const defaultNotificationSounds: Record<string, string> = {
    "device.notification": "notifications/default.wav",
    "ui.tap": "ui/tap.wav",
    "ui.swipe": "ui/swipe.wav",
    "ui.clear": "ui/clear.wav",
};
