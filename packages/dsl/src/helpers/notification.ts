import { NotificationIR } from "@tokovo/core";


let notificationCounter = 0;

function generateNotifId(prefix: string): string {
  notificationCounter++;
  return `${prefix}_${notificationCounter.toString(16).padStart(6, "0")}`;
}

export function resetNotificationCounter(): void {
  notificationCounter = 0;
}

/**
 * Generic Notification DSL
 *
 * Allows authors to simulate push notifications from any app.
 */

export interface ScheduleNotificationOptions {
  appId: string;
  title: string;
  body: string;

  // Optional overrides
  icon?: string;
  id?: string; // Manual ID if you want to reference it later

  // Advanced
  threadKey?: string;
  groupKey?: string;
  category?: NotificationIR["category"];

  // Actions
  actions?: NotificationIR["actions"];
  replyable?: boolean;
}

export const notification = {
  /**
   * Schedule a notification to appear
   */
  schedule: (at: number, options: ScheduleNotificationOptions) => {
    const id = options.id || generateNotifId("notif");

    // Construct the IR payload
    // We use the "SHOW_NOTIFICATION" event which the Engine listens to.
    // The Engine will wrap this IR into a NotificationInstance.
    return {
      at,
      kind: "DEVICE",
      deviceId: "primary", // Default to primary for now
      type: "SHOW_NOTIFICATION",

      // The IR fields
      id,
      appId: options.appId,
      title: options.title,
      body: options.body,
      icon: options.icon,

      // Meta
      category: options.category,
      threadKey: options.threadKey,
      groupKey: options.groupKey,
      actions: options.actions,
      replyable: options.replyable,
    } as const;
  },

  /**
   * Simulate tapping a notification (opens the app)
   */
  tap: (at: number, notificationId: string, actionId?: string) =>
    ({
      at,
      kind: "DEVICE",
      deviceId: "primary",
      type: "TAP_NOTIFICATION",
      notificationId,
      actionId,
    }) as const,

  /**
   * Dismiss a notification
   */
  dismiss: (at: number, notificationId: string) =>
    ({
      at,
      kind: "DEVICE",
      deviceId: "primary",
      type: "DISMISS_NOTIFICATION",
      notificationId,
    }) as const,

  /**
   * Clear all notifications
   */
  clearAll: (at: number) =>
    ({
      at,
      kind: "DEVICE",
      deviceId: "primary",
      type: "CLEAR_ALL_NOTIFICATIONS",
    }) as const,
};
