import type { Notification, PluginNotificationAdapter } from "@tokovo/core";
import { TeamsMetadata } from "../assets/metadata.js";

function resolveAccent(notification: Notification): string {
  const kind = notification.ir.payload?.kind;
  if (kind === "mention") return "#5b5fc7";
  if (kind === "system") return "#2672db";
  return "#4f9d68";
}

function resolveTitle(notification: Notification): string {
  const senderName = notification.ir.payload?.senderName;
  if (typeof senderName === "string" && senderName.trim().length > 0) {
    return senderName;
  }
  return notification.title;
}

export const teamsNotificationAdapter: PluginNotificationAdapter = {
  format(notification: Notification) {
    return {
      icon: notification.icon ?? TeamsMetadata.icon ?? "/icons/teams.svg",
      color: resolveAccent(notification),
      title: resolveTitle(notification),
      body: notification.body,
      subtitle: notification.title,
    };
  },
};
