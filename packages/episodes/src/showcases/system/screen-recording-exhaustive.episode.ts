import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "screen-recording-exhaustive",
    title: "Screen Recording Exhaustive",
    description:
      "Recording realism pass covering active capture chrome, stop feedback, restart countdown, and app switching continuity.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 110,
    tags: ["system", "screen-recording", "ios", "dynamic-island", "status-bar"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 990,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("screen-recording-exhaustive", {
      fps: 30,
      duration: "33s",
      title: "Screen Recording Exhaustive",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        screenRecording: true,
        installedApps: ["app_whatsapp", "app_x"],
        os: {
          time: new Date("2026-04-10T21:10:00"),
          battery: 71,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_record_v2", name: "Mina", avatar: "/avatars/avatar-maya.jpg", unreadCount: 1, isPinned: true },
        ],
      })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          { id: "u_me", name: "Me", handle: "narrativeops", followers: 12800, following: 420, verified: "blue" },
          { id: "u_cam", name: "Cam Review", handle: "camreview", followers: 40200, following: 280, verified: null },
        ],
        tweets: [
          { id: "tw_rec_1", authorId: "u_cam", text: "If your recording chrome looks fake, the whole video looks fake.", createdAt: new Date("2026-04-10T21:05:00").getTime(), viewCount: 21100, shareCount: 380, bookmarkCount: 1200 },
        ],
      })
      .whatsapp("phone", "dm_record_v2", (wa) => {
        wa.switchTo("dm_record_v2", "0.8s");
        wa.at("1.6s").receive("Mina", "Does the recording chrome survive app switches?");
        wa.at("3.0s").send("It should feel like iOS, not a watermark.", { typed: true, charDelay: 2 });
      })
      .x("phone", (x) => {
        x.at("12.2s").navigate("timeline");
        x.at("13.8s").navigate("tweet", { tweetId: "tw_rec_1" });
        x.at("16.0s").replyTweet({
          id: "tw_rec_reply",
          authorId: "u_me",
          replyToId: "tw_rec_1",
          text: "The tiniest OS details are the whole trick.",
          createdAt: new Date("2026-04-10T21:12:00").getTime(),
          typed: true,
          charDelay: 2,
        });
      })
      .deviceTrack("phone", (d) => {
        d.at("5.5s").screenRecording(false, { mode: "compact" });
        d.at("7.0s").screenRecording(true, { mode: "compact" });
        d.at("10.8s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
        d.at("19.5s").goHome({
          transition: { durationFrames: 18, style: "iosZoom" },
        });
        d.at("21.0s").lock();
        d.at("23.0s").unlock();
        d.at("24.2s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.35s" });
        cam.at("5.6s").focus("dynamicIsland", { scale: 1.2, duration: "0.25s" });
        cam.at("7.1s").focus("dynamicIsland", { scale: 1.2, duration: "0.25s" });
        cam.at("11.0s").focus("dynamicIsland", { scale: 1.16, duration: "0.3s" });
        cam.at("13.9s").focus("tweet_card", { scale: 1.08, duration: "0.35s" });
        cam.at("21.2s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("24.4s").focus("dynamicIsland", { scale: 1.18, duration: "0.3s" });
      })
      .build(),
});
