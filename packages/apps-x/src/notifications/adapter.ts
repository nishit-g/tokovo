import type { Notification, PluginNotificationAdapter } from "@tokovo/core";

function resolveColor(notification: Notification): string {
  const kind = notification.ir.payload?.kind;
  if (kind === "like") return "#f91880";
  if (kind === "follow") return "#00ba7c";
  return "#1d9bf0";
}

export const xNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? "/icons/x.svg",
      color: resolveColor(notification),
      title: notification.title,
      body: notification.body,
      subtitle: "X",
    };
  },
};
