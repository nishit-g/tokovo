/**
 * Notification Types
 * 
 * Core type definitions for the notification system.
 */

// =============================================================================
// NOTIFICATION IR (Intermediate Representation)
// =============================================================================

export type NotificationMode = "headsup" | "lockscreen" | "both" | "silent";
export type NotificationPriority = "low" | "default" | "high" | "urgent";

/**
 * Notification IR - The authoring-time representation
 */
export interface NotificationIR {
    /** Unique notification ID */
    id: string;

    /** App that owns this notification */
    appId: string;

    /** Notification title */
    title: string;

    /** Notification body text */
    body: string;

    /** Display mode */
    mode?: NotificationMode;

    /** Priority level */
    priority?: NotificationPriority;

    /** App icon (URL or emoji) */
    icon?: string;

    /** Preview content */
    preview?: {
        kind: "text" | "image" | "video";
        value: string;
        aspectRatio?: number;
    };

    /** Action buttons */
    actions?: Array<{
        id: string;
        label: string;
        icon?: string;
        destructive?: boolean;
    }>;

    /** Group key for stacking */
    groupKey?: string;

    /** Thread ID for conversations */
    threadId?: string;

    /** Can reply inline */
    replyable?: boolean;

    /** App-specific metadata */
    metadata?: Record<string, any>;
}

// =============================================================================
// NOTIFICATION INSTANCE (Runtime State)
// =============================================================================

/**
 * NotificationInstance - Runtime representation with frame timing
 */
export interface NotificationInstance {
    /** Unique ID */
    id: string;

    /** The IR definition */
    ir: NotificationIR;

    /** Device this notification is on */
    deviceId: string;

    /** Frame when shown */
    shownAtFrame: number;

    /** Display mode */
    mode: NotificationMode;

    /** Frame when dismissed (undefined = still showing) */
    dismissedAt?: number;

    /** Has been tapped */
    tapped?: boolean;

    /** Animation state */
    animationState?: "entering" | "visible" | "exiting" | "dismissed";
}

// =============================================================================
// DYNAMIC ISLAND
// =============================================================================

export type DynamicIslandMode = "idle" | "minimal" | "compact" | "expanded";

export interface DynamicIslandState {
    mode: DynamicIslandMode;
    appId?: string;
    content?: {
        title?: string;
        subtitle?: string;
        icon?: string;
    };
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export FormattedNotification and adapter types
export type { FormattedNotification, NotificationAdapter } from "./adapter-types";
