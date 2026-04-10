import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { CameraDirectorPlugin } from "@tokovo/compiler";

export default defineEpisode({
  meta: {
    id: "camera-anchor-exhaustive",
    title: "Camera Anchor Exhaustive",
    description:
      "Fresh camera pass proving deterministic anchor tracking across list, detail, thread, composer, and notification surfaces.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 120,
    tags: ["system", "camera", "anchors", "focus", "deterministic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 960,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("camera-anchor-exhaustive", { fps: 30, duration: "32s", title: "Camera Anchor Exhaustive" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2026-04-10T18:20:00"),
          battery: 69,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_mina", name: "Mina", avatar: "/avatars/avatar-maya.jpg", unreadCount: 1, isPinned: true },
          { id: "group_frames", name: "Frame Notes", type: "group", unreadCount: 6, participants: ["me", "Mina", "Aki"] },
        ],
      })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          { id: "u_me", name: "Me", handle: "anchorworks", followers: 8900, following: 280, verified: "blue" },
          { id: "u_cam", name: "Cam Nerd", handle: "camnerd", followers: 34400, following: 512, verified: null },
        ],
        tweets: [
          { id: "tw_anchor_1", authorId: "u_cam", text: "If your app has no anchors your camera is just guessing.", createdAt: new Date("2026-04-10T18:10:00").getTime(), viewCount: 14200, shareCount: 220, bookmarkCount: 1100 },
        ],
      })
      .deviceTrack("phone", (d) => {
        d.at("12.0s").notificationShow({
          id: "anchor_notif",
          appId: "app_whatsapp",
          title: "Frame Notes",
          body: "New thread mention from Aki.",
          priority: "high",
        });
        d.at("17.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .whatsapp("phone", "dm_mina", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("dm_mina", "1.2s");
        wa.at("2.2s").receive("Mina", "Test the list anchor first.");
        wa.at("3.6s").send("Now watch it stick to the bubble.", { typed: true, charDelay: 2 });
        wa.openChatList("6.0s");
        wa.switchTo("group_frames", "7.2s");
        wa.at("8.4s").receive("Aki", "Thread card should be the next focus target.");
        wa.at("10.0s").send("Then the notification banner.", { typed: true, charDelay: 2 });
      })
      .x("phone", (x) => {
        x.at("17.8s").navigate("timeline");
        x.at("19.2s").navigate("tweet", { tweetId: "tw_anchor_1" });
        x.at("21.0s").replyTweet({
          id: "tw_anchor_reply",
          authorId: "u_me",
          replyToId: "tw_anchor_1",
          text: "Good anchors make cameras feel intentional instead of frantic.",
          createdAt: new Date("2026-04-10T18:23:00").getTime(),
          typed: true,
          charDelay: 2,
        });
        x.at("24.2s").navigate("compose");
        x.at("25.0s").setComposeDraft("Anchor choreography is part of product quality.");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("0.8s").focus("chat_list", { scale: 1.04, duration: "0.35s" });
        cam.span("2.2s", "5.2s").trackCinematic("lastMessage", { scale: 1.14, smoothing: 0.16 });
        cam.at("7.3s").focus("thread_card", { scale: 1.08, duration: "0.35s" });
        cam.at("12.0s").focus("notification_banner", { scale: 1.12, duration: "0.28s" });
        cam.at("19.3s").focus("tweet_card", { scale: 1.1, duration: "0.35s" });
        cam.span("21.0s", "24.0s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.18 });
      })
      .use(new CameraDirectorPlugin({ style: "organic" }))
      .build(),
});
