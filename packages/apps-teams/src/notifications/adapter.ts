import type { NotificationAppAdapter } from "@tokovo/device-notifications";
import { TeamsMetadata } from "../assets/metadata.js";

function resolveAccent(kind: unknown): string {
  if (kind === "mention") return "#5b5fc7";
  if (kind === "system") return "#2672db";
  return "#4f9d68";
}

function resolveTitle(title: string, senderName: unknown): string {
  if (typeof senderName === "string" && senderName.trim().length > 0) {
    return senderName;
  }
  return title;
}

export const teamsNotificationAdapter: NotificationAppAdapter = {
  appId: "app_teams",
  format(intent) {
    return {
      appName: "Teams",
      icon: TeamsMetadata.icon ?? "/icons/teams.svg",
      accentColor: resolveAccent(intent.metadata?.kind),
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: resolveTitle(intent.content.title, intent.metadata?.senderName),
      body: intent.content.body,
      subtitle: intent.content.subtitle ?? intent.content.title,
    };
  },
  defaultAction: (intent) => ({
    navigation: {
      appId: "app_teams",
      route: intent.metadata?.route as string | undefined,
      params: { threadId: intent.threadId },
    },
  }),
};
