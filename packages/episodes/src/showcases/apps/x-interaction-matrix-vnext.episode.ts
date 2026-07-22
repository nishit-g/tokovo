import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";

const baseTime = new Date("2026-07-20T18:30:00.000Z").getTime();

export default defineEpisode({
  meta: {
    id: "x-interaction-matrix-vnext",
    title: "X Interaction Matrix VNext",
    description:
      "A two-platform X proof covering iOS light, Android dim, Arabic RTL, timeline content types, notification filters, DMs, compose, and deterministic failure states.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_x",
    visibility: "public",
    sortOrder: 97,
    tags: ["x", "ios", "android", "themes", "rtl", "localization", "interactions"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 960,
    apps: ["app_x"],
  },
  build: () =>
    episode("x-interaction-matrix-vnext", {
      fps: 30,
      duration: "32s",
      title: "X Interaction Matrix VNext",
    })
      .device("ios_light", "iphone16", {
        app: "app_x",
        appearance: "light",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 76, network: "5G" },
      })
      .device("android_ar", "pixel", {
        app: "app_x",
        appearance: "dark",
        theme: "x-dim",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 84, network: "wifi" },
      })
      .background("studio-quiet-dark")
      .snapshot("app_x", "ios_light", {
        schemaVersion: 2,
        locale: "en-US",
        currentUserId: "ios_me",
        users: [
          {
            id: "ios_me",
            name: "Leah Park",
            handle: "leahbuilds",
            bio: "Design systems and release notes.",
            followers: 42_800,
            following: 510,
            verified: "blue",
          },
          {
            id: "ios_author",
            name: "Studio Index",
            handle: "studioindex",
            followers: 190_200,
            following: 88,
            verified: "gold",
          },
        ],
        tweets: [
          {
            id: "ios_link",
            authorId: "ios_author",
            text: "The release notes are finally as considered as the product.",
            createdAt: baseTime - 82_000,
            linkPreview: {
              url: "https://example.com/release",
              domain: "example.com",
              title: "Release 2.0: a calmer, faster studio",
              description: "The rendering and authoring changes behind the new release.",
              imageUrl: "/media/launch-board.svg",
            },
            viewCount: 118_000,
            likeCount: 7_840,
            repostCount: 912,
          },
          {
            id: "ios_sensitive",
            authorId: "ios_author",
            text: "A behind-the-scenes frame from the unreleased cut.",
            createdAt: baseTime - 46_000,
            media: {
              type: "image",
              urls: ["/media/office-meme.png"],
              aspect: "square",
              sensitive: true,
              alt: "An obscured behind-the-scenes production frame",
            },
            viewCount: 64_200,
          },
        ],
        notifications: [
          { id: "ios_verified", type: "verified", actorId: "ios_author", createdAt: baseTime - 22_000 },
        ],
        threads: [{ id: "ios_dm", participantIds: ["ios_me", "ios_author"], pinned: true }],
        messages: [
          {
            id: "ios_dm_seed",
            threadId: "ios_dm",
            senderId: "ios_author",
            text: "Can you sanity-check the release thread?",
            createdAt: baseTime - 18_000,
          },
        ],
      }, { version: 2 })
      .view("app_x", "ios_light", { schemaVersion: 2, screen: "timeline" }, { version: 2 })
      .snapshot("app_x", "android_ar", {
        schemaVersion: 2,
        locale: "ar-SA",
        currentUserId: "ar_me",
        users: [
          {
            id: "ar_me",
            name: "نور خالد",
            handle: "noorcreates",
            bio: "منتجات رقمية وأفلام قصيرة.",
            followers: 31_600,
            following: 402,
            verified: "blue",
          },
          {
            id: "ar_author",
            name: "غرفة الإطلاق",
            handle: "launchroomar",
            followers: 224_000,
            following: 74,
            verified: "gold",
          },
        ],
        tweets: [
          {
            id: "ar_quote_source",
            authorId: "ar_author",
            text: "النسخة النهائية هادئة وواضحة وسريعة.",
            createdAt: baseTime - 110_000,
            viewCount: 88_200,
            likeCount: 6_300,
          },
          {
            id: "ar_quote",
            authorId: "ar_me",
            text: "هذا ما يحدث عندما تخدم الكاميرا المنتج بدلًا من استعراض نفسها.",
            quoteTweetId: "ar_quote_source",
            createdAt: baseTime - 62_000,
            viewCount: 42_100,
            likeCount: 4_220,
            repostCount: 680,
          },
        ],
        notifications: [
          {
            id: "ar_mention",
            type: "mention",
            actorId: "ar_author",
            tweetId: "ar_quote",
            isMention: true,
            createdAt: baseTime - 16_000,
          },
        ],
        threads: [{ id: "ar_dm", participantIds: ["ar_me", "ar_author"], unreadCount: 2 }],
        messages: [
          {
            id: "ar_dm_seed",
            threadId: "ar_dm",
            senderId: "ar_author",
            text: "هل ننشر النسخة النهائية الآن؟",
            createdAt: baseTime - 12_000,
          },
        ],
      }, { version: 2 })
      .view("app_x", "android_ar", { schemaVersion: 2, screen: "timeline" }, { version: 2 })
      .x("ios_light", (x) => {
        x.at("2s").navigate("tweet", { tweetId: "ios_link" });
        x.at("4s").likeTweet("ios_link", "ios_me");
        x.at("5s").unlikeTweet("ios_link", "ios_me");
        x.at("6s").bookmarkTweet("ios_link", "ios_me");
        x.at("8s").navigate("notifications");
        x.at("9s").setNotificationsTab("verified");
        x.at("11s").navigate("thread", { threadId: "ios_dm" });
        x.at("12s").sendMessage({
          id: "ios_dm_reply",
          threadId: "ios_dm",
          senderId: "ios_me",
          text: "Yes. The hierarchy reads cleanly now.",
          createdAt: baseTime + 12_000,
          delivery: "sent",
        });
        x.at("16s").navigate("profile", { userId: "ios_me" });
        x.at("18s").setProfileTab("likes");
        x.at("20s").setProfileTab("media");
      })
      .x("android_ar", (x) => {
        x.at("2.5s").navigate("tweet", { tweetId: "ar_quote" });
        x.at("5.5s").shareTweet("ar_quote", "ar_me");
        x.at("8.5s").navigate("notifications");
        x.at("9.5s").setNotificationsTab("mentions");
        x.at("12s").navigate("thread", { threadId: "ar_dm" });
        x.at("13s").setThreadTyping("ar_dm", "ar_author");
        x.at("15s").sendMessage({
          id: "ar_dm_reply",
          threadId: "ar_dm",
          senderId: "ar_me",
          text: "نعم، انشرها الآن. الإيقاع واضح.",
          createdAt: baseTime + 15_000,
          delivery: "sending",
        });
        x.at("16s").setMessageDelivery("ar_dm_reply", "sent");
        x.at("19s").navigate("compose");
        x.at("19.5s").setComposeDraft("النسخة النظيفة تتحدث عن نفسها.");
        x.at("24.5s").setComposerStatus("sending");
        x.at("25s").postTweet({
          id: "ar_new_post",
          authorId: "ar_me",
          text: "النسخة النظيفة تتحدث عن نفسها.",
          createdAt: baseTime + 25_000,
        });
        x.at("25.1s").setComposerStatus("idle");
        x.at("25.3s").navigate("tweet", { tweetId: "ar_new_post" });
      })
      .input("android_ar", "composer", {
        id: "x-arabic-compose",
        appId: "app_x",
        at: "19.5s",
        until: "25.2s",
        submitAt: "24.5s",
        locale: "ar-SA",
        direction: "auto",
        text: "النسخة النظيفة تتحدث عن نفسها.",
        expectedFinalValue: "النسخة النظيفة تتحدث عن نفسها.",
        cadence: { style: "fast" },
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .build(),
});
