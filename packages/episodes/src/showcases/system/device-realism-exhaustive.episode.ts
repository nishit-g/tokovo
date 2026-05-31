import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { KeyboardPlugin } from "@tokovo/compiler";
import { createInstagramTrackBuilder } from "@tokovo/apps-instagram";

export default defineEpisode({
  meta: {
    id: "device-realism-exhaustive",
    title: "Device Realism Exhaustive",
    description:
      "Production device pass covering lockscreen bait, unlock, app transitions, keyboard lift, and cross-app continuity.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 100,
    tags: ["system", "device", "lockscreen", "unlock", "keyboard", "transitions"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1080,
    apps: ["app_whatsapp", "app_instagram", "app_x"],
  },
  build: () =>
    episode("device-realism-exhaustive", { fps: 30, duration: "36s", title: "Device Realism Exhaustive" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        screenRecording: true,
        installedApps: ["app_whatsapp", "app_instagram", "app_x", "app_camera"],
        os: {
          time: new Date("2026-04-10T08:46:00"),
          battery: 77,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_ops", name: "Ops Lead", avatar: "/avatars/avatar-ava.jpg", unreadCount: 2, isPinned: true },
          { id: "group_launch", name: "Launch Night", type: "group", unreadCount: 4, participants: ["me", "Mina", "Ravi"] },
        ],
      })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_me",
        users: [
          { id: "ig_me", username: "studio.mira", displayName: "Mira Studio", avatarUrl: "/avatars/avatar-zoe.jpg", followers: 50120, following: 412, verified: true },
          { id: "ig_noa", username: "noa.frames", displayName: "Noa Frames", avatarUrl: "/avatars/avatar-priya.jpg", followers: 18220, following: 211 },
        ],
        posts: [
          { id: "ig_seed_1", authorId: "ig_me", imageUrl: "/placeholders/media.svg", caption: "Launch stills before sunrise.", createdAt: new Date("2026-04-10T08:15:00").getTime(), likeCount: 4211, commentCount: 186, aspect: "portrait" },
        ],
      })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          { id: "u_me", name: "Me", handle: "opsnarrative", followers: 12200, following: 380, verified: "blue" },
          { id: "u_leak", name: "Leak Watch", handle: "leakwatch", followers: 84200, following: 180, verified: null },
        ],
        tweets: [
          { id: "tw_seed_1", authorId: "u_leak", text: "Something launches in 30 minutes. You can feel the panic.", createdAt: new Date("2026-04-10T08:40:00").getTime(), viewCount: 50400, shareCount: 812, bookmarkCount: 2100 },
        ],
      })
      .deviceTrack("phone", (d) => {
        d.at("0.7s").notificationShow({
          id: "notif_lock_wa",
          appId: "app_whatsapp",
          title: "Ops Lead",
          body: "Wake up. Rollback decision in 4 min.",
          mode: "lockscreen",
          priority: "high",
        });
        d.at("3.0s").unlock();
        d.at("3.7s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
        d.at("9.8s").keyboardShow({ returnKeyType: "send" });
        d.at("10.2s").keyboardType("On it. Give me sixty seconds.", { speed: "natural" });
        d.at("12.6s").keyboardHide();
        d.at("14.0s").notificationShow({
          id: "notif_headsup_ig",
          appId: "app_instagram",
          title: "Noa Frames",
          body: "Your teaser post is getting ratioed in comments.",
          mode: "headsup",
          priority: "default",
        });
        d.at("16.0s").openApp("app_instagram", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
        d.at("23.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .whatsapp("phone", "dm_ops", (wa) => {
        wa.switchTo("dm_ops", "4.2s");
        wa.at("5.0s").receive("Ops Lead", "QA missed one screenshot in the deck.");
        wa.at("6.4s").send("Patch is already exporting.", { typed: true, charDelay: 2 });
        wa.at("8.2s").receive("Ops Lead", "Good. Move the team back into launch thread.");
      })
      .track("app_instagram", (getOrder) => createInstagramTrackBuilder(30, "phone", getOrder), (ig: any) => {
        ig.at("16.8s").navigate("home");
        ig.at("18.0s").commentOnPost({ postId: "ig_seed_1", authorId: "ig_noa", text: "Comments are moving faster than the edit.", createdAt: new Date("2026-04-10T08:47:00").getTime() });
        ig.at("19.2s").notify({ type: "comment", actorId: "ig_noa", postId: "ig_seed_1", title: "Noa Frames", body: "Comments are moving faster than the edit." });
        ig.at("20.6s").navigate("notifications");
      })
      .x("phone", (x) => {
        x.at("23.8s").navigate("timeline");
        x.at("25.0s").navigate("tweet", { tweetId: "tw_seed_1" });
        x.at("26.2s").replyTweet({
          id: "tw_reply_device",
          authorId: "u_me",
          replyToId: "tw_seed_1",
          text: "Panic is just pre-launch cardio.",
          createdAt: new Date("2026-04-10T08:49:00").getTime(),
          typed: true,
          charDelay: 2,
        });
        x.at("28.8s").navigate("notifications");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam.at("0.8s").focus("notification_banner", { scale: 1.08, duration: "0.35s" });
        cam.span("4.8s", "8.8s").trackCinematic("lastMessage", { scale: 1.14, smoothing: 0.18 });
        cam.at("10.0s").focus("keyboard", { scale: 1.12, duration: "0.25s" });
        cam.at("17.0s").focus("feed_post", { scale: 1.08, duration: "0.35s" });
        cam.at("25.2s").focus("tweet_card", { scale: 1.1, duration: "0.35s" });
      })
      .use(new KeyboardPlugin())
      .build(),
});
