import type { NotificationAppAdapter } from "@tokovo/device-notifications";

function resolveColor(kind: unknown): string {
  if (kind === "comment") return "#0a66c2";
  if (kind === "connection") return "#057642";
  if (kind === "message") return "#7b61ff";
  return "#378fe9";
}

export const linkedInNotificationAdapter: NotificationAppAdapter = {
  appId: "app_linkedin",
  format(intent) {
    return {
      appName: "LinkedIn",
      icon: "/icons/linkedin.svg",
      accentColor: resolveColor(intent.metadata?.kind),
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction: (intent) => ({
    navigation: {
      appId: "app_linkedin",
      route: intent.metadata?.route as string | undefined,
      params: { threadId: intent.threadId },
    },
  }),
};
