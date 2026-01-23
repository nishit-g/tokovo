/**
 * Notification Plugin
 *
 * Plugin contract and registration for device notifications.
 */

import {
  notificationAudioRules,
  defaultNotificationSounds,
} from "./assets/audio-rules";
import { notificationReducer, NOTIFICATION_EVENT_TYPES } from "./reducer";

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

  eventTypes: NOTIFICATION_EVENT_TYPES,

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
  import("@tokovo/core")
    .then(({ ReducerRegistry, AutoSoundRegistry, SoundRegistry }) => {
      // ★ CRITICAL: Register the reducer for each notification event type
      // Feature reducers are keyed by their event type prefix
      NOTIFICATION_EVENT_TYPES.forEach((eventType) => {
        ReducerRegistry.registerFeatureReducer(eventType, notificationReducer);
      });
      console.log(
        "[NotificationPlugin] Registered reducer for",
        NOTIFICATION_EVENT_TYPES.length,
        "event types",
      );

      // Register audio rules
      AutoSoundRegistry.register(notificationAudioRules);
      console.log("[NotificationPlugin] Registered audio rules");

      // Register default sounds (device can override)
      SoundRegistry.registerMany(defaultNotificationSounds);
      console.log("[NotificationPlugin] Registered default sounds");
    })
    .catch((err) => {
      console.warn("[NotificationPlugin] Failed to register with core:", err);
    });
}
