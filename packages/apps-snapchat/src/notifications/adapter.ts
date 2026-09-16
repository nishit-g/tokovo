import type { NotificationAppAdapter } from "@tokovo/device-notifications";

function resolveColor(kind: unknown): string {
  if (kind === "snap") return "#ff5a5f";
  return "#0f8fff";
}

export const snapchatNotificationAdapter: NotificationAppAdapter = {
  appId: "app_snapchat",
  format(intent) {
    return {
      appName: "Snapchat",
      icon: "/icons/snapchat.svg",
      accentColor: resolveColor(intent.metadata?.kind),
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction: (intent) => ({
    ...(intent.threadId ? { appEvent: { appId: "app_snapchat", type: "SNAPCHAT_CONVERSATION_OPEN", payload: { conversationId: intent.threadId } } } : {}),
    navigation: {
      appId: "app_snapchat",
      route: "conversation",
      params: { conversationId: intent.threadId },
    },
  }),
};
