/**
 * Notification Lowering Handler
 * 
 * Converts V2 IR notification events to runtime events.
 */

import type { NotificationTrackEvent } from "../ir/track-event";

// =============================================================================
// LOWERING HANDLER
// =============================================================================

/**
 * Lower notification IR events to runtime events
 * 
 * For notifications, most events map 1:1 to DEVICE events.
 * The lowering is minimal since notifications are already device-level.
 */
export function notificationV2Lowering(
    event: NotificationTrackEvent,
    ctx: { fps: number }
): any[] {
    // Map NOTIFICATION_* events to standard DEVICE event format
    // Most fields pass through directly

    const { _declarationOrder, ...eventData } = event;

    // Convert type from NOTIFICATION_SHOW to SHOW_NOTIFICATION for backward compat
    const typeMap: Record<string, string> = {
        "NOTIFICATION_SHOW": "SHOW_NOTIFICATION",
        "NOTIFICATION_DISMISS": "DISMISS_NOTIFICATION",
        "NOTIFICATION_TAP": "TAP_NOTIFICATION",
        "NOTIFICATION_SWIPE": "SWIPE_NOTIFICATION",
        "NOTIFICATION_DYNAMIC_ISLAND": "SET_DYNAMIC_ISLAND",
        "NOTIFICATION_OPEN_PANEL": "TOGGLE_NOTIFICATION_PANEL",
        "NOTIFICATION_CLOSE_PANEL": "TOGGLE_NOTIFICATION_PANEL",
        "NOTIFICATION_CLEAR_ALL": "CLEAR_ALL_NOTIFICATIONS",
        "NOTIFICATION_REPLY": "REPLY_NOTIFICATION",
    };

    const mappedType = typeMap[event.type] || event.type;

    // Handle panel toggle specially
    if (event.type === "NOTIFICATION_OPEN_PANEL") {
        return [{
            ...eventData,
            kind: "DEVICE",
            type: mappedType,
            open: true,
        }];
    }

    if (event.type === "NOTIFICATION_CLOSE_PANEL") {
        return [{
            ...eventData,
            kind: "DEVICE",
            type: mappedType,
            open: false,
        }];
    }

    // Handle dynamic island
    if (event.type === "NOTIFICATION_DYNAMIC_ISLAND") {
        return [{
            ...eventData,
            kind: "DEVICE",
            type: mappedType,
            visible: event.mode !== "idle",
            mode: event.mode,
        }];
    }

    return [{
        ...eventData,
        kind: "DEVICE",
        type: mappedType,
    }];
}

// =============================================================================
// SUPPORTED EVENT TYPES
// =============================================================================

export const NOTIFICATION_EVENT_TYPES = [
    "NOTIFICATION_SHOW",
    "NOTIFICATION_DISMISS",
    "NOTIFICATION_TAP",
    "NOTIFICATION_SWIPE",
    "NOTIFICATION_DYNAMIC_ISLAND",
    "NOTIFICATION_OPEN_PANEL",
    "NOTIFICATION_CLOSE_PANEL",
    "NOTIFICATION_CLEAR_ALL",
    "NOTIFICATION_REPLY",
] as const;
