/**
 * Notification Adapter Types
 * 
 * Types for app-specific notification formatting.
 */

import type { NotificationInstance, NotificationIR } from "./index";

// =============================================================================
// FORMATTED NOTIFICATION
// =============================================================================

/**
 * FormattedNotification - App-formatted display data
 */
export interface FormattedNotification {
    /** Display title */
    title: string;

    /** Display body */
    body: string;

    /** App icon */
    icon?: string;

    /** Icon background color */
    iconBackground?: string;

    /** Accent color */
    accentColor?: string;

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
    }>;

    /** Sender info */
    sender?: {
        name: string;
        avatar?: string;
    };
}

// =============================================================================
// NOTIFICATION ADAPTER
// =============================================================================

/**
 * NotificationAdapter - App-specific notification formatting and handling
 */
export interface NotificationAdapter {
    /** App ID this adapter handles */
    appId: string;

    /** Format notification for display */
    format(notification: NotificationInstance): FormattedNotification;

    /** 
     * Handle action (tap, button press)
     * Returns events to emit
     */
    handleAction?(actionId: string, notification: NotificationInstance): any[];

    /** Measure height for deterministic layout */
    measureHeight?(notification: NotificationInstance, viewport: { width: number; height: number }): number;
}
