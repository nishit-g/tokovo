import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";

export default defineEpisode({
  meta: {
    id: "social-launch-multi-device",
    title: "The Private Cut Went Public",
    description:
      "Flagship two-device social story spanning WhatsApp, X, and Instagram with split-screen, single-device, picture-in-picture, typed input, notifications, media, overlays, audio, and semantic camera direction.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 145,
    tags: [
      "system",
      "flagship",
      "multi-device",
      "multi-app",
      "split-screen",
      "picture-in-picture",
      "whatsapp",
      "x",
      "instagram",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1140,
    apps: ["app_whatsapp", "app_x", "app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2026-07-20T20:40:00Z").getTime();

    return episode("social-launch-multi-device", {
      fps: 30,
      duration: "38s",
      title: "The Private Cut Went Public",
    })
      .device("creator_phone", "iphone16", {
        app: "app_whatsapp",
        screenRecording: true,
        installedApps: ["app_whatsapp", "app_instagram"],
        os: {
          time: new Date("2026-07-20T20:42:00Z"),
          battery: 47,
          network: "5G",
        },
      })
      .device("audience_phone", "pixel", {
        app: "app_x",
        installedApps: ["app_x"],
        os: {
          time: new Date("2026-07-20T20:42:00Z"),
          battery: 83,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .snapshot("app_whatsapp", "creator_phone", {
        conversations: [
          {
            id: "launch_room",
            name: "Launch Room",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 4,
            type: "group",
            members: [
              { id: "me", name: "You" },
              { id: "mira", name: "Mira" },
              { id: "noa", name: "Noa" },
              { id: "dev", name: "Dev" },
            ],
            messages: [
              {
                id: "wa_seed_1",
                type: "text",
                from: "Mira",
                text: "Final cut is scheduled for 9:00.",
                timestamp: baseTs - 90_000,
              },
              {
                id: "wa_seed_2",
                type: "text",
                from: "Me",
                text: "Nobody posts before the clean export lands.",
                timestamp: baseTs - 75_000,
              },
            ],
          },
          {
            id: "creator_dm",
            name: "Mira",
            avatar: "/avatars/avatar-zoe.jpg",
            unreadCount: 1,
            type: "dm",
          },
        ],
      })
      .view("app_whatsapp", "creator_phone", { screen: "chats" })
      .snapshot("app_x", "audience_phone", {
        currentUserId: "x_viewer",
        users: [
          {
            id: "x_viewer",
            name: "Ari",
            handle: "ariscrolls",
            bio: "Watching launch night happen in public.",
            avatarUrl: "/avatars/avatar-alex.jpg",
            followers: 18_200,
            following: 610,
            verified: "blue",
          },
          {
            id: "x_leakwatch",
            name: "Launch Watch",
            handle: "launchwatch",
            bio: "The internet's unofficial launch monitor.",
            avatarUrl: "/avatars/avatar-arsh.jpg",
            followers: 482_000,
            following: 91,
            verified: "gold",
          },
          {
            id: "x_editor",
            name: "Noa Frames",
            handle: "noaframes",
            avatarUrl: "/avatars/avatar-priya.jpg",
            followers: 84_000,
            following: 340,
            verified: null,
          },
        ],
        follows: [
          { followerId: "x_viewer", followingId: "x_leakwatch" },
          { followerId: "x_viewer", followingId: "x_editor" },
        ],
        tweets: [
          {
            id: "x_private_cut",
            authorId: "x_leakwatch",
            text: "A private launch cut just escaped the group chat. The unfinished version is now the version everyone is watching.",
            createdAt: baseTs - 42_000,
            media: {
              type: "video",
              aspect: "wide",
              urls: ["/media/launch-clip.mp4"],
            },
            hashtags: ["launchnight"],
            viewCount: 84_200,
            shareCount: 6_800,
            bookmarkCount: 12_400,
          },
        ],
      })
      .view("app_x", "audience_phone", {
        screen: "timeline",
        timelineTab: "forYou",
        themeMode: "dark",
      })
      .snapshot("app_instagram", "creator_phone", {
        currentUserId: "ig_creator",
        users: [
          {
            id: "ig_creator",
            username: "mira.studio",
            displayName: "Mira Studio",
            avatarUrl: "/avatars/avatar-zoe.jpg",
            bio: "Shipping the clean cut. Eventually.",
            followers: 218_000,
            following: 540,
            verified: true,
          },
          {
            id: "ig_noa",
            username: "noa.frames",
            displayName: "Noa Frames",
            avatarUrl: "/avatars/avatar-priya.jpg",
            bio: "Edits, exports, and damage control.",
            followers: 84_000,
            following: 340,
          },
        ],
        follows: [{ followerId: "ig_creator", followingId: "ig_noa" }],
        posts: [
          {
            id: "ig_launch_post",
            authorId: "ig_noa",
            imageUrl: "/media/founder-whiteboard.jpg",
            caption: "POV: the private launch cut escaped before the final export.",
            createdAt: baseTs - 35_000,
            location: "Launch Room",
            likeCount: 19_400,
            commentCount: 842,
            aspect: "portrait",
          },
        ],
        storySets: [
          {
            id: "ig_launch_story",
            userId: "ig_noa",
            items: [
              {
                id: "ig_story_receipt",
                authorId: "ig_noa",
                mediaUrl: "/media/founder-whiteboard.jpg",
                createdAt: baseTs - 24_000,
                durationFrames: 120,
                accentColor: "#f23db3",
              },
              {
                id: "ig_story_fallout",
                authorId: "ig_noa",
                mediaUrl: "/media/office-meme.png",
                createdAt: baseTs - 18_000,
                durationFrames: 120,
                accentColor: "#33d8ff",
              },
            ],
          },
        ],
        threads: [
          {
            id: "ig_damage_control",
            participantIds: ["ig_creator", "ig_noa"],
            title: "Noa Frames",
            unreadCount: 1,
            pinned: true,
          },
        ],
        messages: [
          {
            id: "ig_dm_seed",
            threadId: "ig_damage_control",
            senderId: "ig_noa",
            text: "The mirror accounts found it too.",
            createdAt: baseTs - 12_000,
          },
        ],
      })
      .view("app_instagram", "creator_phone", {
        screen: "home",
        postId: "ig_launch_post",
        themeMode: "dark",
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("THE PRIVATE CUT WENT PUBLIC.", {
          durationFrames: 105,
          intensity: 0.96,
        });
        overlay.at("11.5s").caption("One leak. Two phones. The timeline splits.", {
          durationFrames: 120,
        });
        overlay.at("22.5s").receipt("WhatsApp → X → Instagram", {
          preset: "topLeft",
          durationFrames: 150,
        });
        overlay.at("35.2s").cliffhanger("2 DEVICES · 3 APPS · 1 TIMELINE", {
          durationFrames: 84,
          intensity: 1,
        });
      })
      .audio((audio) => {
        audio.span("0s", "38s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.2,
          fadeIn: "1.5s",
          fadeOut: "2.5s",
        });
      })
      .deviceTrack("creator_phone", (device) => {
        device.at("0s").screenRecording(true, { presentation: "compact" });
        device.at("22.5s").openApp("app_instagram", {
          transition: { durationFrames: 18, style: "platform-default" },
        });
      })
      .notificationTrack("audience_phone", (notifications) => {
        notifications.at("10.8s").deliver({
          id: "x_velocity_alert",
          appId: "app_x",
          content: { title: "Launch Watch", body: "84K views and climbing." },
          category: "social",
          interruption: "timeSensitive",
          privacy: "public",
          threadId: "launch-watch",
        });
      })
      .whatsapp("creator_phone", "launch_room", (whatsapp) => {
        whatsapp.openChatList("0s");
        whatsapp.switchTo("launch_room", "1.8s");
        whatsapp.at("3s").receive("Mira", "The private cut is public.");
        whatsapp.at("4.3s").receive("Noa", "Do not open X unless you are ready.");
        whatsapp.at("9s").send("Nobody repost it. I am pulling the link now.", {});
        whatsapp.at("10.8s").receive("Dev", "Too late. X is already at 84K.");
      })
      .x("audience_phone", (x) => {
        x.at("0s").navigate("timeline");
        x.at("12.8s").navigate("tweet", { tweetId: "x_private_cut" });
        x.at("14s").replyTweet({
          id: "x_reply_receipt",
          authorId: "x_editor",
          replyToId: "x_private_cut",
          text: "The rough cut became the launch because screenshots have no embargo.",
          createdAt: baseTs + 20_000,
          viewCount: 22_600,
          shareCount: 1_100,
          bookmarkCount: 3_800,
        });
        x.at("16s").navigate("compose");
        x.at("20.5s").postTweet({
          id: "x_creator_response",
          authorId: "x_viewer",
          text: "The clean cut is coming. The internet already chose act one.",
          createdAt: baseTs + 34_000,
          viewCount: 4_900,
          shareCount: 180,
          bookmarkCount: 620,
        });
        x.at("21s").navigate("timeline");
        x.at("31.5s").addNotification({
          id: "x_final_notification",
          type: "mention",
          actorId: "x_leakwatch",
          tweetId: "x_creator_response",
          isMention: true,
          title: "Launch Watch",
          body: "Your response is now part of the story.",
          createdAt: baseTs + 50_000,
        });
        x.at("32s").navigate("notifications");
      })
      .instagram("creator_phone", (instagram) => {
        instagram.at("23s").navigate("home", { postId: "ig_launch_post" });
        instagram.at("24.8s").openStory("ig_launch_story", "ig_story_receipt");
        instagram.at("27s").advanceStory("ig_launch_story", "next");
        instagram.at("28.6s").navigate("thread", {
          threadId: "ig_damage_control",
        });
        instagram.at("29.2s").addDMMessage({
          id: "ig_dm_velocity",
          threadId: "ig_damage_control",
          senderId: "ig_noa",
          text: "The mirror is still climbing. What do we post?",
          createdAt: baseTs + 48_000,
        });
        instagram.at("35s").addDMMessage({
          id: "ig_dm_response",
          threadId: "ig_damage_control",
          senderId: "ig_creator",
          text: "The clean cut. Everywhere. Right now.",
          createdAt: baseTs + 58_000,
        });
      })
      .build();
  },
});
