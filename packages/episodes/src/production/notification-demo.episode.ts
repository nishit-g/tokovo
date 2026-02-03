import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { NotificationTrackBuilder } from "@tokovo/device-notifications";

let orderCounter = 0;
const getOrder = () => orderCounter++;

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

      .track(
        "device_notifications",
        () => new NotificationTrackBuilder(30, "phone", getOrder),
        (notif) => {
          // ═══════════════════════════════════════════════════════════════
          // SECTION 1: Basic Notification Flow
          // Shows: Single notification → dismiss
          // ═══════════════════════════════════════════════════════════════

          notif.at("1s").show({
            id: "wa_alex_1",
            appId: "app_whatsapp",
            title: "Alex",
            body: "Hey! Are you free for lunch today? 🍕",
            icon: "/apps/whatsapp.png",
            priority: "default",
            threadKey: "chat_alex",
          });

          notif.at("3.5s").dismiss("wa_alex_1");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 2: Stacking Demo (Newest On Top)
          // Shows: Multiple notifications stack with newest appearing on top
          // ═══════════════════════════════════════════════════════════════

          notif.at("5s").show({
            id: "wa_group_1",
            appId: "app_whatsapp",
            title: "Work Group",
            body: "Mike: The deadline is tomorrow!",
            icon: "/apps/whatsapp.png",
            priority: "high",
            threadKey: "chat_work_group",
            groupKey: "work_group",
          });

          notif.at("6s").show({
            id: "wa_sarah_1",
            appId: "app_whatsapp",
            title: "Sarah",
            body: "Did you see the news? 📰",
            icon: "/apps/whatsapp.png",
            priority: "default",
            threadKey: "chat_sarah",
          });

          notif.at("7s").show({
            id: "wa_mom_1",
            appId: "app_whatsapp",
            title: "Mom ❤️",
            body: "Call me when you get a chance",
            icon: "/apps/whatsapp.png",
            priority: "high",
            threadKey: "chat_mom",
          });

          // ═══════════════════════════════════════════════════════════════
          // SECTION 3: Tap Interaction
          // Shows: User taps notification → opens app → clears notification
          // ═══════════════════════════════════════════════════════════════

          notif.at("9s").tap("wa_mom_1");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 4: Swipe Dismiss
          // Shows: User swipes to dismiss notifications
          // ═══════════════════════════════════════════════════════════════

          notif.at("10.5s").swipe("wa_sarah_1", "right");
          notif.at("11s").swipe("wa_group_1", "right");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 5: Priority Levels
          // Shows: Critical (Uber), High (Calendar), Default (Instagram)
          // ═══════════════════════════════════════════════════════════════

          notif.at("13s").show({
            id: "uber_1",
            appId: "Uber",
            title: "Your ride is arriving!",
            body: "Toyota Camry • 2 min away",
            icon: "/apps/uber.png",
            priority: "critical",
          });

          notif.at("14s").show({
            id: "calendar_1",
            appId: "Calendar",
            title: "Meeting in 10 minutes",
            body: "Team Standup - Zoom",
            icon: "/apps/calendar.png",
            priority: "high",
            actions: [
              { id: "join", label: "Join" },
              { id: "snooze", label: "Snooze" },
            ],
          });

          notif.at("15s").show({
            id: "instagram_1",
            appId: "Instagram",
            title: "New follower",
            body: "@design_guru started following you",
            icon: "/apps/instagram.png",
            priority: "default",
          });

          notif.at("18s").dismiss("uber_1");
          notif.at("18.5s").tap("calendar_1");
          notif.at("19s").swipe("instagram_1", "right");

          // ═══════════════════════════════════════════════════════════════
          // SECTION 6: Grouped Notifications (Email)
          // Shows: Multiple emails grouped under same groupKey
          // ═══════════════════════════════════════════════════════════════

          notif.at("21s").show({
            id: "mail_1",
            appId: "Mail",
            title: "boss@company.com",
            body: "Q4 Report Review",
            icon: "/apps/mail.png",
            groupKey: "inbox",
          });

          notif.at("22s").show({
            id: "mail_2",
            appId: "Mail",
            title: "team@company.com",
            body: "Sprint Planning Notes",
            icon: "/apps/mail.png",
            groupKey: "inbox",
          });

          notif.at("23s").show({
            id: "mail_3",
            appId: "Mail",
            title: "hr@company.com",
            body: "Holiday Schedule Update",
            icon: "/apps/mail.png",
            groupKey: "inbox",
          });

          // ═══════════════════════════════════════════════════════════════
          // SECTION 7: Reply Action (WhatsApp)
          // Shows: Notification with reply capability
          // ═══════════════════════════════════════════════════════════════

          notif.at("25s").show({
            id: "wa_alex_2",
            appId: "app_whatsapp",
            title: "Alex",
            body: "So... lunch? 🍕",
            icon: "/apps/whatsapp.png",
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

          notif.at("29s").clearAll();
        },
      )

      .build(),
});
