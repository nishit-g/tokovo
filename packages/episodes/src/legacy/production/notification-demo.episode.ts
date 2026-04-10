import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";

export default defineEpisode({
  meta: {
    id: "notification-demo",
    title: "Notification Demo - WhatsApp Integration",
    description:
      "Demonstrates how apps like WhatsApp integrate with the notification system. Shows stacking (newest on top), priority levels, grouping, actions, and interactions.",
    category: "production",
    tags: [
      "notification",
      "banner",
      "device",
      "animation",
      "stacking",
      "whatsapp",
      "integration",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: [],
  },
  build: () =>
    episode("notification-demo", {
      fps: 30,
      duration: "30s",
      title: "Notification Demo",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-18T14:30:00"),
          battery: 92,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .deviceTrack("phone", (d) => {
          // ═══════════════════════════════════════════════════════════════
          // SECTION 1: Basic Notification Flow
          // Shows: Single notification → dismiss
          // ═══════════════════════════════════════════════════════════════

          d.at("1s").notificationShow({
            id: "wa_alex_1",
            appId: "app_whatsapp",
            title: "Alex",
            body: "Hey! Are you free for lunch today? 🍕",
            icon: "/placeholders/app-icon.svg",
            priority: "default",
            threadKey: "chat_alex",
          });

          d.at("3.5s").notificationDismiss("wa_alex_1");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 2: Stacking Demo (Newest On Top)
          // Shows: Multiple notifications stack with newest appearing on top
          // ═══════════════════════════════════════════════════════════════

          d.at("5s").notificationShow({
            id: "wa_group_1",
            appId: "app_whatsapp",
            title: "Work Group",
            body: "Mike: The deadline is tomorrow!",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
            threadKey: "chat_work_group",
            groupKey: "work_group",
          });

          d.at("6s").notificationShow({
            id: "wa_sarah_1",
            appId: "app_whatsapp",
            title: "Sarah",
            body: "Did you see the news? 📰",
            icon: "/placeholders/app-icon.svg",
            priority: "default",
            threadKey: "chat_sarah",
          });

          d.at("7s").notificationShow({
            id: "wa_mom_1",
            appId: "app_whatsapp",
            title: "Mom ❤️",
            body: "Call me when you get a chance",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
            threadKey: "chat_mom",
          });

          // ═══════════════════════════════════════════════════════════════
          // SECTION 3: Tap Interaction
          // Shows: User taps notification → opens app → clears notification
          // ═══════════════════════════════════════════════════════════════

          d.at("9s").notificationTap("wa_mom_1");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 4: Swipe Dismiss
          // Shows: User swipes to dismiss notifications
          // ═══════════════════════════════════════════════════════════════

          d.at("10.5s").notificationSwipe("wa_sarah_1", "right");
          d.at("11s").notificationSwipe("wa_group_1", "right");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 5: Priority Levels
          // Shows: Critical (Uber), High (Calendar), Default (Instagram)
          // ═══════════════════════════════════════════════════════════════

          d.at("13s").notificationShow({
            id: "uber_1",
            appId: "Uber",
            title: "Your ride is arriving!",
            body: "Toyota Camry • 2 min away",
            icon: "/placeholders/app-icon.svg",
            priority: "critical",
          });

          d.at("14s").notificationShow({
            id: "calendar_1",
            appId: "Calendar",
            title: "Meeting in 10 minutes",
            body: "Team Standup - Zoom",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
            actions: [
              { id: "join", label: "Join" },
              { id: "snooze", label: "Snooze" },
            ],
          });

          d.at("15s").notificationShow({
            id: "instagram_1",
            appId: "Instagram",
            title: "New follower",
            body: "@design_guru started following you",
            icon: "/placeholders/app-icon.svg",
            priority: "default",
          });

          d.at("18s").notificationDismiss("uber_1");
          d.at("18.5s").notificationTap("calendar_1");
          d.at("19s").notificationSwipe("instagram_1", "right");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 6: Grouped Notifications (Email)
          // Shows: Multiple emails grouped under same groupKey
          // ═══════════════════════════════════════════════════════════════

          d.at("21s").notificationShow({
            id: "mail_1",
            appId: "Mail",
            title: "boss@company.com",
            body: "Q4 Report Review",
            icon: "/placeholders/app-icon.svg",
            groupKey: "inbox",
          });

          d.at("22s").notificationShow({
            id: "mail_2",
            appId: "Mail",
            title: "team@company.com",
            body: "Sprint Planning Notes",
            icon: "/placeholders/app-icon.svg",
            groupKey: "inbox",
          });

          d.at("23s").notificationShow({
            id: "mail_3",
            appId: "Mail",
            title: "hr@company.com",
            body: "Holiday Schedule Update",
            icon: "/placeholders/app-icon.svg",
            groupKey: "inbox",
          });

          // ═══════════════════════════════════════════════════════════════
          // SECTION 7: Reply Action (WhatsApp)
          // Shows: Notification with reply capability
          // ═══════════════════════════════════════════════════════════════

          d.at("25s").notificationShow({
            id: "wa_alex_2",
            appId: "app_whatsapp",
            title: "Alex",
            body: "So... lunch? 🍕",
            icon: "/placeholders/app-icon.svg",
            priority: "high",
            threadKey: "chat_alex",
            replyable: true,
            actions: [
              { id: "reply", label: "Reply" },
              { id: "mark_read", label: "Mark as Read" },
            ],
          });

          // ═══════════════════════════════════════════════════════════════
          // SECTION 8: Clear All
          // Shows: All notifications dismissed at once
          // ═══════════════════════════════════════════════════════════════

          d.at("29s").notificationClearAll();
      })

      .build(),
});
