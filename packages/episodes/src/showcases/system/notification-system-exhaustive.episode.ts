import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "notification-system-exhaustive",
    title: "Notification System Exhaustive",
    description:
      "New notification showcase covering stack order, mixed-app interruptions, dismissals, taps, and lockscreen versus heads-up behavior.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 110,
    tags: ["system", "notifications", "stacking", "lockscreen", "headsup"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp", "app_instagram", "app_teams", "app_linkedin"],
  },
  build: () =>
    episode("notification-system-exhaustive", {
      fps: 30,
      duration: "30s",
      title: "Notification System Exhaustive",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "dark",
        locked: true,
        os: {
          time: new Date("2026-04-10T12:14:00Z"),
          battery: 88,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .deviceTrack("phone", (device) => {
        device.at("4.6s").unlock();
        device.at("10.0s").lock();
        device.at("15.5s").unlock();
      })
      .os((os) => {
        os.at("18.0s").dnd(true);
        os.at("23.0s").dnd(false);
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("0.8s").deliver({
          id: "n_whatsapp_1",
          appId: "app_whatsapp",
          content: { title: "Ava", body: "Need the new frame exports now." },
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "wa_ava",
          groupId: "wa_ava",
        });
        notifications.at("2.0s").deliver({
          id: "n_instagram_1",
          appId: "app_instagram",
          content: {
            title: "Instagram",
            body: "112 new comments on your post.",
          },
          interruption: "active",
          privacy: "public",
          threadId: "ig_post",
          groupId: "ig_post",
        });
        notifications.at("3.2s").deliver({
          id: "n_teams_1",
          appId: "app_teams",
          content: {
            title: "Launch War Room",
            body: "@you in release-blocker thread",
          },
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "teams_release",
          groupId: "teams_release",
        });
        notifications.at("5.0s").dismiss("n_instagram_1");
        notifications.at("6.0s").deliver({
          id: "n_linkedin_1",
          appId: "app_linkedin",
          content: {
            title: "Noor Ahmed",
            body: "Sent you an InMail about a design lead role.",
          },
          interruption: "active",
          privacy: "private",
          threadId: "li_inmail",
          groupId: "li_inmail",
        });
        notifications.at("8.0s").tap("n_teams_1");
        notifications.at("10.5s").deliver({
          id: "n_lock_wa",
          appId: "app_whatsapp",
          content: { title: "माँ", body: "खाना खा लिया?" },
          interruption: "active",
          privacy: "private",
          threadId: "wa_mom",
          groupId: "wa_mom",
        });
        notifications.at("12.8s").deliver({
          id: "n_lock_teams",
          appId: "app_teams",
          content: {
            title: "غرفة الإطلاق",
            body: "انضم إلى المكالمة خلال دقيقتين.",
          },
          interruption: "critical",
          privacy: "sensitive",
          previewPolicy: "never",
          threadId: "teams_exec",
          groupId: "teams_exec",
        });
        notifications.at("16.0s").dismiss("n_whatsapp_1");
        notifications.at("17.0s").dismiss("n_linkedin_1");
        notifications.at("19.0s").deliver({
          id: "n_instagram_2",
          appId: "app_instagram",
          content: {
            title: "Instagram",
            body: "Luca Frames mentioned you in a story reply.",
          },
          interruption: "active",
          privacy: "public",
          threadId: "ig_story",
          groupId: "ig_story",
        });
        notifications.at("21.0s").deliver({
          id: "n_teams_2",
          appId: "app_teams",
          content: {
            title: "Design Sync",
            body: "Critical approval needed despite Focus.",
          },
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "teams_design",
          groupId: "teams_design",
        });
        notifications.at("24.0s").openCenter();
        notifications.at("26.5s").dismiss("n_teams_2");
        notifications.at("28.0s").closeCenter();
      })
      .build(),
});
