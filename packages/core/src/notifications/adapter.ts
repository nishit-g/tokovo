/**
 * Notification Adapter System
 *
 * Apps provide adapters to format and handle notifications.
 */

import { Notification, TimelineEvent } from "../types";
import { createScopedLogger } from "../logger";

const log = createScopedLogger("notification");

// =============================================================================
// FORMATTED NOTIFICATION
// =============================================================================

export interface FormattedNotification {
  title: string;
  body: string;
  icon?: string;
  iconBackground?: string;
  accentColor?: string;
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };
  actions?: Array<{ id: string; label: string; icon?: string }>;
  sender?: { name: string; avatar?: string };
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
  format(notification: Notification): FormattedNotification;

  /**
   * Handle action (tap, button press) - returns events to emit
   * actionId: "open" (default tap), or button id
   */
  handleAction?(actionId: string, notification: Notification): TimelineEvent[];

  /** Measure height for deterministic layout */
  measureHeight?(
    notification: Notification,
    viewport: { width: number; height: number },
  ): number;
}

// =============================================================================
// ADAPTER REGISTRY
// =============================================================================

class NotificationAdapterRegistryClass {
  private adapters = new Map<string, NotificationAdapter>();

  register(adapter: NotificationAdapter): void {
    this.adapters.set(adapter.appId, adapter);
    log.info(`Registered notification adapter: ${adapter.appId}`);
  }

  get(appId: string): NotificationAdapter | undefined {
    return this.adapters.get(appId);
  }

  format(notification: Notification): FormattedNotification {
    const adapter = this.adapters.get(notification.ir.appId);
    if (adapter) {
      return adapter.format(notification);
    }
    // Default formatting
    return {
      title: notification.ir.title,
      body: notification.ir.body,
      icon: notification.ir.icon,
      preview: notification.ir.preview,
      actions: notification.ir.actions,
    };
  }

  handleAction(
    notification: Notification,
    actionId: string = "open",
  ): TimelineEvent[] {
    const adapter = this.adapters.get(notification.ir.appId);
    if (adapter?.handleAction) {
      return adapter.handleAction(actionId, notification);
    }
    // Default: just open the app
    return [
      {
        at: Date.now(), // This timestamp is placeholder, replaced by engine
        kind: "DEVICE",
        deviceId: notification.deviceId || "phone",
        type: "OPEN_APP",
        payload: { appId: notification.ir.appId },
      },
    ] as TimelineEvent[];
  }
}

export const NotificationAdapterRegistry =
  new NotificationAdapterRegistryClass();

// =============================================================================
// MEASUREMENT CONTRACT
// =============================================================================

export interface NotificationMeasurable {
  measureHeight(
    notification: Notification,
    viewport: { width: number; height: number },
  ): number;
}

/** Default height if adapter doesn't provide measurement */
export const DEFAULT_NOTIFICATION_HEIGHT = 100; // pixels at device scale (matches @tokovo/device-notifications)
