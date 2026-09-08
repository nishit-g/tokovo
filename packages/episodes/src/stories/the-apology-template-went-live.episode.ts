import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";
import { theApologyTemplateWentLiveCamera } from "./the-apology-template-went-live.camera.js";

const baseTime = new Date("2026-07-23T22:10:00.000Z").getTime();
const publicReply = "For legal reasons, that bracket was director's commentary.";

export default defineEpisode({
  meta: {
    id: "the-apology-template-went-live",
    title: "The Apology Template Went Live",
    description:
      "One phone ricochets from a WhatsApp war room to a public X disaster, an Instagram meme, and the CEO's deeply unhelpful verdict.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 115,
    tags: [
      "story",
      "multi-app",
      "whatsapp",
      "x",
      "instagram",
      "comedy",
      "camera",
      "keyboard",
      "notifications",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1260,
    apps: ["app_whatsapp", "app_x", "app_instagram"],
  },
  build: () =>
    episode("the-apology-template-went-live", {
      fps: 30,
      duration: "42s",
      title: "The Apology Template Went Live",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        installedApps: ["app_whatsapp", "app_x", "app_instagram"],
        os: { time: baseTime, battery: 47, network: "5G" },
      })
      .background("signal-pop")
      .cinematics(theApologyTemplateWentLiveCamera)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "wa_war_room",
            name: "Launch War Room",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 0,
            isPinned: true,
            type: "group",
            members: [
              {
                id: "me",
                name: "You",
                accentColor: "#F16B4F",
                onAccentColor: "#171C31",
              },
              {
                id: "mira",
                name: "Mira",
                accentColor: "#16B8C9",
                onAccentColor: "#171C31",
              },
              {
                id: "dev",
                name: "Dev",
                accentColor: "#E5A13B",
                onAccentColor: "#171C31",
              },
              {
                id: "legal",
                name: "Legal",
                accentColor: "#7650BD",
                onAccentColor: "#FFF8EF",
              },
            ],
          },
          {
            id: "wa_ceo_dm",
            name: "CEO",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 0,
            isPinned: true,
            type: "dm",
            members: [
              {
                id: "me",
                name: "You",
                accentColor: "#F16B4F",
                onAccentColor: "#171C31",
              },
              {
                id: "ceo",
                name: "CEO",
                accentColor: "#7650BD",
                onAccentColor: "#FFF8EF",
              },
            ],
          },
        ],
      })
      .snapshot(
        "app_x",
        "phone",
        {
          schemaVersion: 2,
          locale: "en-US",
          currentUserId: "x_me",
          users: [
            {
              id: "x_me",
              name: "Orbit",
              handle: "orbit",
              bio: "Tools for people who ship.",
              followers: 284_000,
              following: 164,
              verified: "blue",
            },
            {
              id: "x_brand",
              name: "Orbit Support",
              handle: "orbit_support",
              bio: "Official support. Apparently also official screenwriter.",
              followers: 91_200,
              following: 42,
              verified: "grey",
            },
            {
              id: "x_commenter",
              name: "Aisha",
              handle: "aishasays",
              bio: "I read the fine print so you do not have to.",
              followers: 118_400,
              following: 602,
              verified: "blue",
            },
          ],
          tweets: [
            {
              id: "x_apology_template",
              authorId: "x_brand",
              text: "We take full accountability. [INSERT LEGAL-APPROVED APOLOGY]",
              createdAt: baseTime - 54_000,
              media: {
                type: "image",
                urls: ["/media/apology-template.svg"],
                aspect: "wide",
                alt: "A launch team staring at the wrong export",
              },
              likeCount: 48_600,
              repostCount: 12_900,
              viewCount: 2_400_000,
              bookmarkCount: 8_100,
              shareCount: 19_400,
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
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_me",
        users: [
          {
            id: "ig_me",
            username: "orbit",
            displayName: "Orbit",
            avatarUrl: "/avatars/avatar-zoe.jpg",
            followers: 312000,
            following: 204,
            verified: true,
          },
          {
            id: "ig_meme_desk",
            username: "meme.desk",
            displayName: "Meme Desk",
            avatarUrl: "/avatars/avatar-priya.jpg",
            followers: 882000,
            following: 91,
            verified: true,
          },
          {
            id: "ig_editor",
            username: "dev.cuts",
            displayName: "Dev Cuts",
            avatarUrl: "/avatars/avatar-alex.jpg",
            followers: 24200,
            following: 318,
          },
        ],
        posts: [
          {
            id: "ig_apology_post",
            authorId: "ig_meme_desk",
            imageUrl: "/media/apology-template.svg",
            caption: "Corporate accountability speedrun. New record.",
            createdAt: baseTime - 12_000,
            likeCount: 164000,
            commentCount: 9400,
            aspect: "portrait",
          },
        ],
        storySets: [
          {
            id: "ig_apology_story_set",
            userId: "ig_meme_desk",
            items: [
              {
                id: "ig_accountability_speedrun",
                authorId: "ig_meme_desk",
                mediaUrl: "/media/apology-template.svg",
                createdAt: baseTime - 9_000,
                accentColor: "#ff5a5f",
              },
              {
                id: "ig_template_pending",
                authorId: "ig_meme_desk",
                mediaUrl: "/media/launch-board.svg",
                createdAt: baseTime - 7_000,
                accentColor: "#7c3aed",
              },
            ],
          },
        ],
        threads: [
          {
            id: "ig_launch_dm",
            participantIds: ["ig_me", "ig_editor"],
            title: "Dev Cuts",
            unreadCount: 1,
            pinned: true,
          },
        ],
        messages: [
          {
            id: "ig_dm_seed",
            threadId: "ig_launch_dm",
            senderId: "ig_editor",
            text: "Clean export is live.",
            createdAt: baseTime - 6_000,
          },
        ],
      })
      .deviceTrack("phone", (device) => {
        device.at("9.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "platform-default" },
        });
        device.at("23.5s").openApp("app_instagram", {
          transition: { durationFrames: 18, style: "platform-default" },
        });
        device.at("33.5s").openApp("app_whatsapp", {
          transition: { durationFrames: 18, style: "platform-default" },
        });
      })
      .whatsapp("phone", "wa_war_room", (whatsapp) => {
        whatsapp.switchTo("wa_war_room", "0.2s");
        whatsapp
          .at("1.2s")
          .receive("Mira", "Which genius uploaded FINAL_USE_THIS_v7.mp4?", {
            messageId: "wa_missing_file",
          });
        whatsapp.span("2.4s", "3.5s").typing("Legal");
        whatsapp
          .at("3.6s")
          .receive(
            "Legal",
            "Because the subtitle says [INSERT LEGAL-APPROVED APOLOGY].",
            { messageId: "wa_legal_copy" },
          );
        whatsapp.span("6.4s", "7.2s").typing("Dev");
        whatsapp.at("7.3s").receive("Dev", "Do not open X.", {
          messageId: "wa_do_not_open_x",
        });
      })
      .x("phone", (x) => {
        x.at("9.5s").navigate("tweet", { tweetId: "x_apology_template" });
        x.at("13.2s").replyTweet({
          id: "x_honest_reply",
          authorId: "x_commenter",
          replyToId: "x_apology_template",
          text: "Most honest brand apology this quarter.",
          createdAt: baseTime + 13_200,
          likeCount: 18_400,
          repostCount: 3_200,
          viewCount: 410_000,
        });
        x.at("16.5s").navigate("compose");
        x.at("21.2s").postTweet(
          {
            id: "x_directors_commentary",
            authorId: "x_me",
            text: publicReply,
            createdAt: baseTime + 21_200,
            likeCount: 0,
            repostCount: 0,
            viewCount: 1,
          },
          {
            input: {
              duration: "3.4s",
              id: "x-directors-commentary-input",
              style: "fast",
              keyboard: { appearance: "light" },
            },
          },
        );
        x.at("21.35s").navigate("tweet", { tweetId: "x_directors_commentary" });
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("22.3s").deliver({
          id: "ig-meme-banner",
          appId: "app_instagram",
          content: {
            title: "Meme Desk",
            body: "mentioned you in their story: accountability speedrun",
          },
          category: "social",
          interruption: "timeSensitive",
          privacy: "public",
          foregroundBehavior: "present",
          threadId: "ig_apology_story_set",
          metadata: { route: "story" },
        });
        notifications.at("23.4s").tap("ig-meme-banner");
      })
      .instagram("phone", (instagram) => {
        instagram.at("23.6s").setThemeMode("dark");
        instagram.at("24.0s").navigate("home", { postId: "ig_apology_post" });
        instagram
          .at("25.0s")
          .openStory("ig_apology_story_set", "ig_accountability_speedrun");
        instagram.at("28.5s").advanceStory("ig_apology_story_set");
        instagram.at("30.5s").navigate("thread", { threadId: "ig_launch_dm" });
        instagram.at("31.0s").addDMMessage({
          id: "ig_meme_everywhere",
          threadId: "ig_launch_dm",
          senderId: "ig_editor",
          text: "Bad news: the clean export has 14 views. The typo has 200K shares.",
          createdAt: baseTime + 31_000,
        });
      })
      .whatsapp("phone", "wa_ceo_dm", (whatsapp) => {
        whatsapp.switchTo("wa_ceo_dm", "34.2s");
        whatsapp.span("34.6s", "35.2s").typing("CEO");
        whatsapp
          .at("35.3s")
          .receive("CEO", "Keep the typo. Engagement doubled.", {
            messageId: "wa_ceo_keep_it",
          });
        whatsapp.at("40.5s").send("So we are calling this strategy?", {
          messageId: "wa_strategy",
          input: {
            duration: "2.2s",
            id: "wa-strategy-input",
            style: "natural",
            keyboard: { appearance: "light", returnKey: "send" },
          },
        });
        whatsapp.span("40.25s", "40.75s").typing("CEO");
        whatsapp.at("40.8s").receive("CEO", "No. Rename the file.", {
          messageId: "wa_ceo_final",
        });
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("THE APOLOGY TEMPLATE WENT LIVE.", {
          durationFrames: 82,
          intensity: 0.92,
        });
        overlay.at("23.8s").receipt("WHATSAPP → X → INSTAGRAM → WHATSAPP", {
          durationFrames: 30,
          intensity: 0.76,
        });
      })
      .audio((audio) => {
        audio.span("0s", "42s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.17,
          fadeIn: "1.2s",
          fadeOut: "2.2s",
        });
      })
      .build(),
});
