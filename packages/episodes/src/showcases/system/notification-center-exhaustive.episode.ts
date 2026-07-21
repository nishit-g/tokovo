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
    tags: [
      "system",
      "notifications",
      "notification-center",
      "panel",
      "stacking",
    ],
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
          time: new Date("2026-04-10T12:24:00Z"),
          battery: 84,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .notificationTrack("phone", (notifications) => {
        notifications.at("0.9s").deliver({
          id: "nc_wa_1",
          appId: "app_whatsapp",
          content: {
            title: "Ava",
            body: "We need the revised exports before lunch.",
            avatar: { src: "/avatars/avatar-ava.jpg", alt: "Ava" },
          },
          interruption: "timeSensitive",
          foregroundBehavior: "present",
          privacy: "private",
          threadId: "ops_ava",
          groupId: "ops_ava",
        });
        notifications.at("1.6s").deliver({
          id: "nc_wa_2",
          appId: "app_whatsapp",
          content: {
            title: "Launch Ops",
            body: "Pushing another version right now.",
          },
          interruption: "active",
          privacy: "private",
          threadId: "ops_ava",
          groupId: "ops_ava",
        });
        notifications.at("2.5s").deliver({
          id: "nc_ig_1",
          appId: "app_instagram",
          content: {
            title: "Instagram",
            body: "39 new comments on How reels are actually made.",
          },
          interruption: "timeSensitive",
          privacy: "public",
          threadId: "ig_post_banter",
          groupId: "ig_post_banter",
        });
        notifications.at("3.2s").deliver({
          id: "nc_teams_1",
          appId: "app_teams",
          content: {
            title: "Exec Briefing",
            body: "Review the launch narrative before 1 PM.",
          },
          interruption: "active",
          privacy: "private",
          threadId: "teams_exec",
          groupId: "teams_exec",
        });
        notifications.at("4.5s").openCenter();
        notifications.at("7.0s").dismiss("nc_teams_1");
        notifications.at("8.4s").closeCenter();
        notifications.at("10.8s").deliver({
          id: "nc_li_1",
          appId: "app_linkedin",
          content: {
            title: "Noor Ahmed",
            body: "Sent you an InMail: Principal Design role.",
          },
          interruption: "active",
          privacy: "private",
          threadId: "li_role",
          groupId: "li_role",
        });
        notifications.at("12.0s").openCenter();
        notifications.at("14.4s").tap("nc_ig_1");
        notifications.at("17.5s").deliver({
          id: "nc_teams_2",
          appId: "app_teams",
          content: {
            title: "War Room",
            body: "Call recording is ready to review.",
          },
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "teams_war_room",
          groupId: "teams_war_room",
        });
        notifications.at("18.3s").deliver({
          id: "nc_wa_3",
          appId: "app_whatsapp",
          content: { title: "Maya", body: "Panel looks real now. Ship it." },
          interruption: "active",
          privacy: "private",
          threadId: "maya_thread",
          groupId: "maya_thread",
        });
        notifications.at("20.0s").openCenter();
        notifications.at("23.0s").clearAll();
        notifications.at("24.0s").closeCenter();
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam.span("0.9s", "3.8s").trackCinematic("notification.banner", {
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
