import type { Notification, PluginNotificationAdapter } from "@tokovo/core";

function resolveColor(notification: Notification): string {
  const kind = notification.ir.payload?.kind;
  if (kind === "snap") return "#ff5a5f";
  return "#0f8fff";
}

export const snapchatNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? "/icons/snapchat.svg",
      color: resolveColor(notification),
      title: notification.title,
      body: notification.body,
      subtitle: "Snapchat",
    };
  },
};
