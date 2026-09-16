import type { NotificationAppAdapter } from "@tokovo/device-notifications";

function resolveColor(kind: unknown): string {
  if (kind === "like") return "#f91880";
  if (kind === "follow") return "#00ba7c";
  return "#1d9bf0";
}

export const xNotificationAdapter: NotificationAppAdapter = {
  appId: "app_x",
  format(intent) {
    return {
      appName: "X",
      icon: "/icons/x.svg",
      accentColor: resolveColor(intent.metadata?.kind),
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction: (intent) => {
    const tweetId =
      typeof intent.metadata?.tweetId === "string" ? intent.metadata.tweetId : undefined;
    const actorId =
      typeof intent.metadata?.actorId === "string" ? intent.metadata.actorId : undefined;
    const social =
      intent.category === "social" ||
      ["like", "follow", "repost", "reply", "mention", "verified"].includes(
        String(intent.metadata?.kind),
      );
    const payload = tweetId
      ? { screen: "tweet", tweetId }
      : intent.metadata?.kind === "follow" && actorId
        ? { screen: "profile", userId: actorId }
        : !social && intent.threadId
          ? { screen: "thread", threadId: intent.threadId }
          : { screen: "notifications" };
    return {
      navigation: { appId: "app_x" },
      appEvent: {
        appId: "app_x",
        type: "SET_SCREEN",
        payload: social ? { ...payload, notificationId: intent.id } : payload,
      },
    };
  },
};
