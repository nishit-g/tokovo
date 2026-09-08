import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";
import { signalPopThemeProofCamera } from "./signal-pop-theme-proof.camera.js";

const baseTime = new Date("2026-07-24T18:30:00.000Z").getTime();

export default defineEpisode({
  meta: {
    id: "signal-pop-theme-proof",
    title: "Signal Pop Theme Proof",
    description:
      "A two-device proof of a bold show language across backdrop, spacing, WhatsApp, native X, keyboard, notifications, overlays, and restrained camera direction.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 148,
    tags: [
      "system",
      "theme",
      "bold",
      "multi-device",
      "whatsapp",
      "x",
      "keyboard",
      "notifications",
      "camera",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 720,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("signal-pop-theme-proof", {
      fps: 30,
      duration: "24s",
      title: "Signal Pop Theme Proof",
    })
      .device("signal_whatsapp", "iphone16", {
        app: "app_whatsapp",
        appearance: "dark",
        theme: "whatsapp-signal-pop",
        installedApps: ["app_whatsapp"],
        os: {
          time: baseTime,
          battery: 76,
          network: "5G",
        },
      })
      .device("signal_x", "pixel", {
        app: "app_x",
        appearance: "dark",
        theme: "x-lights-out",
        installedApps: ["app_x"],
        os: {
          time: baseTime,
          battery: 84,
          network: "wifi",
        },
      })
      .background("signal-pop")
      .cinematics(signalPopThemeProofCamera)
      .snapshot("app_whatsapp", "signal_whatsapp", {
        conversations: [
          {
            id: "signal_room",
            name: "Color Committee",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 0,
            isPinned: true,
            type: "group",
            members: [
              { id: "me", name: "You" },
              { id: "mira", name: "Mira" },
              { id: "dev", name: "Dev" },
              { id: "ria", name: "Ria" },
            ],
            messages: [
              {
                id: "signal_seed_1",
                from: "Mira",
                type: "text",
                text: "The characters are bold. The phones need a world that belongs to them.",
                timestamp: baseTime - 86_000,
              },
              {
                id: "signal_seed_2",
                from: "me",
                type: "text",
                text: "Strong palette, generous spacing, zero visual shouting.",
                status: "read",
                timestamp: baseTime - 71_000,
              },
              {
                id: "signal_seed_3",
                from: "Ria",
                type: "text",
                text: "And the apps should still feel like themselves.",
                timestamp: baseTime - 48_000,
              },
            ],
          },
          {
            id: "signal_details",
            name: "Theme Details",
            unreadCount: 2,
            type: "group",
            members: [
              { id: "me", name: "You" },
              { id: "dev", name: "Dev" },
            ],
          },
        ],
      })
      .snapshot(
        "app_x",
        "signal_x",
        {
          schemaVersion: 2,
          locale: "en-US",
          currentUserId: "signal_me",
          users: [
            {
              id: "signal_me",
              name: "Signal Studio",
              handle: "signalstudio",
              bio: "Bold worlds. Familiar interfaces.",
              followers: 42_800,
              following: 318,
              verified: "blue",
            },
            {
              id: "signal_design",
              name: "Design Room",
              handle: "designroom",
              bio: "Systems, spacing, and the occasional unnecessary gradient.",
              followers: 184_200,
              following: 206,
              verified: "gold",
            },
          ],
          follows: [{ followerId: "signal_me", followingId: "signal_design" }],
          tweets: [
            {
              id: "x_signal_post",
              authorId: "signal_design",
              text: "Bold does not mean loud everywhere. Character color outside. Native clarity inside.",
              createdAt: baseTime - 35_000,
              media: {
                type: "image",
                urls: ["/media/launch-board.svg"],
                aspect: "wide",
                alt: "A colorful editorial system board",
              },
              likeCount: 18_400,
              repostCount: 2_160,
              viewCount: 286_000,
              bookmarkCount: 6_900,
              shareCount: 3_440,
            },
          ],
          notifications: [
            {
              id: "x_signal_seed_notification",
              type: "like",
              actorId: "signal_design",
              tweetId: "x_signal_post",
              createdAt: baseTime - 12_000,
            },
          ],
        },
        { version: 2 },
      )
      .view(
        "app_x",
        "signal_x",
        {
          schemaVersion: 2,
          screen: "timeline",
          timelineTab: "forYou",
        },
        { version: 2 },
      )
      .whatsapp("signal_whatsapp", "signal_room", (whatsapp) => {
        whatsapp.openChatList("0s");
        whatsapp.switchTo("signal_room", "1.8s");
        whatsapp.at("3.3s").receive("Dev", "Make the world unmistakable.", {
          messageId: "signal_brief",
        });
        whatsapp.at("11.5s").send("Bold outside. Native where it matters.", {
          messageId: "signal_reply",
          input: {
            id: "signal-pop-input",
            duration: "4.5s",
            style: "natural",
            locale: "en-US",
            keyboard: {
              platform: "ios",
              appearance: "dark",
              returnKey: "send",
              autocapitalization: "sentences",
              autocorrection: true,
            },
          },
        });
      })
      .x("signal_x", (x) => {
        x.at("0s").navigate("timeline");
        x.at("12s").navigate("tweet", { tweetId: "x_signal_post" });
        x.at("20.2s").navigate("notifications");
      })
      .notificationTrack("signal_x", (notifications) => {
        notifications.at("16.5s").deliver({
          id: "signal_depth_alert",
          appId: "app_x",
          content: {
            title: "Design Room",
            body: "The theme system is doing the work—not the episode.",
          },
          category: "social",
          interruption: "timeSensitive",
          privacy: "public",
          foregroundBehavior: "present",
          threadId: "signal-theme",
        });
        notifications.at("19.9s").dismiss("signal_depth_alert");
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("ONE VISUAL SYSTEM. TWO NATIVE APPS.", {
          durationFrames: 78,
          intensity: 0.9,
        });
        overlay.at("11.8s").receipt("STAGE · DEVICE · APP · OS · CAMERA", {
          durationFrames: 84,
          intensity: 0.72,
        });
        overlay.at("20.2s").cliffhanger("BOLD OUTSIDE. CLEAR INSIDE.", {
          durationFrames: 102,
          intensity: 0.92,
        });
      })
      .audio((audio) => {
        audio.span("0s", "24s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.18,
          fadeIn: "1.2s",
          fadeOut: "2s",
        });
      })
      .build(),
});
