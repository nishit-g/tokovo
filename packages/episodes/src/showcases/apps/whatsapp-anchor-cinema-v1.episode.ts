import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";

const baseTime = new Date("2026-07-20T20:42:00.000Z").getTime();

const readyMedia = {
  transferState: "ready" as const,
  transferProgress: 1,
  playbackState: "idle" as const,
  playbackProgress: 0,
};

export default defineEpisode({
  meta: {
    id: "whatsapp-anchor-cinema-v1",
    title: "WhatsApp Anchor Cinema",
    description:
      "Cinematic two-device WhatsApp film driven entirely by semantic anchors: English and Arabic RTL, split-screen, PIP, notification handoff, replies, long press, swipe-to-reply, Updates, calls, and live media.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 98,
    tags: [
      "whatsapp",
      "camera",
      "semantic-anchors",
      "multi-device",
      "rtl",
      "split-screen",
      "picture-in-picture",
      "social-video",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1080,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-anchor-cinema-v1", {
      fps: 30,
      duration: "36s",
      title: "WhatsApp Anchor Cinema",
    })
      .device("creator_ios", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        screenRecording: true,
        installedApps: ["app_whatsapp"],
        os: { time: baseTime, battery: 47, network: "5G" },
      })
      .device("launch_android", "pixel", {
        app: "app_whatsapp",
        appearance: "dark",
        installedApps: ["app_whatsapp"],
        os: { time: baseTime, battery: 83, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .snapshot("app_whatsapp", "creator_ios", {
        locale: "en-US",
        conversations: [
          {
            id: "launch_room",
            name: "Launch Room",
            type: "group",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 7,
            isPinned: true,
            description: "The clean export, launch response, zero panic.",
            members: [
              { id: "me", name: "You" },
              { id: "mira", name: "Mira", avatar: "/avatars/avatar-ava.jpg" },
              { id: "noa", name: "Noa", avatar: "/avatars/avatar-zoe.jpg" },
              { id: "dev", name: "Dev", avatar: "/avatars/avatar-marcus.jpg" },
            ],
            admins: ["me", "mira"],
            trust: { endToEndEncrypted: true },
            preferences: { disappearingMessages: "24 hours" },
            messages: [
              {
                id: "ios_seed",
                type: "text",
                from: "mira",
                text: "Clean export is scheduled. Nobody posts before it lands.",
                timestampMs: baseTime - 160_000,
              },
              {
                id: "ios_proof",
                type: "image",
                from: "noa",
                imageUrl: "/media/founder-whiteboard.jpg",
                caption: "The final launch board. Every surface is signed off.",
                media: readyMedia,
                timestampMs: baseTime - 100_000,
              },
              {
                id: "ios_video",
                type: "video",
                from: "me",
                videoUrl: "/media/launch-clip.mp4",
                thumbnailUrl: "/media/founder-whiteboard.jpg",
                duration: 2.67,
                caption: "Clean launch cut",
                status: "read",
                media: readyMedia,
                reactions: [{ emoji: "🔥", count: 8, fromMe: true }],
                timestampMs: baseTime - 48_000,
              },
            ],
          },
          {
            id: "creator_support",
            name: "Creator Support",
            unreadCount: 2,
            contact: {
              businessCategory: "Product support",
              verifiedBusiness: true,
            },
            trust: {
              endToEndEncrypted: true,
              businessNotice:
                "This business uses a secure service to manage customer conversations.",
            },
            messages: [],
          },
        ],
        statuses: [
          {
            id: "ios_status_launch",
            authorId: "launch_room",
            authorName: "Launch Room",
            avatar: "/avatars/avatar-group.png",
            postedAt: baseTime - 28_000,
            viewed: false,
            media: {
              type: "image",
              src: "/media/founder-whiteboard.jpg",
            },
          },
        ],
        channels: [
          {
            id: "ios_channel_velocity",
            name: "Launch Velocity",
            avatar: "/placeholders/app-icon.svg",
            description: "Live product launches, measured without the noise",
            followersLabel: "2.4M followers",
            followed: true,
            verified: true,
            unreadCount: 12,
            latestUpdate: {
              id: "ios_channel_update",
              text: "The clean cut has overtaken the leak in under nine minutes.",
              postedAt: baseTime - 18_000,
            },
          },
        ],
        callLog: [
          {
            id: "ios_call_mira",
            conversationId: "launch_room",
            name: "Mira",
            avatar: "/avatars/avatar-ava.jpg",
            direction: "outgoing",
            mode: "video",
            startedAt: baseTime - 420_000,
            durationSeconds: 368,
          },
          {
            id: "ios_call_support",
            conversationId: "creator_support",
            name: "Creator Support",
            direction: "missed",
            mode: "voice",
            startedAt: baseTime - 1_200_000,
          },
        ],
        profile: {
          name: "Director",
          about: "Turning phone screens into cinema.",
        },
      })
      .snapshot("app_whatsapp", "launch_android", {
        locale: "ar",
        conversations: [
          {
            id: "cairo_launch",
            name: "غرفة الإطلاق",
            type: "group",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 9,
            isPinned: true,
            description: "النسخة النهائية والاستجابة المباشرة",
            members: [
              { id: "me", name: "أنت" },
              { id: "noor", name: "نور", avatar: "/avatars/avatar-zoe.jpg" },
              { id: "omar", name: "عمر", avatar: "/avatars/avatar-marcus.jpg" },
              { id: "mira", name: "ميرا", avatar: "/avatars/avatar-ava.jpg" },
            ],
            admins: ["me", "noor"],
            trust: { endToEndEncrypted: true },
            preferences: { disappearingMessages: "٢٤ ساعة" },
            messages: [
              {
                id: "ar_seed",
                type: "text",
                from: "noor",
                text: "النسخة النهائية جاهزة. نراقب القنوات والتعليقات الآن.",
                timestampMs: baseTime - 150_000,
              },
              {
                id: "ar_proof",
                type: "image",
                from: "omar",
                imageUrl: "/media/office-meme.png",
                caption: "تأكيد النشر على جميع الشاشات",
                media: readyMedia,
                timestampMs: baseTime - 92_000,
              },
              {
                id: "ar_video",
                type: "video",
                from: "me",
                videoUrl: "/media/launch-clip.mp4",
                thumbnailUrl: "/media/office-meme.png",
                duration: 2.67,
                caption: "نسخة الإطلاق النظيفة",
                status: "read",
                media: readyMedia,
                reactions: [{ emoji: "❤️", count: 11, fromMe: true }],
                timestampMs: baseTime - 42_000,
              },
            ],
          },
          {
            id: "arabic_support",
            name: "دعم المبدعين",
            unreadCount: 3,
            contact: {
              businessCategory: "دعم المنتجات",
              verifiedBusiness: true,
            },
            trust: { endToEndEncrypted: true },
            messages: [],
          },
        ],
        statuses: [
          {
            id: "ar_status_launch",
            authorId: "cairo_launch",
            authorName: "غرفة الإطلاق",
            avatar: "/avatars/avatar-group.png",
            postedAt: baseTime - 25_000,
            viewed: false,
            media: {
              type: "text",
              text: "النسخة النظيفة تتصدر الآن",
              backgroundColor: "#315B52",
            },
          },
        ],
        channels: [
          {
            id: "ar_channel_velocity",
            name: "سرعة الإطلاق",
            avatar: "/placeholders/app-icon.svg",
            description: "إطلاقات مباشرة بلا ضوضاء",
            followersLabel: "٢٫٤ مليون متابع",
            followed: true,
            verified: true,
            unreadCount: 14,
            latestUpdate: {
              id: "ar_channel_update",
              text: "تجاوزت النسخة النظيفة التسريب خلال تسع دقائق.",
              postedAt: baseTime - 16_000,
            },
          },
        ],
        callLog: [
          {
            id: "ar_call_noor",
            conversationId: "cairo_launch",
            name: "نور",
            avatar: "/avatars/avatar-zoe.jpg",
            direction: "incoming",
            mode: "video",
            startedAt: baseTime - 360_000,
            durationSeconds: 281,
          },
          {
            id: "ar_call_support",
            conversationId: "arabic_support",
            name: "دعم المبدعين",
            direction: "missed",
            mode: "voice",
            startedAt: baseTime - 1_080_000,
          },
        ],
        profile: { name: "المخرج", about: "نحوّل شاشات الهاتف إلى سينما." },
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("THE LAUNCH CHAT JUST CHANGED EVERYTHING.", {
          durationFrames: 84,
          intensity: 0.95,
        });
        overlay.at("15.7s").receipt("LONG PRESS → REPLY → MEDIA", {
          preset: "topLeft",
          durationFrames: 72,
        });
        overlay
          .at("24.2s")
          .caption("Two devices. One deterministic timeline.", {
            durationFrames: 54,
          });
        overlay.at("33.1s").cliffhanger("WHATSAPP · DIRECTED BY ANCHORS", {
          durationFrames: 78,
          intensity: 1,
        });
      })
      .audio((audio) => {
        audio.span("0s", "36s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.2,
          fadeIn: "1.2s",
          fadeOut: "2.2s",
        });
      })
      .deviceTrack("creator_ios", (device) => {
        device.at("0s").screenRecording(true, { mode: "compact" });
      })
      .notificationTrack("launch_android", (notifications) => {
        notifications.at("18.35s").deliver({
          id: "arabic_launch_alert",
          appId: "app_whatsapp",
          content: { title: "غرفة الإطلاق", body: "النسخة النظيفة تتصدر القنوات الآن." },
          category: "message",
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "launch_room",
        });
        notifications.at("19.65s").dismiss("arabic_launch_alert");
      })
      .whatsapp("creator_ios", "launch_room", (whatsapp) => {
        whatsapp.openChatList("0s");
        whatsapp.switchTo("launch_room", "2.2s");
        whatsapp
          .at("4s")
          .receive("Mira", "The private cut is already at 92K views.", {
            messageId: "ios_velocity",
          });
        whatsapp
          .at("6.2s")
          .send(
            "Lock comments. Publish the clean export. I’ll handle the chat.",
            { messageId: "ios_command" },
          );
        whatsapp.at("9.8s").startGesture("ios_velocity", "long_press");
        whatsapp.at("10.2s").completeGesture("ios_velocity");
        whatsapp.at("11.5s").cancelGesture("ios_velocity");
        whatsapp.at("12s").startGesture("ios_velocity", "swipe_reply");
        whatsapp.at("12.45s").updateGesture("ios_velocity", 0.58);
        whatsapp.at("12.9s").updateGesture("ios_velocity", 0.96);
        whatsapp.at("13s").completeGesture("ios_velocity");
        whatsapp.at("14.2s").send("Clean export is live. Pin that link.", {
          messageId: "ios_reply",
          replyTo: { messageId: "ios_velocity" },
        });
        whatsapp.at("14.25s").dismissReplyComposer();
        whatsapp.at("16s").openMediaViewer("ios_proof");
        whatsapp.at("18.3s").closeMediaViewer();
        whatsapp.openUpdates("18.6s");
        whatsapp.openChatList("26s");
        whatsapp.switchTo("launch_room", "26.3s");
        whatsapp.at("27s").startMediaPlayback("ios_video", 0.12);
        whatsapp.at("27.1s").openMediaViewer("ios_video");
        whatsapp.at("28.7s").updateMediaPlayback("ios_video", 0.62);
        whatsapp.at("30s").pauseMediaPlayback("ios_video", 0.62);
        whatsapp.at("30.1s").closeMediaViewer();
        whatsapp.openCalls("30.4s");
      })
      .whatsapp("launch_android", "cairo_launch", (whatsapp) => {
        whatsapp.openChatList("0s");
        whatsapp.switchTo("cairo_launch", "19.8s");
        whatsapp
          .at("20.2s")
          .receive("نور", "وصلنا إلى مئة ألف مشاهدة. النسخة النظيفة تتصدر.", {
            messageId: "ar_velocity",
          });
        whatsapp.at("21.4s").startGesture("ar_velocity", "swipe_reply");
        whatsapp.at("21.9s").updateGesture("ar_velocity", 0.61);
        whatsapp.at("22.35s").updateGesture("ar_velocity", 0.97);
        whatsapp.at("22.45s").completeGesture("ar_velocity");
        whatsapp.at("23.4s").send("ثبّتوا الرابط. نتابع التعليقات من هنا.", {
          messageId: "ar_reply",
          replyTo: { messageId: "ar_velocity" },
        });
        whatsapp.at("23.45s").dismissReplyComposer();
        whatsapp.openUpdates("24.4s");
        whatsapp.openCalls("30.4s");
      })
      .camera((camera) => {
        camera.at("0s").layout({
          mode: "SPLIT_HORIZONTAL",
          primaryDeviceId: "creator_ios",
          secondaryDeviceId: "launch_android",
        });
        camera.at("2s").layout({
          mode: "SINGLE",
          primaryDeviceId: "creator_ios",
        });
        camera
          .at("2.3s")
          .focus(
            { deviceId: "creator_ios", anchorId: "header" },
            { scale: 1.06, duration: "0.35s", easing: "easeOut" },
          );
        camera.at("4.05s").shake({
          intensityX: 0.007,
          intensityY: 0.005,
          frequency: 7,
          decay: 0.9,
          duration: "0.32s",
        });
        camera
          .span("4.05s", "6s")
          .trackDrama(
            { deviceId: "creator_ios", anchorId: "ios_velocity" },
            { scale: 1.16, smoothing: 0.12 },
          );
        camera
          .span("6.25s", "8.7s")
          .trackCinematic(
            { deviceId: "creator_ios", anchorId: "keyboard" },
            { scale: 1.12, smoothing: 0.17 },
          );
        camera
          .at("8.8s")
          .focus(
            { deviceId: "creator_ios", anchorId: "lastMessage" },
            { scale: 1.13, duration: "0.32s" },
          );
        camera
          .span("10.25s", "11.45s")
          .trackFastBeat(
            { deviceId: "creator_ios", anchorId: "message_actions" },
            { scale: 1.12, smoothing: 0.1 },
          );
        camera
          .span("12.05s", "12.95s")
          .trackFastBeat(
            { deviceId: "creator_ios", anchorId: "ios_velocity" },
            { scale: 1.14, smoothing: 0.09 },
          );
        camera
          .at("13.05s")
          .focus(
            { deviceId: "creator_ios", anchorId: "reply_composer" },
            { scale: 1.12, duration: "0.25s" },
          );
        camera
          .span("14.3s", "15.45s")
          .trackCinematic(
            { deviceId: "creator_ios", anchorId: "lastMessage" },
            { scale: 1.13, smoothing: 0.15 },
          );
        camera
          .span("16.05s", "18.15s")
          .trackCalm(
            { deviceId: "creator_ios", anchorId: "media_viewer_content" },
            { scale: 1.04, smoothing: 0.22 },
          );
        camera.at("18.35s").layout({
          mode: "PIP",
          primaryDeviceId: "creator_ios",
          secondaryDeviceId: "launch_android",
          pipPosition: "bottom-right",
          pipScale: 0.36,
        });
        camera.at("19s").layout({
          mode: "SINGLE",
          primaryDeviceId: "launch_android",
        });
        camera
          .at("19.05s")
          .focus(
            { deviceId: "launch_android", anchorId: "notification.banner" },
            { scale: 1.12, duration: "0.24s" },
          );
        camera
          .at("19.95s")
          .focus(
            { deviceId: "launch_android", anchorId: "header" },
            { scale: 1.06, duration: "0.3s" },
          );
        camera
          .span("20.25s", "21.25s")
          .trackDrama(
            { deviceId: "launch_android", anchorId: "ar_velocity" },
            { scale: 1.15, smoothing: 0.12 },
          );
        camera
          .at("22.5s")
          .focus(
            { deviceId: "launch_android", anchorId: "reply_composer" },
            { scale: 1.12, duration: "0.26s" },
          );
        camera
          .span("23.5s", "24.15s")
          .trackCinematic(
            { deviceId: "launch_android", anchorId: "lastMessage" },
            { scale: 1.13, smoothing: 0.15 },
          );
        camera.at("24.4s").layout({
          mode: "SPLIT_HORIZONTAL",
          primaryDeviceId: "creator_ios",
          secondaryDeviceId: "launch_android",
        });
        camera.at("26s").layout({
          mode: "SINGLE",
          primaryDeviceId: "creator_ios",
        });
        camera
          .at("26.35s")
          .focus(
            { deviceId: "creator_ios", anchorId: "media_ios_video" },
            { scale: 1.12, duration: "0.3s" },
          );
        camera
          .span("27.15s", "30s")
          .trackCalm(
            { deviceId: "creator_ios", anchorId: "media_viewer_content" },
            { scale: 1.04, smoothing: 0.2 },
          );
        camera.at("30.4s").layout({
          mode: "PIP",
          primaryDeviceId: "creator_ios",
          secondaryDeviceId: "launch_android",
          pipPosition: "top-right",
          pipScale: 0.34,
        });
        camera
          .at("30.65s")
          .focus(
            { deviceId: "creator_ios", anchorId: "calls_list" },
            { scale: 1.07, duration: "0.3s" },
          );
        camera.at("32.2s").layout({
          mode: "SPLIT_HORIZONTAL",
          primaryDeviceId: "creator_ios",
          secondaryDeviceId: "launch_android",
        });
      })
      .build(),
});
