import { defineEpisode } from "@tokovo/episodes";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "mega-x",
    title: "Mega X",
    description:
      "Cinematic X showcase: founder gets roasted, quote-post goes viral, notifications explode, and group DM damage control collapses.",
    category: "production",
    tags: ["x", "mega", "camera", "cinematic", "comedy"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 750,
    apps: ["app_x"],
  },
  build: () => {
    const baseTs = new Date("2025-02-14T22:10:00").getTime();

    return episode("mega-x", {
      fps: 30,
      duration: "25s",
      title: "Mega X",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        installedApps: ["app_x"],
        os: {
          time: new Date("2025-02-14T22:12:00"),
          battery: 68,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "operator",
            bio: "Shipping, screenshotting, and surviving founder takes.",
            followers: 18300,
            following: 489,
            verified: "blue",
          },
          {
            id: "u_founder",
            name: "Founder",
            handle: "foundervibes",
            bio: "Visionary. Sleep is a legacy tax.",
            followers: 97200,
            following: 91,
            verified: "gold",
          },
          {
            id: "u_meme",
            name: "Meme",
            handle: "deckleaks",
            bio: "Screenshots > strategy decks.",
            followers: 41200,
            following: 699,
            verified: null,
          },
          {
            id: "u_vc",
            name: "VC",
            handle: "termcheetah",
            bio: "Early stage investor. Strong opinions, weak coffee.",
            followers: 28500,
            following: 411,
            verified: "grey",
          },
        ],
        follows: [
          { followerId: "u_me", followingId: "u_founder" },
          { followerId: "u_me", followingId: "u_meme" },
          { followerId: "u_me", followingId: "u_vc" },
        ],
        tweets: [
          {
            id: "tw_hook",
            authorId: "u_founder",
            text:
              "Hiring Founding Intern (unpaid): 20 hrs/day, no weekends, must own backend+frontend+founder therapy. Equity in vibes.",
            createdAt: baseTs - 170_000,
            viewCount: 182400,
            shareCount: 1730,
            bookmarkCount: 4200,
            hashtags: ["hiring", "startup"],
            media: {
              type: "image",
              aspect: "wide",
              urls: ["/placeholders/media.svg"],
            },
          },
          {
            id: "tw_meme",
            authorId: "u_meme",
            text: "Bro posted a job description or a hostage note?",
            createdAt: baseTs - 90_000,
            viewCount: 98200,
            shareCount: 980,
            bookmarkCount: 2700,
            mentions: ["u_founder"],
          },
        ],
        threads: [
          {
            id: "dm_fire",
            participantIds: ["u_me", "u_founder", "u_meme", "u_vc"],
          },
        ],
        messages: [
          {
            id: "msg_seed_1",
            threadId: "dm_fire",
            senderId: "u_founder",
            text: "Need damage control. Fast.",
            createdAt: baseTs - 50_000,
          },
        ],
        notifications: [
          {
            id: "nt_seed_1",
            type: "mention",
            actorId: "u_meme",
            tweetId: "tw_hook",
            isMention: true,
            createdAt: baseTs - 35_000,
          },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .x("phone", (x) => {
        x.at("1.5s").likeTweet("tw_hook", "u_me");
        x.at("1.8s").shareTweet("tw_hook", "u_me");
        x.at("2.2s").navigate("tweet", { tweetId: "tw_hook" });
        x.at("4.8s").navigate("compose");
        x.at("5.2s").postTweet({
          id: "tw_quote_burn",
          authorId: "u_me",
          quoteTweetId: "tw_hook",
          text:
            "Founding intern? Brother this is not a role, this is a side quest boss fight.",
          typed: true,
          charDelay: 2,
          createdAt: baseTs + 90_000,
          hashtags: ["startup", "founderlogic"],
          mentions: ["u_founder"],
        });
        x.at("6.8s").navigate("tweet", { tweetId: "tw_quote_burn" });
        x.at("7.3s").addNotification({
          id: "nt_burst_1",
          type: "like",
          actorId: "u_vc",
          tweetId: "tw_quote_burn",
        });
        x.at("7.5s").addNotification({
          id: "nt_burst_2",
          type: "repost",
          actorId: "u_meme",
          tweetId: "tw_quote_burn",
        });
        x.at("7.8s").addNotification({
          id: "nt_burst_3",
          type: "follow",
          actorId: "u_vc",
        });
        x.at("8.4s").navigate("notifications");
        x.at("9.0s").setNotificationsTab("mentions");
        x.at("10.2s").navigate("messages");
        x.at("11.0s").sendMessage({
          id: "msg_fire_2",
          threadId: "dm_fire",
          senderId: "u_vc",
          text: "Bro your post is now in three investor WhatsApp groups.",
          createdAt: baseTs + 155_000,
        });
        x.at("11.5s").sendMessage({
          id: "msg_fire_3",
          threadId: "dm_fire",
          senderId: "u_meme",
          text: "Delete tweet or delete company. Pick one.",
          createdAt: baseTs + 165_000,
        });
        x.at("11.9s").navigate("thread", { threadId: "dm_fire" });
        x.at("12.6s").sendMessage({
          id: "msg_fire_4",
          threadId: "dm_fire",
          senderId: "u_founder",
          text: "Can we call it an experiment in founder stamina?",
          createdAt: baseTs + 181_000,
        });
        x.at("13.2s").sendMessage({
          id: "msg_fire_5",
          threadId: "dm_fire",
          senderId: "u_me",
          text: "Call it what it is: unpaid internship cosplay.",
          createdAt: baseTs + 190_000,
          typed: true,
          charDelay: 2,
        });
        x.at("15.2s").navigate("profile", { userId: "u_founder" });
        x.at("16.8s").postTweet({
          id: "tw_founder_apology",
          authorId: "u_founder",
          text:
            "Clarification: previous intern post was satire. We deeply value sleep, labor law, and human knees.",
          createdAt: baseTs + 228_000,
          linkPreview: {
            url: "https://example.com/blog/culture-update",
            domain: "example.com",
            title: "Culture Update",
            description:
              "We are committed to healthy work rhythms and clear hiring practices.",
            imageUrl: "/placeholders/media.svg",
          },
        });
        x.at("18.4s").navigate("tweet", { tweetId: "tw_founder_apology" });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("2.25s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam.span("5.2s", "6.6s").trackCinematic("keyboard", { scale: 1.14, smoothing: 0.18 });
        cam.at("8.45s").focus("notification_card", { scale: 1.1, duration: "0.35s" });
        cam.at("11.95s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("18.45s").focus("tweet_card", { scale: 1.08, duration: "0.4s" });
      })
      .build();
  },
});
