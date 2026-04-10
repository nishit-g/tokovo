import type { Notification, PluginNotificationAdapter } from "@tokovo/core";

function resolveColor(notification: Notification): string {
  const kind = notification.ir.payload?.kind;
  if (kind === "comment") return "#0a66c2";
  if (kind === "connection") return "#057642";
  if (kind === "message") return "#7b61ff";
  return "#378fe9";
}

export const linkedInNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? "/icons/linkedin.svg",
      color: resolveColor(notification),
      title: notification.title,
      body: notification.body,
      subtitle: "LinkedIn",
    };
  },
};
