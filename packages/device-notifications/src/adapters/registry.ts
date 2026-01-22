/**
 * Notification Adapter Registry
 *
 * Registry for app-specific notification formatting.
 */

import type {
  NotificationAdapter,
  FormattedNotification,
} from "../types/adapter-types";
import type { NotificationInstance } from "../types";

// =============================================================================
// DEFAULT FORMATTING
// =============================================================================

const DEFAULT_FORMATTED: FormattedNotification = {
  title: "Notification",
  body: "",
};

// =============================================================================
// REGISTRY
// =============================================================================

class NotificationAdapterRegistryClass {
  private adapters = new Map<string, NotificationAdapter>();

  /**
   * Register an adapter for an app
   */
  register(adapter: NotificationAdapter): void {
    this.adapters.set(adapter.appId, adapter);
    console.log(
      `[NotificationAdapters] Registered adapter for: ${adapter.appId}`,
    );
  }

  /**
   * Get adapter for an app
   */
  get(appId: string): NotificationAdapter | undefined {
    return this.adapters.get(appId);
  }

  /**
   * Check if adapter exists
   */
  has(appId: string): boolean {
    return this.adapters.has(appId);
  }

  /**
   * Format notification using registered adapter
   */
  format(notification: NotificationInstance): FormattedNotification {
    const adapter = this.adapters.get(notification.appId);

    if (adapter) {
      return adapter.format(notification);
    }

    // Default formatting - use top-level fields
    return {
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      preview: notification.preview,
      actions: notification.actions,
    };
  }

  /**
   * Handle action on notification
   */
  handleAction(
    notification: NotificationInstance,
    actionId: string = "open",
  ): any[] {
    const adapter = this.adapters.get(notification.appId);

    if (adapter?.handleAction) {
      return adapter.handleAction(actionId, notification);
    }

    // Default: open the app
    return [
      {
        at: Date.now(),
        kind: "DEVICE",
        deviceId: notification.deviceId,
        type: "OPEN_APP",
        appId: notification.appId,
      },
    ];
  }

  /**
   * Measure notification height
   */
  measureHeight(
    notification: NotificationInstance,
    viewport: { width: number; height: number },
  ): number {
    const adapter = this.adapters.get(notification.appId);

    if (adapter?.measureHeight) {
      return adapter.measureHeight(notification, viewport);
    }

    // Default height
    return 100;
  }

  /**
   * Clear all adapters (for testing)
   */
  clear(): void {
    this.adapters.clear();
  }
}

export const NotificationAdapterRegistry =
  new NotificationAdapterRegistryClass();

// =============================================================================
// DEFAULT NOTIFICATION HEIGHT
// =============================================================================

export const DEFAULT_NOTIFICATION_HEIGHT = 100;
