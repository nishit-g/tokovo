import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { XTrackBuilder } from "@tokovo/apps-x";

export default defineEpisode({
  meta: {
    id: "x-anchor-tour",
    title: "X Anchor Tour",
    description: "Anchor-focused X episode that traverses timeline, notifications, DMs, and profile.",
    category: "production",
    tags: ["x", "anchors", "camera", "tour"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 570,
    apps: ["app_x"],
  },
  build: () =>
    episode("x-anchor-tour", {
      fps: 30,
      duration: "19s",
      title: "X Anchor Tour",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        os: {
          time: new Date("2025-02-11T19:20:00"),
          battery: 82,
          network: "5G",
        },
      })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Nishit",
            handle: "nishit",
            bio: "Narrative systems",
            followers: 21300,
            following: 520,
            verified: "blue",
          },
          {
            id: "u_lee",
            name: "Lee",
            handle: "lee_ui",
            bio: "UI and motion",
            followers: 10800,
            following: 410,
            verified: "gold",
          },
        ],
        currentUserId: "u_me",
        tweets: [
          {
            id: "tw_1",
            authorId: "u_lee",
            text: "Anchor-based camera is massively cleaner than manual keyframes.",
            createdAt: new Date("2025-02-11T19:15:00").getTime(),
            hashtags: ["camera", "ui"],
            mentions: [],
            viewCount: 9300,
            shareCount: 102,
            bookmarkCount: 240,
          },
        ],
        notifications: [
          {
            id: "nt_1",
            type: "mention",
            actorId: "u_lee",
            tweetId: "tw_1",
            isMention: true,
            createdAt: new Date("2025-02-11T19:18:00").getTime(),
          },
        ],
      })
      .view("app_x", "phone", {
        screen: "timeline",
        notificationsTab: "all",
      })
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone", getOrder),
        (x) => {
          x.at("2.8s").navigate("tweet", { tweetId: "tw_1" });
          x.at("5.2s").navigate("notifications");
          x.at("6.8s").navigate("messages");
          x.at("7.4s").createThread(["u_me", "u_lee"], "dm_anchor");
          x.at("8s").sendMessage({
            id: "msg_1",
            threadId: "dm_anchor",
            senderId: "u_lee",
            text: "Looks locked. Ship?",
          });
          x.at("8.6s").navigate("thread", { threadId: "dm_anchor" });
          x.at("11.2s").navigate("profile", { userId: "u_me" });
          x.at("14s").navigate("timeline");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("timeline_header", { scale: 1.07, duration: "0.45s" });
        cam.at("1.2s").focus("tweet_card", { scale: 1.11, duration: "0.45s" });
        cam.at("2.8s").focus("metrics_row", { scale: 1.09, duration: "0.4s" });
        cam.at("5.2s").focus("notifications_list", { scale: 1.08, duration: "0.45s" });
        cam.at("6.8s").focus("dm_thread", { scale: 1.08, duration: "0.45s" });
        cam.at("8.6s").focus("reply_composer", { scale: 1.07, duration: "0.4s" });
        cam.at("11.2s").focus("profile_header", { scale: 1.07, duration: "0.45s" });
        cam.at("14s").focus("timeline_feed", { scale: 1.05, duration: "0.45s" });
      })
      .build(),
});
