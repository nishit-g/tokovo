import type { Notification, PluginNotificationAdapter } from "@tokovo/core";

export const iMessageNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? "/icons/imessage.svg",
      color: "#0a84ff",
      title: notification.title,
      body: notification.body,
      subtitle: "Messages",
    };
  },
};
