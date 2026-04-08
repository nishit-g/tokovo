import { defineEpisode } from "@tokovo/episodes";
import { episode } from "@tokovo/dsl";
import { XTrackBuilder } from "@tokovo/apps-x";

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
  build: () =>
    episode("mega-x", {
      fps: 30,
      duration: "25s",
      title: "Mega X",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        os: {
          time: new Date("2025-02-14T22:12:00"),
          battery: 68,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone", getOrder),
        (x) => {
          const baseTs = new Date("2025-02-14T22:10:00").getTime();

          x.seed(
            {
              users: [
                {
                  id: "u_me",
                  name: "Nish",
                  handle: "nishbuilds",
                  bio: "Shipping, screenshotting, and surviving founder takes.",
                  avatarUrl: "/placeholders/app-icon.svg?u=nish",
                  followers: 18300,
                  following: 489,
                  verified: "blue",
                },
                {
                  id: "u_founder",
                  name: "Aarav Singh",
                  handle: "aaravbuildsai",
                  bio: "Founder. Visionary. Sleep is a legacy tax.",
                  avatarUrl: "/placeholders/app-icon.svg?u=aarav",
                  followers: 97200,
                  following: 91,
                  verified: "gold",
                },
                {
                  id: "u_meme",
                  name: "MemeOps",
                  handle: "memeops",
                  bio: "Screenshots > strategy decks.",
                  avatarUrl: "/placeholders/app-icon.svg?u=meme",
                  followers: 41200,
                  following: 699,
                  verified: null,
                },
                {
                  id: "u_vc",
                  name: "Priya VC",
                  handle: "priyacapital",
                  bio: "Early stage investor. Strong opinions, weak coffee.",
                  avatarUrl: "/placeholders/app-icon.svg?u=vc",
                  followers: 28500,
                  following: 411,
                  verified: "grey",
                },
                {
                  id: "u_devrel",
                  name: "Kavya",
                  handle: "kavyacode",
                  bio: "DevRel, docs, and public bug funerals.",
                  avatarUrl: "/placeholders/app-icon.svg?u=kavya",
                  followers: 14400,
                  following: 510,
                  verified: null,
                },
              ],
              follows: [
                { followerId: "u_me", followingId: "u_founder" },
                { followerId: "u_me", followingId: "u_meme" },
                { followerId: "u_me", followingId: "u_vc" },
              ],
              currentUserId: "u_me",
              tweets: [
                {
                  id: "tw-hook",
                  authorId: "u_founder",
                  text:
                    "Hiring Founding Intern (unpaid): 20 hrs/day, no weekends, must own backend+frontend+founder therapy. Equity in vibes.",
                  hashtags: ["hiring", "startup"],
                  media: {
                    type: "image",
                    aspect: "wide",
                    urls: ["/placeholders/media.svg"],
                  },
                  createdAt: baseTs - 170_000,
                  viewCount: 182400,
                  shareCount: 1730,
                  bookmarkCount: 4200,
                },
                {
                  id: "tw-link",
                  authorId: "u_vc",
                  text: "Thread: Why founders confuse urgency with leadership.",
                  hashtags: ["startups", "leadership"],
                  linkPreview: {
                    url: "https://example.com/essay/founder-urgency",
                    domain: "example.com",
                    title: "Urgency Theater Is Not Leadership",
                    description:
                      "A practical guide to avoiding burnout culture disguised as ambition.",
                    imageUrl: "/placeholders/media.svg",
                  },
                  createdAt: baseTs - 260_000,
                  viewCount: 43100,
                  shareCount: 512,
                  bookmarkCount: 1700,
                },
                {
                  id: "tw-meme",
                  authorId: "u_meme",
                  text: "Bro posted a job description or a hostage note?",
                  mentions: ["u_founder"],
                  createdAt: baseTs - 90_000,
                  viewCount: 98200,
                  shareCount: 980,
                  bookmarkCount: 2700,
                },
              ],
              threads: [
                {
                  id: "dm-fire",
                  participantIds: ["u_me", "u_founder", "u_meme", "u_vc"],
                },
              ],
              messages: [
                {
                  id: "msg-seed-1",
                  threadId: "dm-fire",
                  senderId: "u_founder",
                  text: "Need damage control. Fast.",
                  createdAt: baseTs - 50_000,
                },
              ],
              notifications: [
                {
                  id: "nt-seed-1",
                  type: "mention",
                  actorId: "u_meme",
                  tweetId: "tw-hook",
                  isMention: true,
                  createdAt: baseTs - 35_000,
                },
              ],
            },
            "0s",
          );

          // Hook: react to the absurd hiring tweet.
          x.at("1.5s").likeTweet("tw-hook", "u_me");
          x.at("1.8s").shareTweet("tw-hook", "u_me");
          x.at("2.2s").navigate("tweet", { tweetId: "tw-hook" });

          // Compose a savage quote-post (typed).
          x.at("4.8s").navigate("compose");
          x.at("5.2s").postTweet({
            id: "tw-quote-burn",
            authorId: "u_me",
            quoteTweetId: "tw-hook",
            text:
              "Founding intern? Brother this is not a role, this is a side quest boss fight.",
            typed: true,
            charDelay: 1.8,
            createdAt: baseTs + 90_000,
            hashtags: ["startup", "founderlogic"],
            mentions: ["u_founder"],
          });
          x.at("6.6s").navigate("tweet", { tweetId: "tw-quote-burn" });

          // Explosion: notifications pile in.
          x.at("7.1s").addNotification({
            id: "nt-burst-1",
            type: "like",
            actorId: "u_vc",
            tweetId: "tw-quote-burn",
          });
          x.at("7.25s").addNotification({
            id: "nt-burst-2",
            type: "repost",
            actorId: "u_meme",
            tweetId: "tw-quote-burn",
          });
          x.at("7.4s").addNotification({
            id: "nt-burst-3",
            type: "mention",
            actorId: "u_devrel",
            tweetId: "tw-hook",
            isMention: true,
          });
          x.at("7.55s").addNotification({
            id: "nt-burst-4",
            type: "follow",
            actorId: "u_devrel",
          });
          x.at("8.1s").navigate("notifications");
          x.at("8.9s").setNotificationsTab("mentions");

          // Damage control: group DM starts melting.
          x.at("10s").navigate("messages");
          x.at("10.8s").sendMessage({
            id: "msg-fire-2",
            threadId: "dm-fire",
            senderId: "u_vc",
            text: "Bro your post is now in three investor WhatsApp groups.",
            createdAt: baseTs + 155_000,
          });
          x.at("11.2s").sendMessage({
            id: "msg-fire-3",
            threadId: "dm-fire",
            senderId: "u_meme",
            text: "Delete tweet or delete company. pick one.",
            createdAt: baseTs + 165_000,
          });
          x.at("11.9s").navigate("thread", { threadId: "dm-fire" });
          x.at("12.3s").sendMessage({
            id: "msg-fire-4",
            threadId: "dm-fire",
            senderId: "u_founder",
            text: "Can we call it an experiment in founder stamina?",
            createdAt: baseTs + 181_000,
          });
          x.at("12.9s").sendMessage({
            id: "msg-fire-5",
            threadId: "dm-fire",
            senderId: "u_me",
            text: "Call it what it is: unpaid internship cosplay.",
            createdAt: baseTs + 190_000,
            typed: true,
            charDelay: 1.6,
          });
          x.at("13.8s").sendMessage({
            id: "msg-fire-6",
            threadId: "dm-fire",
            senderId: "u_vc",
            text: "PR draft: 'that was satire' and maybe touch grass.",
            createdAt: baseTs + 204_000,
          });

          // Expose the persona.
          x.at("15.2s").navigate("profile", { userId: "u_founder" });
          x.at("16.8s").postTweet({
            id: "tw-founder-apology",
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
            authorId: "u_me",
            replyToId: "tw-founder-apology",
            text: "Series A in vibes, Series Z in common sense.",
            createdAt: baseTs + 296_000,
          });
        },
      )
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
      .build(),
});
