import { defineEpisode } from "@tokovo/episodes";
import {
  applyStudioStoryKitConfig,
  storyEpisode,
} from "../story-kit/index.js";
import { megaXStoryKitConfig } from "./mega-x.story-kit.js";

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
    const ep = applyStudioStoryKitConfig(storyEpisode("mega-x", {
      fps: 30,
      duration: "25s",
      title: "Mega X",
    }), megaXStoryKitConfig);

    const kit = ep.kit();
    const meUser = kit.project.xUser("me", {
      bio: "Shipping, screenshotting, and surviving founder takes.",
      followers: 18300,
      following: 489,
      verified: "blue",
    });
    const founderUser = kit.project.xUser("founder", {
      bio: "Founder. Visionary. Sleep is a legacy tax.",
      followers: 97200,
      following: 91,
      verified: "gold",
    });
    const memeUser = kit.project.xUser("meme", {
      bio: "Screenshots > strategy decks.",
      followers: 41200,
      following: 699,
      verified: null,
    });
    const vcUser = kit.project.xUser("vc", {
      bio: "Early stage investor. Strong opinions, weak coffee.",
      followers: 28500,
      following: 411,
      verified: "grey",
    });
    const phone = kit.project.device("main_phone", {
      profile: "iphone16",
      app: "app_x",
      os: {
        time: new Date("2025-02-14T22:12:00"),
        battery: 68,
        network: "5G",
      },
    });
    const baseTs = new Date("2025-02-14T22:10:00").getTime();

    return ep
      .background(kit.background ?? { type: "image", src: "/backgrounds/night-window.png" })
      .device("phone", phone.profile, phone.options)
      .x("phone", (x) => {
        x.seed(
          {
            users: [meUser, founderUser, memeUser, vcUser],
            follows: [
              { followerId: meUser.id, followingId: founderUser.id },
              { followerId: meUser.id, followingId: memeUser.id },
              { followerId: meUser.id, followingId: vcUser.id },
            ],
            currentUserId: meUser.id,
            tweets: [
              {
                id: "tw-hook",
                authorId: founderUser.id,
                text:
                  "Hiring Founding Intern (unpaid): 20 hrs/day, no weekends, must own backend+frontend+founder therapy. Equity in vibes.",
                hashtags: ["hiring", "startup"],
                media: {
                  type: "image",
                  aspect: "wide",
                  urls: [kit.asset("founder_whiteboard")],
                },
                createdAt: baseTs - 170_000,
                viewCount: 182400,
                shareCount: 1730,
                bookmarkCount: 4200,
              },
              {
                id: "tw-link",
                authorId: vcUser.id,
                text: "Thread: Why founders confuse urgency with leadership.",
                hashtags: ["startups", "leadership"],
                linkPreview: {
                  url: "https://example.com/essay/founder-urgency",
                  domain: "example.com",
                  title: "Urgency Theater Is Not Leadership",
                  description:
                    "A practical guide to avoiding burnout culture disguised as ambition.",
                  imageUrl: kit.asset("blog_launch", "linkPreviewImages"),
                },
                createdAt: baseTs - 260_000,
                viewCount: 43100,
                shareCount: 512,
                bookmarkCount: 1700,
              },
              {
                id: "tw-meme",
                authorId: memeUser.id,
                text: "Bro posted a job description or a hostage note?",
                mentions: [founderUser.id],
                createdAt: baseTs - 90_000,
                viewCount: 98200,
                shareCount: 980,
                bookmarkCount: 2700,
              },
            ],
            threads: [
              {
                id: "dm-fire",
                participantIds: [
                  meUser.id,
                  founderUser.id,
                  memeUser.id,
                  vcUser.id,
                ],
              },
            ],
            messages: [
              {
                id: "msg-seed-1",
                threadId: "dm-fire",
                senderId: founderUser.id,
                text: "Need damage control. Fast.",
                createdAt: baseTs - 50_000,
              },
            ],
            notifications: [
              {
                id: "nt-seed-1",
                type: "mention",
                actorId: memeUser.id,
                tweetId: "tw-hook",
                isMention: true,
                createdAt: baseTs - 35_000,
              },
            ],
          },
          "0s",
        );

        // Hook: react to the absurd hiring tweet.
        x.at("1.5s").likeTweet("tw-hook", meUser.id);
        x.at("1.8s").shareTweet("tw-hook", meUser.id);
        x.at("2.2s").navigate("tweet", { tweetId: "tw-hook" });

        // Compose a savage quote-post (typed).
        x.at("4.8s").navigate("compose");
        x.at("5.2s").postTweet({
          id: "tw-quote-burn",
          authorId: meUser.id,
          quoteTweetId: "tw-hook",
          text:
            "Founding intern? Brother this is not a role, this is a side quest boss fight.",
          typed: true,
          charDelay: 1.8,
          createdAt: baseTs + 90_000,
          hashtags: ["startup", "founderlogic"],
          mentions: [founderUser.id],
        });
        x.at("6.6s").navigate("tweet", { tweetId: "tw-quote-burn" });

        // Explosion: notifications pile in.
        x.at("7.1s").addNotification({
          id: "nt-burst-1",
          type: "like",
          actorId: vcUser.id,
          tweetId: "tw-quote-burn",
        });
        x.at("7.25s").addNotification({
          id: "nt-burst-2",
          type: "repost",
          actorId: memeUser.id,
          tweetId: "tw-quote-burn",
        });
        x.at("7.4s").addNotification({
          id: "nt-burst-3",
          type: "mention",
          actorId: vcUser.id,
          tweetId: "tw-hook",
          isMention: true,
        });
        x.at("7.55s").addNotification({
          id: "nt-burst-4",
          type: "follow",
          actorId: vcUser.id,
        });
        x.at("8.1s").navigate("notifications");
        x.at("8.9s").setNotificationsTab("mentions");

        // Damage control: group DM starts melting.
        x.at("10s").navigate("messages");
        x.at("10.8s").sendMessage({
          id: "msg-fire-2",
          threadId: "dm-fire",
          senderId: vcUser.id,
          text: "Bro your post is now in three investor WhatsApp groups.",
          createdAt: baseTs + 155_000,
        });
        x.at("11.2s").sendMessage({
          id: "msg-fire-3",
          threadId: "dm-fire",
          senderId: memeUser.id,
          text: "Delete tweet or delete company. pick one.",
          createdAt: baseTs + 165_000,
        });
        x.at("11.9s").navigate("thread", { threadId: "dm-fire" });
        x.at("12.3s").sendMessage({
          id: "msg-fire-4",
          threadId: "dm-fire",
          senderId: founderUser.id,
          text: "Can we call it an experiment in founder stamina?",
          createdAt: baseTs + 181_000,
        });
        x.at("12.9s").sendMessage({
          id: "msg-fire-5",
          threadId: "dm-fire",
          senderId: meUser.id,
          text: "Call it what it is: unpaid internship cosplay.",
          createdAt: baseTs + 190_000,
          typed: true,
          charDelay: 1.6,
        });
        x.at("13.8s").sendMessage({
          id: "msg-fire-6",
          threadId: "dm-fire",
          senderId: vcUser.id,
          text: "PR draft: 'that was satire' and maybe touch grass.",
          createdAt: baseTs + 204_000,
        });

        // Expose the persona.
        x.at("15.2s").navigate("profile", { userId: founderUser.id });
        x.at("16.8s").postTweet({
          id: "tw-founder-apology",
          authorId: founderUser.id,
          text:
            "Clarification: previous intern post was satire. We deeply value sleep, labor law, and human knees.",
          createdAt: baseTs + 228_000,
          linkPreview: {
            url: "https://example.com/blog/culture-update",
            domain: "example.com",
            title: "Culture Update",
            description:
              "We are committed to healthy work rhythms and clear hiring practices.",
            imageUrl: kit.asset("product_hunt", "linkPreviewImages"),
          },
          viewCount: 9400,
          shareCount: 210,
          bookmarkCount: 410,
        });

        // Payoff.
        x.at("18.1s").navigate("timeline");
        x.at("19.2s").navigate("tweet", { tweetId: "tw-founder-apology" });
        x.at("21.4s").navigate("timeline");
        x.at("22.2s").replyTweet({
          id: "tw-final-punch",
          authorId: meUser.id,
          replyToId: "tw-founder-apology",
          text: "Series A in vibes, Series Z in common sense.",
          createdAt: baseTs + 296_000,
        });
      })
      .camera((cam) => {
        // Hook -> inspect -> compose -> explosion -> damage control -> expose -> payoff.
        cam.at("0s").focus("timeline_primary_content", {
          scale: 1.09,
          duration: "0.45s",
        });
        cam.at("2.2s").focus("tweet_detail_media", {
          scale: 1.08,
          duration: "0.42s",
        });
        cam.at("4.9s").focus("compose_editor", {
          scale: 1.08,
          duration: "0.45s",
        });
        cam.at("8.1s").focus("notifications_row_0_content", {
          scale: 1.11,
          duration: "0.34s",
        });
        cam.at("8.2s").shake({
          intensityX: 1.6,
          intensityY: 1.2,
          frequency: 19,
          decay: 0.9,
          duration: "0.24s",
        });
        cam.at("10s").focus("dm_row_0_content", {
          scale: 1.08,
          duration: "0.38s",
        });
        cam.at("12.9s").focus("reply_input", {
          scale: 1.1,
          duration: "0.4s",
        });
        cam.at("15.2s").focus("profile_avatar", {
          scale: 1.09,
          duration: "0.4s",
        });
        cam.at("18.1s").focus("timeline_primary_actions", {
          scale: 1.08,
          duration: "0.4s",
        });
        cam.at("21.4s").focus("device", { scale: 1.02, duration: "0.42s" });
      })
      .build();
  },
});
