/**
 * WhatsApp Notification Adapter
 *
 * Formats WhatsApp notifications with messaging-specific styling.
 */

import {
  NotificationAdapter,
  Notification,
  FormattedNotification,
  TimelineEvent,
} from "@tokovo/core";

const WHATSAPP_GREEN = "#25D366";

const whatsappAdapter: NotificationAdapter = {
  appId: "app_whatsapp",

  format(notification: Notification): FormattedNotification {
    const ir = notification.ir;
    return {
      title: ir.title,
      body: ir.body,
      icon: "💬",
      iconBackground: WHATSAPP_GREEN,
      accentColor: WHATSAPP_GREEN,
      preview: ir.preview,
      actions: ir.actions || [
        { id: "reply", label: "Reply" },
        { id: "mark_read", label: "Mark as Read" },
      ],
      sender: ir.payload?.sender as
        | { name: string; avatar?: string }
        | undefined,
    };
  },

  handleAction(actionId: string, notification: Notification): TimelineEvent[] {
    const baseEvents: TimelineEvent[] = [];
    const threadId = notification.ir.threadKey;

    if (actionId === "open" || actionId === "reply") {
      baseEvents.push({
        at: Date.now(),
        kind: "DEVICE",
        deviceId: notification.deviceId || "phone",
        type: "OPEN_APP",
        payload: { appId: "app_whatsapp" },
      } as TimelineEvent);

      if (threadId) {
        baseEvents.push({
          at: Date.now(),
          kind: "APP",
          appId: "app_whatsapp",
          deviceId: notification.deviceId || "phone",
          type: "NAVIGATE_SCREEN",
          payload: { screen: "chat", conversationId: threadId },
        } as TimelineEvent);
      }
    }

    return baseEvents;
  },

  measureHeight(notification: Notification, _viewport: { width: number }) {
    let height = 180;
    if (notification.ir.preview?.kind === "image") {
      height += 200;
    }
    return height;
  },
};

export { whatsappAdapter as WhatsAppNotificationAdapter };
