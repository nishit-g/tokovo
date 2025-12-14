/**
 * Notification DSL Helpers
 * 
 * Fluent API for creating notification timeline events.
 */

import { TimelineEvent, NotificationPriority, NotificationDeliverWhen } from "./types";

// =============================================================================
// NOTIFICATION DSL
// =============================================================================

export interface NotificationOptions {
    appId: string;
    title: string;
    body: string;
    mode?: "lockscreen" | "headsup" | "both" | "silent";
    priority?: NotificationPriority;
    deliverWhen?: NotificationDeliverWhen;
    groupKey?: string;
    threadId?: string;
    icon?: string;
    preview?: { kind: "text" | "image" | "video"; value: string; aspectRatio?: number };
    actions?: Array<{ id: string; label: string; icon?: string; destructive?: boolean }>;
    replyable?: boolean;
    metadata?: Record<string, any>;
}

/**
 * Create a SHOW_NOTIFICATION event
 */
export function showNotification(
    at: number,
    deviceId: string,
    opts: NotificationOptions
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "SHOW_NOTIFICATION",
        ...opts,
    } as TimelineEvent;
}

/**
 * Create an UPDATE_NOTIFICATION event
 */
export function updateNotification(
    at: number,
    deviceId: string,
    notificationId: string,
    patch: { title?: string; body?: string; preview?: NotificationOptions["preview"] }
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "UPDATE_NOTIFICATION",
        notificationId,
        patch,
    } as TimelineEvent;
}

/**
 * Create a DISMISS_NOTIFICATION event
 */
export function dismissNotification(
    at: number,
    deviceId: string,
    opts: { notificationId?: string; groupKey?: string; all?: boolean }
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "DISMISS_NOTIFICATION",
        ...opts,
    } as TimelineEvent;
}

/**
 * Create a TAP_NOTIFICATION event (opens app)
 */
export function tapNotification(
    at: number,
    deviceId: string,
    notificationId: string,
    actionId?: string
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "TAP_NOTIFICATION",
        notificationId,
        actionId,
    } as TimelineEvent;
}

/**
 * Create a SWIPE_NOTIFICATION event
 */
export function swipeNotification(
    at: number,
    deviceId: string,
    notificationId: string,
    direction: "left" | "right",
    action: "dismiss" | "archive" | "snooze" | "mark_read" = "dismiss"
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "SWIPE_NOTIFICATION",
        notificationId,
        direction,
        action,
    } as TimelineEvent;
}

/**
 * Create a REPLY_NOTIFICATION event
 */
export function replyToNotification(
    at: number,
    deviceId: string,
    notificationId: string,
    text: string
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "REPLY_NOTIFICATION",
        notificationId,
        text,
    } as TimelineEvent;
}

/**
 * Create a TOGGLE_NOTIFICATION_PANEL event
 */
export function toggleNotificationPanel(
    at: number,
    deviceId: string,
    open: boolean
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "TOGGLE_NOTIFICATION_PANEL",
        open,
    } as TimelineEvent;
}

/**
 * Create a CLEAR_ALL_NOTIFICATIONS event
 */
export function clearAllNotifications(at: number, deviceId: string): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "CLEAR_ALL_NOTIFICATIONS",
    } as TimelineEvent;
}

/**
 * Create a SET_DYNAMIC_ISLAND event
 */
export function setDynamicIsland(
    at: number,
    deviceId: string,
    visible: boolean,
    mode?: "idle" | "minimal" | "compact" | "expanded"
): TimelineEvent {
    return {
        at,
        kind: "DEVICE",
        deviceId,
        type: "SET_DYNAMIC_ISLAND",
        visible,
        mode,
    } as TimelineEvent;
}

// =============================================================================
// DSL NAMESPACE (for convenient imports)
// =============================================================================

export const notificationDsl = {
    show: showNotification,
    update: updateNotification,
    dismiss: dismissNotification,
    tap: tapNotification,
    swipe: swipeNotification,
    reply: replyToNotification,
    togglePanel: toggleNotificationPanel,
    clearAll: clearAllNotifications,
    setDynamicIsland,
};
