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
  defaultAction(intent) {
    const dmId = typeof intent.metadata?.dmId === "string" ? intent.metadata.dmId.trim() : undefined;
    const channelId = typeof intent.metadata?.channelId === "string" ? intent.metadata.channelId.trim() : undefined;
    const appEvent = dmId
      ? { appId: "app_teams", type: "TEAMS_OPEN_DM", payload: { dmId } }
      : channelId && intent.threadId
        ? { appId: "app_teams", type: "TEAMS_OPEN_THREAD", payload: { channelId, threadId: intent.threadId } }
        : channelId
          ? { appId: "app_teams", type: "TEAMS_OPEN_CHANNEL", payload: { channelId } }
          : undefined;
    return {
      navigation: {
        appId: "app_teams",
        route: typeof intent.metadata?.route === "string" ? intent.metadata.route : undefined,
        params: { threadId: intent.threadId, channelId, dmId },
      },
      ...(appEvent ? { appEvent } : {}),
    };
  },
};
