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
    episode("notification-system-exhaustive", { fps: 30, duration: "30s", title: "Notification System Exhaustive" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2026-04-10T12:14:00"),
          battery: 88,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .deviceTrack("phone", (d) => {
        d.at("0.8s").notificationShow({
          id: "n_whatsapp_1",
          appId: "app_whatsapp",
          title: "Ava",
          body: "Need the new frame exports now.",
          priority: "high",
          threadKey: "wa_ava",
        });
        d.at("2.0s").notificationShow({
          id: "n_instagram_1",
          appId: "app_instagram",
          title: "Instagram",
          body: "112 new comments on your post.",
          priority: "default",
          threadKey: "ig_post",
        });
        d.at("3.2s").notificationShow({
          id: "n_teams_1",
          appId: "app_teams",
          title: "Launch War Room",
          body: "@you in release-blocker thread",
          priority: "high",
          threadKey: "teams_release",
        });
        d.at("5.0s").notificationDismiss("n_instagram_1");
        d.at("6.0s").notificationShow({
          id: "n_linkedin_1",
          appId: "app_linkedin",
          title: "Noor Ahmed",
          body: "Sent you an InMail about a design lead role.",
          priority: "default",
          threadKey: "li_inmail",
        });
        d.at("8.0s").notificationTap("n_teams_1");
        d.at("10.5s").notificationShow({
          id: "n_lock_wa",
          appId: "app_whatsapp",
          title: "Mom",
          body: "Have you eaten?",
          mode: "lockscreen",
          priority: "default",
          threadKey: "wa_mom",
        });
        d.at("12.8s").notificationShow({
          id: "n_lock_teams",
          appId: "app_teams",
          title: "Exec Briefing",
          body: "Join call in 2 minutes.",
          mode: "lockscreen",
          priority: "high",
          threadKey: "teams_exec",
        });
        d.at("16.0s").notificationDismiss("n_whatsapp_1");
        d.at("17.0s").notificationDismiss("n_linkedin_1");
        d.at("19.0s").notificationShow({
          id: "n_instagram_2",
          appId: "app_instagram",
          title: "Instagram",
          body: "Luca Frames mentioned you in a story reply.",
          priority: "high",
          threadKey: "ig_story",
        });
        d.at("21.0s").notificationTap("n_instagram_2");
        d.at("24.0s").notificationShow({
          id: "n_teams_2",
          appId: "app_teams",
          title: "Design Sync",
          body: "Call recording is ready.",
          priority: "default",
          threadKey: "teams_design",
        });
        d.at("26.5s").notificationDismiss("n_teams_2");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.3s" });
        cam.span("0.8s", "4.4s").trackCinematic("notification_banner", { scale: 1.16, smoothing: 0.16 });
        cam.at("8.0s").focus("notification_banner", { scale: 1.1, duration: "0.3s" });
        cam.at("10.6s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("12.8s", "15.8s").trackCinematic("notification_banner", { scale: 1.12, smoothing: 0.18 });
        cam.at("21.0s").focus("notification_banner", { scale: 1.08, duration: "0.25s" });
      })
      .build(),
});
