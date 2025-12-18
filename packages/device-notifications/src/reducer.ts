/**
 * Notification Reducer
 * 
 * State management for device notifications.
 * 
 * NOTE: Uses WorldState and DeviceState from @tokovo/core.
 * Creates flat NotificationInstance per NOTI_ARCH_2.md canonical shape.
 */

import type { WorldState, DeviceState } from "@tokovo/core";
import type { NotificationInstance, DynamicIslandState } from "./types";

// =============================================================================
// HELPER: Type-safe access to notification items
// =============================================================================

/**
 * Get notification items from device with proper typing.
 * Core's NotificationCenterState.items is Notification[] but we use NotificationInstance[].
 * This helper encapsulates the type cast to reduce scattered (device as any) casts.
 */
function getItems(device: DeviceState): NotificationInstance[] {
    return (device.notificationCenter?.items || []) as NotificationInstance[];
}

/**
 * Set notification items on device.
 */
function setItems(device: DeviceState, items: NotificationInstance[]): void {
    if (!device.notificationCenter) {
        device.notificationCenter = {
            items: [],
            headsUp: null,
            headsUpQueue: [],
            groups: [],
        };
    }
    device.notificationCenter.items = items as any;
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

    // Initialize using setItems helper if needed
    if (!device.notificationCenter?.items) {
        setItems(device, []);
    }

    switch (event.type) {
        // =====================================================================
        // SHOW NOTIFICATION
        // =====================================================================
        case "SHOW_NOTIFICATION":
        case "NOTIFICATION_SHOW": {
            const id = event.id || `notif_${event.at}_${Math.random().toString(36).slice(2, 8)}`;

            // ★ CANONICAL FLAT SHAPE - No ir nesting
            const instance: NotificationInstance = {
                // Identity
                id,
                deviceId: event.deviceId,
                appId: event.appId,

                // Content (flat, not nested in ir)
                title: event.title || "",
                body: event.body || "",
                icon: event.icon,
                preview: event.preview,
                actions: event.actions,
                replyable: event.replyable,
                metadata: event.metadata,

                // Grouping
                groupKey: event.groupKey,
                threadId: event.threadId,

                // Timing
                createdAtFrame: event.at,
                shownAtFrame: event.at,

                // State
                state: "headsUp",
                mode: event.mode || "headsup",
                priority: event.priority || "default",
                animationState: "entering",
            };

            // Add to items using helper
            const items = getItems(device);
            items.push(instance);
            setItems(device, items);
            break;
        }

        // =====================================================================
        // DISMISS NOTIFICATION
        // =====================================================================
        case "DISMISS_NOTIFICATION":
        case "NOTIFICATION_DISMISS": {
            const items = getItems(device);
            if (event.all) {
                // Clear all
                setItems(device, []);
            } else if (event.groupKey) {
                // Dismiss by group - use flat groupKey
                setItems(device, items.filter(n => n.groupKey !== event.groupKey));
            } else if (event.id) {
                // Dismiss single
                const notif = items.find(n => n.id === event.id);
                if (notif) {
                    notif.dismissedAtFrame = event.at;
                    notif.animationState = "exiting";
                }
                setItems(device, items);
            }
            break;
        }

        // =====================================================================
        // TAP NOTIFICATION
        // =====================================================================
        case "TAP_NOTIFICATION":
        case "NOTIFICATION_TAP": {
            const items = getItems(device);
            const notif = items.find(n => n.id === event.id);
            if (notif) {
                notif.tapped = true;
                notif.dismissedAtFrame = event.at;
                notif.animationState = "dismissed";

                // Open the app - use flat appId
                device.foregroundAppId = notif.appId;
                setItems(device, items);
            }
            break;
        }

        // =====================================================================
        // SWIPE NOTIFICATION
        // =====================================================================
        case "SWIPE_NOTIFICATION":
        case "NOTIFICATION_SWIPE": {
            const items = getItems(device);
            const notif = items.find(n => n.id === event.id);
            if (notif && event.action === "dismiss") {
                notif.dismissedAtFrame = event.at;
                notif.animationState = "exiting";
                setItems(device, items);
            }
            break;
        }

        // =====================================================================
        // DYNAMIC ISLAND
        // =====================================================================
        case "SET_DYNAMIC_ISLAND":
        case "NOTIFICATION_DYNAMIC_ISLAND": {
            // DynamicIslandState has mode, content - appId comes from content
            (device as any).dynamicIsland = {
                mode: event.mode || "idle",
                content: {
                    appId: event.appId,
                    ...event.content,
                },
            };
            break;
        }

        // =====================================================================
        // NOTIFICATION PANEL (Not in core NotificationCenterState - skip for now)
        // =====================================================================
        case "TOGGLE_NOTIFICATION_PANEL": {
            // Panel state handled at render level, not in reducer
            break;
        }

        // =====================================================================
        // CLEAR ALL
        // =====================================================================
        case "CLEAR_ALL_NOTIFICATIONS":
        case "NOTIFICATION_CLEAR_ALL": {
            setItems(device, []);
            break;
        }

        // =====================================================================
        // REPLY
        // =====================================================================
        case "REPLY_NOTIFICATION":
        case "NOTIFICATION_REPLY": {
            const items = getItems(device);
            const notif = items.find(n => n.id === event.id);
            if (notif) {
                notif.dismissedAtFrame = event.at;
                setItems(device, items);
            }
            break;
        }
    }

    // Clean up dismissed notifications after animation window (30 frames)
    const cleanupThreshold = event.at - 30;
    const cleanedItems = getItems(device).filter(
        n => !n.dismissedAtFrame || n.dismissedAtFrame > cleanupThreshold
    );
    setItems(device, cleanedItems);
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
