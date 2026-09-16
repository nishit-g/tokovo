import type { NotificationAppAdapter } from "@tokovo/device-notifications";

export const whatsappNotificationAdapter: NotificationAppAdapter = {
  appId: "app_whatsapp",
  format(intent) {
    return {
      appName: "WhatsApp",
      icon: "/icons/whatsapp.svg",
      accentColor: "#25D366",
      leadingImage: intent.content.avatar?.src,
      leadingImageAlt: intent.content.avatar?.alt,
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction: (intent) => ({
    ...(intent.threadId ? { appEvent: {
      appId: "app_whatsapp", type: "CONVERSATION_OPENED", payload: { conversationId: intent.threadId },
    } } : {}),
    navigation: {
      appId: "app_whatsapp",
      route: "conversation",
      params: { conversationId: intent.threadId },
    },
  }),
};
