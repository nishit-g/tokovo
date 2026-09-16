import type { NotificationAppAdapter } from "@tokovo/device-notifications";

export const iMessageNotificationAdapter: NotificationAppAdapter = {
  appId: "app_imessage",
  format(intent) {
    return {
      appName: "Messages",
      icon: "/icons/imessage.svg",
      accentColor: "#0a84ff",
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction(intent) {
    return {
      ...(intent.threadId ? { appEvent: {
        appId: "app_imessage", type: "IMESSAGE_CONVERSATION_OPEN", payload: { conversationId: intent.threadId },
      } } : {}),
      navigation: {
        appId: "app_imessage",
        route: "conversation",
        params: { conversationId: intent.threadId },
      },
    };
  },
};
