import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "x-flagship-v2",
    title: "X Flagship V2",
    description:
      "Fresh X flagship proving timeline, tweet detail, notifications, DMs, and profile navigation with a public-ready script.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_x",
    visibility: "public",
    sortOrder: 200,
    tags: ["x", "flagship", "timeline", "notifications", "messages", "profile"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1050,
    apps: ["app_x"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T22:20:00").getTime();

    return episode("x-flagship-v2", {
      fps: 30,
      duration: "35s",
      title: "X Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        installedApps: ["app_x"],
        os: {
          time: new Date("2026-04-10T22:22:00"),
          battery: 74,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          {
            id: "u_me",
            name: "Nadia",
            handle: "nadiaops",
            bio: "Shipping, receipts, and stubborn timelines.",
            followers: 18200,
            following: 520,
            verified: "blue",
          },
          {
            id: "u_founder_v2",
            name: "Founder",
            handle: "nightfounder",
            bio: "Every launch is a plot twist.",
            followers: 92400,
            following: 144,
            verified: "gold",
          },
          {
            id: "u_meme_v2",
            name: "Meme Patrol",
            handle: "memepatrol",
            bio: "We archive bad takes for public good.",
            followers: 60800,
            following: 404,
            verified: null,
          },
        ],
        follows: [
          { followerId: "u_me", followingId: "u_founder_v2" },
          { followerId: "u_me", followingId: "u_meme_v2" },
        ],
        tweets: [
          {
            id: "tw_flagship_hook_v2",
            authorId: "u_founder_v2",
            text: "Launching a product at midnight is just drama with operational consequences.",
            createdAt: baseTs - 120000,
            viewCount: 88200,
            shareCount: 1800,
            bookmarkCount: 5400,
            hashtags: ["launchnight", "founder"],
            media: { type: "image", aspect: "wide", urls: ["/placeholders/media.svg"] },
          },
        ],
        threads: [{ id: "dm_founder_v2", participantIds: ["u_me", "u_founder_v2", "u_meme_v2"] }],
        messages: [
          {
            id: "msg_seed_founder_v2",
            threadId: "dm_founder_v2",
            senderId: "u_founder_v2",
            text: "If this tweet backfires, we were joking.",
            createdAt: baseTs - 45000,
          },
        ],
        notifications: [
          {
            id: "nt_seed_x_v2",
            type: "mention",
            actorId: "u_meme_v2",
            tweetId: "tw_flagship_hook_v2",
            isMention: true,
            createdAt: baseTs - 32000,
          },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .x("phone", (x) => {
        x.at("1.6s").navigate("timeline");
        x.at("3.0s").navigate("tweet", { tweetId: "tw_flagship_hook_v2" });
        x.at("4.6s").replyTweet({
          id: "tw_flagship_reply_v2",
          authorId: "u_me",
          replyToId: "tw_flagship_hook_v2",
          text: "Operational consequences is the most honest launch metric I've seen this year.",
          typed: true,
          charDelay: 2,
          createdAt: baseTs + 10000,
        });
        x.at("7.8s").addNotification({
          id: "nt_flagship_like_v2",
          type: "like",
          actorId: "u_meme_v2",
          tweetId: "tw_flagship_reply_v2",
        });
        x.at("8.4s").addNotification({
          id: "nt_flagship_follow_v2",
          type: "follow",
          actorId: "u_meme_v2",
        });
        x.at("9.2s").navigate("notifications");
        x.at("10.0s").setNotificationsTab("all");
        x.at("12.0s").navigate("messages");
        x.at("13.0s").navigate("thread", { threadId: "dm_founder_v2" });
        x.at("14.2s").sendMessage({
          id: "msg_founder_v2_2",
          threadId: "dm_founder_v2",
          senderId: "u_meme_v2",
          text: "Too late. Screenshot accounts are already in love with this post.",
          createdAt: baseTs + 28000,
        });
        x.at("16.0s").sendMessage({
          id: "msg_founder_v2_3",
          threadId: "dm_founder_v2",
          senderId: "u_me",
          text: "Then let them work. We need better copy, not a better excuse.",
          createdAt: baseTs + 35000,
          typed: true,
          charDelay: 2,
        });
        x.at("19.8s").navigate("profile", { userId: "u_founder_v2" });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("3.1s").focus("tweet_card", { scale: 1.1, duration: "0.4s" });
        cam.span("4.6s", "7.0s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.18 });
        cam.at("9.3s").focus("notification_card", { scale: 1.08, duration: "0.35s" });
        cam.at("13.1s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("19.9s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
