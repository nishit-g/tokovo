import type { Notification, PluginNotificationAdapter } from "@tokovo/core";

function resolveColor(notification: Notification): string {
  const kind = notification.ir.payload?.kind;
  if (kind === "follow") return "#5851DB";
  if (kind === "dm") return "#0095F6";
  return "#E1306C";
}

export const instagramNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? "/icons/instagram.svg",
      color: resolveColor(notification),
      title: notification.title,
      body: notification.body,
      subtitle: "Instagram",
    };
  },
};
