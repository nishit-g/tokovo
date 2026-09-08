import type { NotificationAppAdapter } from "../contract/index.js";

/**
 * Notification presentation for OS-owned apps that do not need a runtime app
 * plugin. Keep these adapters headless: the device painter owns their platform
 * chrome and the compiler only needs deterministic content metadata.
 */
export const systemCalendarNotificationAdapter: NotificationAppAdapter = {
  appId: "system_calendar",
  format(intent) {
    return {
      appName: "Calendar",
      icon: "31",
      accentColor: "#ff3b30",
      title: intent.content.title,
      body: intent.content.body,
      subtitle: intent.content.subtitle,
    };
  },
  defaultAction() {
    return {
      navigation: {
        appId: "system_calendar",
        route: "today",
      },
    };
  },
};

export const builtinSystemNotificationAdapters = [
  systemCalendarNotificationAdapter,
] as const satisfies readonly NotificationAppAdapter[];
