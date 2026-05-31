import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "multi-device-exhaustive",
    title: "Multi-Device Exhaustive",
    description:
      "Parallel two-device showcase proving stable split pacing, screen recording, and cross-app narrative continuity.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 140,
    tags: ["system", "multi-device", "split-screen", "recording", "parallel"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 990,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("multi-device-exhaustive", { fps: 30, duration: "33s", title: "Multi-Device Exhaustive" })
      .device("phone_left", "iphone16", {
        app: "app_whatsapp",
        screenRecording: true,
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2026-04-10T21:30:00"),
          battery: 72,
          network: "5G",
        },
      })
      .device("phone_right", "iphone16", {
        app: "app_x",
        screenRecording: true,
        installedApps: ["app_x"],
        os: {
          time: new Date("2026-04-10T21:30:00"),
          battery: 81,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .snapshot("app_whatsapp", "phone_left", {
        conversations: [
          { id: "dm_left", name: "Riya", avatar: "/avatars/avatar-maya.jpg", unreadCount: 2 },
        ],
      })
      .snapshot("app_x", "phone_right", {
        currentUserId: "u_me",
        users: [
          { id: "u_me", name: "Me", handle: "parallelcut", followers: 9200, following: 290, verified: "blue" },
          { id: "u_news", name: "Newsroom", handle: "newsroom", followers: 110200, following: 91, verified: "gold" },
        ],
        tweets: [
          { id: "tw_parallel", authorId: "u_news", text: "Tonight's leak is now a full public timeline event.", createdAt: new Date("2026-04-10T21:28:00").getTime(), viewCount: 210000, shareCount: 3200, bookmarkCount: 9200 },
        ],
      })
      .whatsapp("phone_left", "dm_left", (wa) => {
        wa.switchTo("dm_left", "1.0s");
        wa.at("2.0s").receive("Riya", "Please tell me you saw X.");
        wa.at("4.0s").send("I am literally watching it spiral live.", { typed: true, charDelay: 2 });
        wa.at("8.0s").receive("Riya", "Then do not reply to anyone yet.");
      })
      .x("phone_right", (x) => {
        x.at("1.2s").navigate("timeline");
        x.at("3.0s").navigate("tweet", { tweetId: "tw_parallel" });
        x.at("5.0s").replyTweet({
          id: "tw_parallel_reply",
          authorId: "u_me",
          replyToId: "tw_parallel",
          text: "This is why founders should fear screenshots more than competitors.",
          createdAt: new Date("2026-04-10T21:31:00").getTime(),
          typed: true,
          charDelay: 2,
        });
        x.at("9.0s").navigate("notifications");
      })
      .deviceTrack("phone_left", (d) => {
        d.at("0.0s").screenRecording(true, { mode: "compact" });
      })
      .deviceTrack("phone_right", (d) => {
        d.at("0.0s").screenRecording(true, { mode: "compact" });
        d.at("10.0s").notificationShow({
          id: "parallel_notif",
          appId: "app_whatsapp",
          title: "Riya",
          body: "Delete your reply. Now.",
          priority: "high",
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 0.94, duration: "0.35s" });
        cam.span("2.0s", "8.0s").trackCinematic(
          { deviceId: "phone_left", anchorId: "lastMessage" },
          { scale: 1.06, smoothing: 0.16 },
        );
        cam.span("3.0s", "9.0s").trackCinematic(
          { deviceId: "phone_right", anchorId: "tweet_card" },
          { scale: 1.06, smoothing: 0.16 },
        );
        cam.at("10.0s").focus("notification_banner", { scale: 1.08, duration: "0.3s" });
      })
      .build(),
});
