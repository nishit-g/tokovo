/**
 * Notification Reducer
 * 
 * State management for device notifications.
 */

import type { NotificationInstance, NotificationIR, DynamicIslandState } from "./types";

// =============================================================================
// TYPES
// =============================================================================

interface DeviceState {
    notifications: NotificationInstance[];
    notificationCenter?: {
        open: boolean;
        groups: any[];
    };
    dynamicIsland?: DynamicIslandState;
    foregroundAppId?: string;
}

interface WorldState {
    devices: Record<string, DeviceState>;
}

// =============================================================================
// REDUCER
// =============================================================================

/**
 * Handle notification events and update device state
 */
export function notificationReducer(
    draft: WorldState,
    event: any
): void {
    const device = draft.devices[event.deviceId];
    if (!device) return;

    // Initialize notifications array if needed
    device.notifications ??= [];

    switch (event.type) {
        // =====================================================================
        // SHOW NOTIFICATION
        // =====================================================================
        case "SHOW_NOTIFICATION":
        case "NOTIFICATION_SHOW": {
            const id = event.id || `notif_${event.at}_${Math.random().toString(36).slice(2, 8)}`;

            const instance: NotificationInstance = {
                id,
                ir: {
                    id,
                    appId: event.appId,
                    title: event.title,
                    body: event.body,
                    mode: event.mode,
                    priority: event.priority,
                    icon: event.icon,
                    preview: event.preview,
                    actions: event.actions,
                    groupKey: event.groupKey,
                    threadId: event.threadId,
                    replyable: event.replyable,
                    metadata: event.metadata,
                },
                deviceId: event.deviceId,
                shownAtFrame: event.at,
                mode: event.mode || "headsup",
                animationState: "entering",
            };

            device.notifications.push(instance);
            break;
        }

        // =====================================================================
        // DISMISS NOTIFICATION
        // =====================================================================
        case "DISMISS_NOTIFICATION":
        case "NOTIFICATION_DISMISS": {
            if (event.all) {
                // Clear all
                device.notifications = [];
            } else if (event.groupKey) {
                // Dismiss by group
                device.notifications = device.notifications.filter(
                    n => n.ir.groupKey !== event.groupKey
                );
            } else if (event.id) {
                // Dismiss single
                const notif = device.notifications.find(n => n.id === event.id);
                if (notif) {
                    notif.dismissedAt = event.at;
                    notif.animationState = "exiting";
                }
            }
            break;
        }

        // =====================================================================
        // TAP NOTIFICATION
        // =====================================================================
        case "TAP_NOTIFICATION":
        case "NOTIFICATION_TAP": {
            const notif = device.notifications.find(n => n.id === event.id);
            if (notif) {
                notif.tapped = true;
                notif.dismissedAt = event.at;
                notif.animationState = "dismissed";

                // Open the app
                device.foregroundAppId = notif.ir.appId;
            }
            break;
        }

        // =====================================================================
        // SWIPE NOTIFICATION
        // =====================================================================
        case "SWIPE_NOTIFICATION":
        case "NOTIFICATION_SWIPE": {
            const notif = device.notifications.find(n => n.id === event.id);
            if (notif && event.action === "dismiss") {
                notif.dismissedAt = event.at;
                notif.animationState = "exiting";
            }
            break;
        }

        // =====================================================================
        // DYNAMIC ISLAND
        // =====================================================================
        case "SET_DYNAMIC_ISLAND":
        case "NOTIFICATION_DYNAMIC_ISLAND": {
            device.dynamicIsland = {
                mode: event.mode || "idle",
                appId: event.appId,
                content: event.content,
            };
            break;
        }

        // =====================================================================
        // NOTIFICATION PANEL
        // =====================================================================
        case "TOGGLE_NOTIFICATION_PANEL": {
            device.notificationCenter ??= { open: false, groups: [] };
            device.notificationCenter.open = event.open ?? !device.notificationCenter.open;
            break;
        }

        // =====================================================================
        // CLEAR ALL
        // =====================================================================
        case "CLEAR_ALL_NOTIFICATIONS":
        case "NOTIFICATION_CLEAR_ALL": {
            device.notifications = [];
            break;
        }

        // =====================================================================
        // REPLY
        // =====================================================================
        case "REPLY_NOTIFICATION":
        case "NOTIFICATION_REPLY": {
            const notif = device.notifications.find(n => n.id === event.id);
            if (notif) {
                notif.dismissedAt = event.at;
                // The reply text could be passed to an app event handler
            }
            break;
        }
    }

    // Clean up dismissed notifications after animation window (30 frames)
    const cleanupThreshold = event.at - 30;
    device.notifications = device.notifications.filter(
        n => !n.dismissedAt || n.dismissedAt > cleanupThreshold
    );
}

// =============================================================================
// REDUCER REGISTRATION
// =============================================================================

/**
 * Event types handled by this reducer
 */
export const NOTIFICATION_EVENT_TYPES = [
    "SHOW_NOTIFICATION",
    "NOTIFICATION_SHOW",
    "DISMISS_NOTIFICATION",
    "NOTIFICATION_DISMISS",
    "TAP_NOTIFICATION",
    "NOTIFICATION_TAP",
    "SWIPE_NOTIFICATION",
    "NOTIFICATION_SWIPE",
    "SET_DYNAMIC_ISLAND",
    "NOTIFICATION_DYNAMIC_ISLAND",
    "TOGGLE_NOTIFICATION_PANEL",
    "CLEAR_ALL_NOTIFICATIONS",
    "NOTIFICATION_CLEAR_ALL",
    "REPLY_NOTIFICATION",
    "NOTIFICATION_REPLY",
];
