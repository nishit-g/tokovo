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
  defaultAction: (intent) => ({
    navigation: {
      appId: "app_x",
      route: intent.metadata?.route as string | undefined,
      params: { threadId: intent.threadId },
    },
  }),
};
