import type { NotificationAppAdapter } from "@tokovo/device-notifications";

function resolveColor(kind: unknown): string {
  if (kind === "follow") return "#5851DB";
  if (kind === "dm") return "#0095F6";
  return "#E1306C";
}

export const instagramNotificationAdapter: NotificationAppAdapter = {
  appId: "app_instagram",
  format(intent) {
    return {
      appName: "Instagram",
      icon: "/icons/instagram.svg",
      accentColor: resolveColor(intent.metadata?.kind),
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction: (intent) => ({
    ...(intent.threadId ? { appEvent: { appId: "app_instagram", type: "NAVIGATE", payload: { screen: "thread", threadId: intent.threadId } } } : {}),
    navigation: {
      appId: "app_instagram",
      route: intent.metadata?.route as string | undefined,
      params: { threadId: intent.threadId },
    },
  }),
};
