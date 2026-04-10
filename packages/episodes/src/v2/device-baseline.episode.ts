import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-device-baseline",
    title: "V2 Baseline: Device Realism (Lockscreen → Unlock → App Switch)",
    description:
      "Baseline episode for future authoring: lockscreen notification, deterministic unlock, screen recording indicator, app open transition, and keyboard typing.",
    category: "showcase",
    tags: [
      "v2",
      "device",
      "lockscreen",
      "unlock",
      "recording",
      "keyboard",
      "transition",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 720,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("v2-device-baseline", { fps: 30, duration: "24s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        screenRecording: true,
        installedApps: ["app_whatsapp", "app_x", "app_camera"],
        os: {
          time: new Date("2025-06-26T09:41:00"),
          battery: 81,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_bait", name: "Mina", avatar: "/avatars/avatar-maya.jpg" },
        ],
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .deviceTrack("phone", (d) => {
        d.at("0.6s").notificationShow({
          id: "n1",
          appId: "app_whatsapp",
          title: "Mina",
          body: "Wake up. It started.",
          mode: "lockscreen",
          priority: "high",
        });
        d.at("2.6s").unlock();
        d.at("3.4s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .whatsapp("phone", "dm_bait", (wa) => {
        wa.switchTo("dm_bait", "0s");
        wa.at("4.2s").receive("Mina", "He posted a screenshot.");
        wa.at("5.3s").receive("Mina", "You're trending.");
        wa.at("7.0s").send("Link.", { typed: true, charDelay: 2 });
        wa.at("9.0s").receive("Mina", "Switching you to X.");
      })
      .deviceTrack("phone", (d) => {
        d.at("11.2s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "me",
            followers: 2100,
            following: 120,
            verified: null,
          },
          {
            id: "u_him",
            name: "Him",
            handle: "him",
            followers: 54000,
            following: 500,
            verified: "blue",
          },
        ],
        tweets: [
          {
            id: "tw_1",
            authorId: "u_him",
            text: "Receipts at 10.",
            viewCount: 84000,
            shareCount: 1400,
            bookmarkCount: 5200,
          },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .x("phone", (x) => {
        x.at("12.0s").navigate("timeline");
        x.at("13.2s").navigate("tweet", { tweetId: "tw_1" });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam
          .at("0.7s")
          .animate({ scale: 1.08, duration: "0.35s", easing: "easeOut" });
        cam
          .span("4.2s", "10.0s")
          .trackCinematic("lastMessage", { scale: 1.14, smoothing: 0.18 });
        cam.at("12.05s").focus("tweet_card", { scale: 1.1, duration: "0.4s" });
        cam
          .span("12.4s", "15.2s")
          .trackCinematic("tweet_card", { scale: 1.12, smoothing: 0.16 });
      })
      .build(),
});
