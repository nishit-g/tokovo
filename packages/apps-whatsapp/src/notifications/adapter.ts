import type { Notification, PluginNotificationAdapter } from "@tokovo/core";

export const whatsappNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? "/icons/whatsapp.svg",
      color: "#25D366",
      title: notification.title,
      body: notification.body,
      subtitle: "WhatsApp",
    };
  },
};
