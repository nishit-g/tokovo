import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";
import { xTheLastFrameCamera } from "./x-the-last-frame.camera.js";

const baseTime = new Date("2026-07-23T20:30:00.000Z").getTime();
const revealText = "If you found the private build, stay until the last frame.";

export default defineEpisode({
  meta: {
    id: "x-the-last-frame",
    title: "The Last Frame",
    description:
      "A launch-night X thriller where a private build leaks from the founder's own laptop—and her response reveals the leak was part of the film.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 110,
    tags: [
      "story",
      "x",
      "thriller",
      "camera",
      "keyboard",
      "notifications",
      "dm",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1140,
    apps: ["app_x"],
  },
  build: () =>
    episode("x-the-last-frame", {
      fps: 30,
      duration: "38s",
      title: "The Last Frame",
    })
      .device("phone", "iphone16", {
        app: "app_x",
        appearance: "dark",
        theme: "x-lights-out",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 61, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .cinematics(xTheLastFrameCamera)
      .snapshot(
        "app_x",
        "phone",
        {
          schemaVersion: 2,
          locale: "en-US",
          currentUserId: "x_mira",
          users: [
            {
              id: "x_mira",
              name: "Mira Chen",
              handle: "mirachen",
              bio: "Building Orbit in public. Mostly.",
              bannerUrl: "/media/launch-board.svg",
              location: "San Francisco",
              website: "orbit.example",
              joinedAt: baseTime - 94_000_000_000,
              followers: 184_200,
              following: 418,
              verified: "blue",
            },
            {
              id: "x_noa",
              name: "Noa Park",
              handle: "noapark",
              bio: "Launch operations. Calm until proven otherwise.",
              followers: 42_800,
              following: 601,
              verified: "blue",
            },
            {
              id: "x_index_zero",
              name: "Index Zero",
              handle: "indexzero",
              bio: "The internet notices first.",
              followers: 312_000,
              following: 84,
              verified: "grey",
            },
          ],
          follows: [
            { followerId: "x_mira", followingId: "x_noa" },
            { followerId: "x_mira", followingId: "x_index_zero" },
          ],
          tweets: [
            {
              id: "x_launch_post",
              authorId: "x_mira",
              text: "Nobody outside this room has seen Orbit. First look, live in five.",
              createdAt: baseTime - 92_000,
              media: {
                type: "image",
                urls: ["/media/launch-board.svg"],
                aspect: "wide",
                alt: "The Orbit launch film storyboard",
              },
              hashtags: ["OrbitLive"],
              likeCount: 8_420,
              repostCount: 1_310,
              viewCount: 482_000,
              bookmarkCount: 2_104,
              shareCount: 918,
            },
          ],
          threads: [
            {
              id: "x_launch_ops",
              participantIds: ["x_mira", "x_noa"],
              title: "Launch ops",
              unreadCount: 0,
              pinned: true,
            },
          ],
          messages: [
            {
              id: "x_msg_seed",
              threadId: "x_launch_ops",
              senderId: "x_noa",
              text: "Going dark until the demo. Good luck up there.",
              createdAt: baseTime - 34_000,
            },
          ],
        },
        { version: 2 },
      )
      .view(
        "app_x",
        "phone",
        {
          schemaVersion: 2,
          screen: "timeline",
          timelineTab: "forYou",
        },
        { version: 2 },
      )
      .x("phone", (x) => {
        x.at("3.3s").replyTweet({
          id: "x_intrusion_reply",
          authorId: "x_index_zero",
          replyToId: "x_launch_post",
          text: "Then why is the private demo already indexed?",
          createdAt: baseTime + 3_300,
          linkPreview: {
            url: "https://orbit.example/internal/demo",
            domain: "orbit.example",
            title: "Orbit — internal demo",
            description: "Unlisted build · uploaded 9 minutes ago",
          },
          viewCount: 31_400,
          likeCount: 2_910,
          repostCount: 804,
        });
        x.at("4.4s").navigate("tweet", { tweetId: "x_launch_post" });
        x.at("8.2s").addNotification({
          id: "x_queue_alert",
          type: "mention",
          actorId: "x_noa",
          tweetId: "x_intrusion_reply",
          isMention: true,
          createdAt: baseTime + 8_200,
          title: "Noa mentioned you",
          body: "That post was not in the launch queue.",
        });
        x.at("9.0s").navigate("notifications");
        x.at("11.5s").navigate("messages");
        x.at("12.3s").navigate("thread", { threadId: "x_launch_ops" });
        x.at("12.8s").setThreadTyping("x_launch_ops", "x_noa");
        x.at("13.8s").sendMessage({
          id: "x_msg_token",
          threadId: "x_launch_ops",
          senderId: "x_noa",
          text: "The publish token was used from your laptop.",
          createdAt: baseTime + 13_800,
        });
        x.at("13.9s").setThreadTyping("x_launch_ops", null);
        x.at("16.4s").sendMessage({
          id: "x_msg_stage",
          threadId: "x_launch_ops",
          senderId: "x_mira",
          text: "My laptop is on the stage.",
          createdAt: baseTime + 16_400,
          delivery: "sending",
        });
        x.at("16.9s").setMessageDelivery("x_msg_stage", "sent");
        x.at("18.6s").sendMessage({
          id: "x_msg_kill",
          threadId: "x_launch_ops",
          senderId: "x_noa",
          text: "Then I kill the token and pull the post.",
          createdAt: baseTime + 18_600,
        });
        x.at("20.8s").sendMessage({
          id: "x_msg_hold",
          threadId: "x_launch_ops",
          senderId: "x_mira",
          text: "Don't. Leave it live.",
          createdAt: baseTime + 20_800,
        });
        x.at("22.4s").sendMessage({
          id: "x_msg_why",
          threadId: "x_launch_ops",
          senderId: "x_noa",
          text: "Why?",
          createdAt: baseTime + 22_400,
        });
        x.at("24.2s").navigate("compose");
        x.at("26.4s").setComposeDraft("If you found the private build,");
        x.at("28.2s").setComposeDraft(
          "If you found the private build, stay until",
        );
        x.at("30.1s").setComposeDraft(revealText);
        x.at("30.5s").setComposerStatus("sending");
        x.at("31.0s").postTweet({
          id: "x_last_frame",
          authorId: "x_mira",
          text: revealText,
          createdAt: baseTime + 31_000,
          hashtags: ["OrbitLive"],
        });
        x.at("31.1s").setComposerStatus("idle");
        x.at("31.2s").navigate("tweet", { tweetId: "x_last_frame" });
        x.at("34.2s").addNotification({
          id: "x_you_knew",
          type: "reply",
          actorId: "x_noa",
          tweetId: "x_last_frame",
          createdAt: baseTime + 34_200,
          title: "Noa replied",
          body: "Wait. You knew?",
        });
      })
      .input("phone", "composer", {
        id: "x-last-frame-compose",
        appId: "app_x",
        at: "24.8s",
        until: "30.7s",
        submitAt: "30.5s",
        locale: "en-US",
        text: revealText,
        expectedFinalValue: revealText,
        cadence: { style: "fast" },
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("34.2s").deliver({
          id: "x-last-frame-reply-banner",
          appId: "app_x",
          content: {
            title: "Noa",
            body: "Wait. You knew?",
          },
          category: "social",
          interruption: "timeSensitive",
          privacy: "public",
          foregroundBehavior: "present",
          threadId: "x_launch_ops",
          metadata: { kind: "reply", route: "thread" },
        });
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("THE PRIVATE DEMO WAS ALREADY PUBLIC.", {
          durationFrames: 82,
          intensity: 0.92,
        });
        overlay.at("14.2s").receipt("THE TOKEN CAME FROM HER LAPTOP.", {
          durationFrames: 60,
          intensity: 0.78,
        });
        overlay.at("35.0s").cliffhanger("SHE KNEW.", {
          durationFrames: 78,
          intensity: 0.9,
        });
      })
      .audio((audio) => {
        audio.span("0s", "38s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.17,
          fadeIn: "1.4s",
          fadeOut: "2.6s",
        });
      })
      .build(),
});
