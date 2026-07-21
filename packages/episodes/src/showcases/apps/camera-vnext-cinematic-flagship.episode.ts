import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { cameraVNextCinematicFlagshipCinematics } from "./camera-vnext-cinematic-flagship.camera.js";

const baseTime = new Date("2026-07-22T20:24:00.000Z").getTime();

export default defineEpisode({
  meta: {
    id: "camera-vnext-cinematic-flagship",
    title: "Camera VNext Cinematic Flagship",
    description:
      "A 60fps real-WhatsApp camera reel proving semantic framing, canonical iOS input, notifications, exact message/media subjects, five optical looks, and a clean neutral settle across swappable restrained and kinetic cuts.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 97,
    tags: [
      "camera-vnext",
      "whatsapp",
      "cinematic",
      "keyboard",
      "notifications",
      "semantic-subjects",
      "lens-effects",
      "60fps",
    ],
  },
  config: {
    format: "1080x1920@60",
    durationInFrames: 1440,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("camera-vnext-cinematic-flagship", {
      fps: 60,
      duration: "24s",
      title: "Camera VNext Cinematic Flagship",
      seed: "camera-vnext-cinematic-flagship-v1",
    })
      .device("director-phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "dark",
        installedApps: ["app_whatsapp"],
        screenRecording: { presentation: "compact" },
        os: {
          time: baseTime,
          battery: 78,
          network: "5G",
          appearance: "dark",
          locale: "en-IN",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .cinematics(cameraVNextCinematicFlagshipCinematics)
      .snapshot("app_whatsapp", "director-phone", {
        conversations: [
          {
            id: "camera_room",
            name: "Camera Room",
            type: "group",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 3,
            isPinned: true,
            description: "The final camera pass, judged frame by frame.",
            members: [
              { id: "me", name: "You" },
              { id: "mira", name: "Mira", avatar: "/avatars/avatar-ava.jpg" },
              { id: "noa", name: "Noa", avatar: "/avatars/avatar-zoe.jpg" },
              { id: "dev", name: "Dev", avatar: "/avatars/avatar-marcus.jpg" },
            ],
            admins: ["me", "mira"],
            trust: { endToEndEncrypted: true },
            messages: [
              {
                id: "seed_camera_note",
                type: "text",
                from: "Mira",
                text: "The story is locked. Camera can change without touching it.",
                timestamp: baseTime - 90_000,
              },
            ],
            lastMessageAt: baseTime - 90_000,
          },
          {
            id: "render_ops",
            name: "Render Ops",
            avatar: "/avatars/avatar-zoe.jpg",
            unreadCount: 1,
            contact: {
              about: "Watching the deterministic render queue.",
              lastSeenLabel: "online",
            },
            messages: [
              {
                id: "seed_render_note",
                type: "text",
                from: "Render Ops",
                text: "Stage plate is clean and ready for the next cut.",
                timestamp: baseTime - 150_000,
              },
            ],
            lastMessageAt: baseTime - 150_000,
          },
        ],
        statuses: [
          {
            id: "camera_status",
            authorId: "camera_room",
            authorName: "Camera Room",
            avatar: "/avatars/avatar-group.png",
            postedAt: baseTime - 42_000,
            viewed: false,
            media: { type: "image", src: "/media/founder-whiteboard.jpg" },
          },
        ],
        channels: [
          {
            id: "camera_channel",
            name: "Camera Notes",
            description: "Lens tests and restrained movement studies.",
            followersLabel: "184K followers",
            verified: true,
            followed: true,
            unreadCount: 4,
            latestUpdate: {
              id: "camera_channel_update",
              text: "Why every distortion needs a clean landing frame",
              postedAt: baseTime - 32_000,
            },
          },
        ],
        callLog: [
          {
            id: "camera_call",
            conversationId: "camera_room",
            name: "Mira",
            avatar: "/avatars/avatar-ava.jpg",
            direction: "outgoing",
            mode: "video",
            startedAt: baseTime - 420_000,
            durationSeconds: 318,
          },
        ],
        profile: {
          name: "Director",
          about: "Story locked. Camera infinitely recuttable.",
        },
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("CAMERA VNEXT · REAL WHATSAPP", {
          durationFrames: 108,
          intensity: 0.82,
        });
        overlay.at("2.05s").receipt("01 · PERSPECTIVE → BARREL", {
          preset: "topLeft",
          durationFrames: 108,
        });
        overlay.at("4.05s").receipt("02 · FISHEYE → ANAMORPHIC KEYBOARD", {
          preset: "topLeft",
          durationFrames: 264,
        });
        overlay.at("10.55s").receipt("03 · NOTIFICATION WHIP + SMEAR", {
          preset: "topLeft",
          durationFrames: 102,
        });
        overlay.at("12.55s").caption("04 · ENTITY-LOCKED MEDIA REFRAME", {
          durationFrames: 132,
        });
        overlay.at("16.1s").caption("05 · SEMANTIC NAVIGATION", {
          durationFrames: 126,
        });
        overlay.at("21.75s").cliffhanger("CLEAN SETTLE · ZERO RESIDUAL DISTORTION", {
          durationFrames: 120,
          intensity: 0.72,
        });
      })
      .audio((audio) => {
        audio.span("0s", "24s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.14,
          fadeIn: "1.2s",
          fadeOut: "2.2s",
        });
      })
      .notificationTrack("director-phone", (notifications) => {
        notifications.at("10.6s").deliver({
          id: "render_complete",
          appId: "app_whatsapp",
          content: {
            title: "Render Ops",
            body: "Kinetic camera pass is ready for review.",
          },
          category: "message",
          interruption: "timeSensitive",
          privacy: "private",
          foregroundBehavior: "present",
          threadId: "render_ops",
        });
        notifications.at("12.2s").dismiss("render_complete");
      })
      .whatsapp("director-phone", "camera_room", (whatsapp) => {
        whatsapp.openChatList("0s");
        whatsapp.switchTo("camera_room", "1.35s");
        whatsapp
          .at("3.15s")
          .receive("Mira", "Keep the keyboard close, then land clean on the sent message.", {
            messageId: "camera_direction",
          });
        whatsapp.at("9s").send("Story stays locked. I’m recutting only the lens.", {
          messageId: "director_reply",
          input: {
            duration: "4.8s",
            style: "natural",
            seed: "director-keyboard-performance",
          },
        });
        whatsapp.at("12.5s").receiveImage("Noa", "/media/founder-whiteboard.jpg", {
          messageId: "launch_board",
          caption: "Final board. Frame the proof, not the chrome.",
        });
        whatsapp.at("15.45s").addReaction("launch_board", "🔥", true);
        whatsapp.openUpdates("16.1s");
        whatsapp.openCalls("18.35s");
        whatsapp.openChatList("19.95s");
        whatsapp.switchTo("camera_room", "20.35s");
        whatsapp.at("20.85s").receive("Mira", "That settles. No wobble, no leftover warp.", {
          messageId: "clean_settle",
        });
      })
      .section("optical-reel", "0s", "19s")
      .section("neutral-settle", "19s", "24s")
      .build(),
});
