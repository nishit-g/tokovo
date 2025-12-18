/**
 * Notification Event Payloads
 * 
 * Type definitions for notification event payloads.
 */

import type { NotificationIR, NotificationMode, DynamicIslandMode } from "./index";

// =============================================================================
// SHOW NOTIFICATION
// =============================================================================

export interface ShowNotificationPayload extends Omit<NotificationIR, "id"> {
    /** Optional ID (auto-generated if not provided) */
    id?: string;
}

// =============================================================================
// DISMISS NOTIFICATION
// =============================================================================

export interface DismissNotificationPayload {
    /** Dismiss specific notification by ID */
    id?: string;

    /** Dismiss all notifications with this group key */
    groupKey?: string;

    /** Dismiss all notifications */
    all?: boolean;
}

// =============================================================================
// TAP NOTIFICATION
// =============================================================================

export interface TapNotificationPayload {
    /** Notification ID */
    id: string;

    /** Action button ID (undefined = tapped notification itself) */
    actionId?: string;
}

// =============================================================================
// SWIPE NOTIFICATION
// =============================================================================

export interface SwipeNotificationPayload {
    /** Notification ID */
    id: string;

    /** Swipe direction */
    direction: "left" | "right";

    /** Action to perform */
    action: "dismiss" | "archive" | "snooze" | "mark_read";
}

// =============================================================================
// DYNAMIC ISLAND
// =============================================================================

export interface DynamicIslandPayload {
    /** Island display mode */
    mode: DynamicIslandMode;

    /** App to show in island */
    appId?: string;

    /** Custom content */
    content?: {
        title?: string;
        subtitle?: string;
        icon?: string;
    };
}

// =============================================================================
// NOTIFICATION PANEL
// =============================================================================

export interface NotificationPanelPayload {
    /** Open or close the panel */
    open: boolean;
}

// =============================================================================
// PAYLOADS MAP
// =============================================================================

/**
 * All notification event payloads mapped by event type
 */
export interface NotificationPayloads {
    SHOW: ShowNotificationPayload;
    DISMISS: DismissNotificationPayload;
    TAP: TapNotificationPayload;
    SWIPE: SwipeNotificationPayload;
    DYNAMIC_ISLAND: DynamicIslandPayload;
    OPEN_PANEL: Record<string, never>;
    CLOSE_PANEL: Record<string, never>;
    CLEAR_ALL: Record<string, never>;
    REPLY: { id: string; text: string };
}

export type NotificationEventType = keyof NotificationPayloads;
