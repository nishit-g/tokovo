import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "notification-center-exhaustive",
    title: "Notification Center Exhaustive",
    description:
      "System pass for pull-down notification center, grouped app stacks, tap-to-open, clear-all, and panel close behavior.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 115,
    tags: ["system", "notifications", "notification-center", "panel", "stacking"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 930,
    apps: ["app_whatsapp", "app_instagram", "app_teams", "app_linkedin"],
  },
  build: () =>
    episode("notification-center-exhaustive", {
      fps: 30,
      duration: "31s",
      title: "Notification Center Exhaustive",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        screenRecording: true,
        os: {
          time: new Date("2026-04-10T12:24:00"),
          battery: 84,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .deviceTrack("phone", (d) => {
        d.at("0.9s").notificationShow({
          id: "nc_wa_1",
          appId: "app_whatsapp",
          title: "Ava",
          body: "We need the revised exports before lunch.",
          priority: "high",
          threadKey: "ops_ava",
        });
        d.at("1.6s").notificationShow({
          id: "nc_wa_2",
          appId: "app_whatsapp",
          title: "Launch Ops",
          body: "Pushing another version right now.",
          priority: "default",
          threadKey: "ops_ava",
        });
        d.at("2.5s").notificationShow({
          id: "nc_ig_1",
          appId: "app_instagram",
          title: "Instagram",
          body: "39 new comments on How reels are actually made.",
          priority: "high",
          threadKey: "ig_post_roast",
        });
        d.at("3.2s").notificationShow({
          id: "nc_teams_1",
          appId: "app_teams",
          title: "Exec Briefing",
          body: "Review the launch narrative before 1 PM.",
          priority: "default",
          threadKey: "teams_exec",
        });
        d.at("4.5s").notificationOpenPanel();
        d.at("7.0s").notificationDismiss("nc_teams_1");
        d.at("8.4s").notificationClosePanel();
        d.at("10.8s").notificationShow({
          id: "nc_li_1",
          appId: "app_linkedin",
          title: "Noor Ahmed",
          body: "Sent you an InMail: Principal Design role.",
          priority: "default",
          threadKey: "li_role",
        });
        d.at("12.0s").notificationOpenPanel();
        d.at("14.4s").notificationTap("nc_ig_1");
        d.at("17.5s").notificationShow({
          id: "nc_teams_2",
          appId: "app_teams",
          title: "War Room",
          body: "Call recording is ready to review.",
          priority: "high",
          threadKey: "teams_war_room",
        });
        d.at("18.3s").notificationShow({
          id: "nc_wa_3",
          appId: "app_whatsapp",
          title: "Maya",
          body: "Panel looks real now. Ship it.",
          priority: "default",
          threadKey: "maya_thread",
        });
        d.at("20.0s").notificationOpenPanel();
        d.at("23.0s").notificationClearAll();
        d.at("24.0s").notificationClosePanel();
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam.span("0.9s", "3.8s").trackCinematic("notification_banner", {
          scale: 1.15,
          smoothing: 0.18,
        });
        cam.at("4.6s").focus("device", { scale: 1.04, duration: "0.35s" });
        cam.at("12.1s").focus("device", { scale: 1.05, duration: "0.35s" });
        cam.at("14.5s").focus("device", { scale: 1.03, duration: "0.28s" });
        cam.at("20.1s").focus("device", { scale: 1.05, duration: "0.32s" });
      })
      .build(),
});
