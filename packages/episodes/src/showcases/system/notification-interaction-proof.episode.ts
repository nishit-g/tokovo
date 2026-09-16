import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "notification-interaction-proof", title: "Notification Interaction Proof",
    description: "Authenticated handoff, notification-owned reply input, explicit read badges and animated burst groups.",
    category: "showcase", catalogType: "system_showcase", visibility: "public", sortOrder: 111,
    tags: ["notifications", "keyboard", "authentication", "tokens"],
  },
  config: { format: "1080x1920", durationInFrames: 540, apps: ["app_whatsapp"] },
  build: () => episode("notification-interaction-proof", { fps: 30, duration: "18s" })
    .device("phone", "iphone16", {
      app: "app_whatsapp", locked: true, installedApps: ["app_whatsapp"],
      notificationTokens: { card: "#fff7e9", text: "#343b32", secondaryText: "#66725c", accent: "#52764c", border: "#dfdbc6", radius: 24, padding: 16 },
      os: { time: new Date("2026-09-08T09:41:00Z"), battery: 88 },
    })
    .snapshot("app_whatsapp", "phone", { conversations: [{
      id: "release", name: "Release review", unreadCount: 2,
      messages: [{ id: "seed", type: "text", from: "Release review", text: "The review build is ready.", at: 0 }], lastMessageAt: 0,
    }] })
    .input("phone", "notification-reply", { id: "review-reply", appId: "app_whatsapp", at: "6s", until: "9s", text: "Looks good. Ship it.", clearOnSubmit: false })
    .deviceTrack("phone", (device) => { device.at("11s").lock(); })
    .notificationTrack("phone", (notifications) => {
      notifications.at("0.7s").deliver({ id: "review", appId: "app_whatsapp", threadId: "release", privacy: "private",
        content: { title: "Release review", body: "The review build is ready." } });
      notifications.at("1.8s").tap("review");
      notifications.at("3s").authenticate("review");
      notifications.at("3s").markRead("review", 0, { type: "CONVERSATION_OPENED", payload: { conversationId: "release" } });
      notifications.at("4.5s").deliver({ id: "reply", appId: "app_whatsapp", threadId: "release", foregroundBehavior: "present",
        content: { title: "Release review", body: "Can we ship this version?" },
        reply: { actionId: "send", textPayloadKey: "text", target: { appEvent: { type: "MESSAGE_SENT", payload: { conversationId: "release" } } } } });
      notifications.at("5.5s").expand("reply");
      notifications.at("6s").beginReply("reply", "review-reply");
      notifications.at("9s").reply("reply", "Looks good. Ship it.");
      for (let index = 0; index < 3; index++) notifications.at(345 + index * 3).deliver({
        id: `burst-${index}`, appId: "app_whatsapp", groupId: `group-${index}`, threadId: "release",
        content: { title: ["Design", "Engineering", "Release"][index], body: "Checks complete. Ready for the release." },
      });
      notifications.at("13s").dismiss("burst-1");
      notifications.at("14s").clearAll();
    }).build(),
});
