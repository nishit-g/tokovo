import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";
import { xCinematicFlagship } from "./x-cinematic-flagship.camera.js";

const baseTime = new Date("2026-07-20T20:42:00.000Z").getTime();

export default defineEpisode({
  meta: {
    id: "x-cinematic-flagship",
    title: "X Cinematic Flagship",
    description:
      "A deterministic X film proving native-grade lights-out UI, exact entity cinematography, notifications, DMs, keyboard composition, polls, video state, and profiles.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_x",
    visibility: "public",
    sortOrder: 96,
    tags: ["x", "camera", "cinematic-subjects", "keyboard", "notifications", "dm", "poll", "video"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1260,
    apps: ["app_x"],
  },
  build: () =>
    episode("x-cinematic-flagship", {
      fps: 30,
      duration: "42s",
      title: "X Cinematic Flagship",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        appearance: "dark",
        theme: "x-lights-out",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 68, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .cinematics(xCinematicFlagship)
      .snapshot("app_x", "phone", {
        schemaVersion: 2,
        locale: "en-US",
        currentUserId: "x_me",
        users: [
          {
            id: "x_me",
            name: "Mira Chen",
            handle: "miramakes",
            bio: "Building the product. Showing the receipts.",
            bannerUrl: "/media/launch-board.svg",
            location: "San Francisco",
            website: "miramakes.example",
            joinedAt: baseTime - 82_000_000_000,
            followers: 128_400,
            following: 612,
            verified: "blue",
          },
          {
            id: "x_creator",
            name: "Noa Frames",
            handle: "noaframes",
            bio: "Product films, quiet cameras, sharp cuts.",
            bannerUrl: "/media/founder-whiteboard.jpg",
            location: "London",
            website: "noaframes.example",
            joinedAt: baseTime - 112_000_000_000,
            followers: 482_000,
            following: 341,
            verified: "gold",
          },
          {
            id: "x_editor",
            name: "Ava Stone",
            handle: "avacuts",
            bio: "Editing launch night in real time.",
            followers: 74_200,
            following: 508,
            verified: null,
          },
        ],
        follows: [
          { followerId: "x_me", followingId: "x_creator" },
          { followerId: "x_me", followingId: "x_editor" },
        ],
        tweets: [
          {
            id: "x_launch_cut",
            authorId: "x_creator",
            text: "The best launch film does not look expensive. It looks inevitable.",
            createdAt: baseTime - 130_000,
            media: {
              type: "image",
              urls: ["/media/founder-whiteboard.jpg"],
              aspect: "wide",
              alt: "A launch storyboard arranged on a whiteboard",
            },
            hashtags: ["productfilm", "launchday"],
            likeCount: 18_200,
            repostCount: 2_940,
            viewCount: 1_420_000,
            bookmarkCount: 9_840,
            shareCount: 4_220,
          },
          {
            id: "x_poll",
            authorId: "x_editor",
            text: "Which cut earns the first five seconds?",
            createdAt: baseTime - 92_000,
            poll: {
              options: [
                { id: "close", label: "The human close-up", votes: 642 },
                { id: "wide", label: "The product wide", votes: 511 },
                { id: "screen", label: "The screen recording", votes: 287 },
              ],
              totalVotes: 1_440,
              endsAt: baseTime + 82_800_000,
            },
            viewCount: 92_400,
            likeCount: 2_810,
            repostCount: 312,
          },
          {
            id: "x_video",
            authorId: "x_creator",
            text: "The clean cut, without the launch-night noise.",
            createdAt: baseTime - 58_000,
            media: {
              type: "video",
              urls: ["/media/launch-clip.mp4"],
              posterUrl: "/media/launch-board.svg",
              aspect: "wide",
              alt: "A short product launch film",
            },
            viewCount: 841_200,
            likeCount: 41_600,
            repostCount: 7_420,
            bookmarkCount: 18_300,
          },
        ],
        notifications: [
          {
            id: "x_nt_seed",
            type: "follow",
            actorId: "x_editor",
            createdAt: baseTime - 34_000,
            read: false,
          },
        ],
        threads: [
          {
            id: "x_launch_room",
            participantIds: ["x_me", "x_creator", "x_editor"],
            title: "Launch film",
            unreadCount: 1,
            pinned: true,
          },
        ],
        messages: [
          {
            id: "x_msg_seed",
            threadId: "x_launch_room",
            senderId: "x_creator",
            text: "The clean export is up. No more caveats.",
            createdAt: baseTime - 28_000,
          },
        ],
      }, { version: 2 })
      .view("app_x", "phone", {
        schemaVersion: 2,
        screen: "timeline",
        timelineTab: "forYou",
      }, { version: 2 })
      .x("phone", (x) => {
        x.at("1.2s").setTimelineTab("following");
        x.at("2.1s").setTimelineTab("forYou");
        x.at("3.8s").navigate("tweet", { tweetId: "x_launch_cut" });
        x.at("5.0s").likeTweet("x_launch_cut", "x_me");
        x.at("5.6s").bookmarkTweet("x_launch_cut", "x_me");
        x.at("7.4s").addNotification({
          id: "x_nt_mention",
          type: "mention",
          actorId: "x_editor",
          tweetId: "x_launch_cut",
          createdAt: baseTime + 7_400,
          title: "Ava mentioned you",
          body: "The clean cut is winning the thread.",
        });
        x.at("8.7s").navigate("notifications");
        x.at("9.4s").setNotificationsTab("mentions");
        x.at("10.4s").setNotificationsTab("all");
        x.at("12.2s").navigate("messages");
        x.at("13.0s").navigate("thread", { threadId: "x_launch_room" });
        x.at("13.5s").setThreadTyping("x_launch_room", "x_editor");
        x.at("14.2s").sendMessage({
          id: "x_msg_reply",
          threadId: "x_launch_room",
          senderId: "x_me",
          text: "Ship the clean cut. Let the product carry the frame.",
          createdAt: baseTime + 14_200,
          delivery: "sending",
        });
        x.at("15.0s").setMessageDelivery("x_msg_reply", "failed");
        x.at("16.1s").setMessageDelivery("x_msg_reply", "sending");
        x.at("16.8s").setMessageDelivery("x_msg_reply", "sent");
        x.at("17.4s").sendMessage({
          id: "x_msg_editor",
          threadId: "x_launch_room",
          senderId: "x_editor",
          text: "Done. The restrained camera makes it feel twice as confident.",
          createdAt: baseTime + 17_400,
        });
        x.at("19.7s").navigate("compose");
        x.at("20.2s").setComposeDraft("Good product films do not shout.");
        x.at("22.2s").setComposeDraft("Good product films do not shout. They make the next step obvious.");
        x.at("24.4s").setComposerStatus("failed", "Connection interrupted. Your draft is safe.");
        x.at("25.0s").setComposeDraft("Good product films do not shout. They make the next step obvious.");
        x.at("25.4s").setComposerStatus("sending");
        x.at("26.0s").postTweet({
          id: "x_authored_post",
          authorId: "x_me",
          text: "Good product films do not shout. They make the next step obvious.",
          createdAt: baseTime + 26_000,
          hashtags: ["productfilm"],
        });
        x.at("26.1s").setComposerStatus("idle");
        x.at("26.3s").navigate("tweet", { tweetId: "x_authored_post" });
        x.at("29.8s").navigate("tweet", { tweetId: "x_poll" });
        x.at("31.2s").votePoll("x_poll", "x_me", "close");
        x.at("33.8s").navigate("tweet", { tweetId: "x_video" });
        x.at("34.5s").setMediaPlayback("x_video", "playing", 0.12);
        x.at("36.2s").setMediaPlayback("x_video", "paused", 0.64);
        x.at("37.8s").navigate("profile", { userId: "x_creator" });
        x.at("39.0s").setProfileTab("media");
        x.at("40.2s").setProfileTab("posts");
      })
      .input("phone", "composer", {
        id: "x-flagship-compose",
        appId: "app_x",
        at: "20.2s",
        until: "25.7s",
        submitAt: "25.4s",
        locale: "en-US",
        text: "Good product films do not shout. They make the next step obvious.",
        expectedFinalValue: "Good product films do not shout. They make the next step obvious.",
        cadence: { style: "fast" },
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .build(),
});
