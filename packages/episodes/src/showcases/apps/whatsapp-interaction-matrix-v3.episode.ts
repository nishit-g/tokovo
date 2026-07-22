import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

const baseTime = new Date("2026-07-20T18:30:00.000Z").getTime();

const readyMedia = {
  transferState: "ready" as const,
  transferProgress: 1,
  playbackState: "idle" as const,
  playbackProgress: 0,
};

const remoteMedia = {
  transferState: "remote" as const,
  transferProgress: 0,
  playbackState: "idle" as const,
  playbackProgress: 0,
};

export default defineEpisode({
  meta: {
    id: "whatsapp-interaction-matrix-v3",
    title: "WhatsApp Interaction Matrix V3",
    description:
      "Deterministic two-device WhatsApp acceptance render covering English and Arabic RTL, privacy notices, delivery failure and retry, bounded thread rendering, media lifecycle, fullscreen Status playback, long-press actions, swipe-to-reply, Calls, Communities, Settings, profile surfaces, light mode, and dark mode.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 95,
    tags: [
      "whatsapp",
      "multi-device",
      "rtl",
      "accessibility",
      "media",
      "gestures",
      "determinism",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1320,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-interaction-matrix-v3", {
      fps: 30,
      duration: "44s",
      title: "WhatsApp Interaction Matrix V3",
    })
      .device("ios_english", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        installedApps: ["app_whatsapp"],
        os: { time: baseTime, battery: 86, network: "5G" },
      })
      .device("android_arabic", "pixel", {
        app: "app_whatsapp",
        appearance: "dark",
        installedApps: ["app_whatsapp"],
        os: { time: baseTime, battery: 74, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .snapshot("app_whatsapp", "ios_english", {
        locale: "en-US",
        conversations: [
          {
            id: "studio_release",
            name: "Release Studio",
            type: "group",
            avatar: "/avatars/group-design.jpg",
            unreadCount: 4,
            isPinned: true,
            description: "Final cut, accessibility, and launch checks",
            members: [
              { id: "me", name: "You" },
              { id: "ava", name: "Ava", avatar: "/avatars/avatar-ava.jpg" },
              { id: "noor", name: "Noor", avatar: "/avatars/avatar-zoe.jpg" },
            ],
            admins: ["me", "ava"],
            trust: { endToEndEncrypted: true },
            preferences: { disappearingMessages: "7 days" },
            messages: [
              {
                id: "ios_text",
                type: "text",
                from: "ava",
                text: "The Arabic pass is clean. Check the media states next.",
                timestampMs: baseTime - 210_000,
              },
              {
                id: "ios_photo",
                type: "image",
                from: "noor",
                imageUrl: "/media/founder-whiteboard.jpg",
                caption: "Final launch board — alt text and contrast approved.",
                media: readyMedia,
                timestampMs: baseTime - 150_000,
              },
              {
                id: "ios_document",
                type: "document",
                from: "ava",
                fileName: "release-accessibility-report.pdf",
                fileSize: 2_400_000,
                fileType: "PDF",
                media: remoteMedia,
                timestampMs: baseTime - 90_000,
              },
              {
                id: "ios_video",
                type: "video",
                from: "me",
                videoUrl: "/media/launch-clip.mp4",
                thumbnailUrl: "/media/founder-whiteboard.jpg",
                duration: 2.67,
                caption: "Deterministic launch cut",
                status: "read",
                media: readyMedia,
                reactions: [{ emoji: "🔥", count: 3, fromMe: true }],
                replyTo: { messageId: "ios_text" },
                timestampMs: baseTime - 30_000,
              },
            ],
          },
          {
            id: "ios_business",
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
            id: "ios_status_1",
            authorId: "studio_release",
            authorName: "Release Studio",
            avatar: "/avatars/group-design.jpg",
            postedAt: baseTime - 42_000,
            viewed: false,
            media: {
              type: "image",
              src: "/media/founder-whiteboard.jpg",
              caption:
                "The release board is green. Shipping after the final replay.",
            },
          },
          {
            id: "ios_status_2",
            authorId: "studio_release",
            authorName: "Release Studio",
            avatar: "/avatars/group-design.jpg",
            postedAt: baseTime - 38_000,
            viewed: false,
            media: {
              type: "text",
              text: "Same input. Same frame. Same pixels.",
              backgroundColor: "#176B5B",
            },
          },
        ],
        channels: [
          {
            id: "ios_channel",
            name: "Interaction Lab",
            avatar: "/placeholders/app-icon.svg",
            description: "Practical mobile interaction studies",
            followersLabel: "184K followers",
            followed: true,
            verified: true,
            unreadCount: 6,
            latestUpdate: {
              id: "ios_channel_update",
              text: "Why swipe-to-reply still beats a hidden action sheet",
              postedAt: baseTime - 36_000,
            },
          },
        ],
        callLog: [
          {
            id: "ios_call_ava",
            conversationId: "studio_release",
            name: "Ava",
            avatar: "/avatars/avatar-ava.jpg",
            direction: "incoming",
            mode: "video",
            startedAt: baseTime - 480_000,
            durationSeconds: 315,
          },
          {
            id: "ios_call_support",
            conversationId: "ios_business",
            name: "Creator Support",
            direction: "missed",
            mode: "voice",
            startedAt: baseTime - 1_200_000,
          },
        ],
        communities: [
          {
            id: "ios_community",
            name: "Launch Council",
            avatar: "/avatars/group-design.jpg",
            description: "The groups responsible for the verified release",
            announcementConversationId: "studio_release",
            groupConversationIds: ["studio_release"],
            memberCount: 18,
            unreadCount: 4,
          },
        ],
        profile: { name: "Director", about: "Shipping the verified cut." },
        settings: {
          linkedDevicesCount: 3,
          privacy: {
            lastSeen: "contacts",
            profilePhoto: "contacts",
            readReceipts: true,
          },
          chats: { theme: "light", backupLabel: "Today, 6:22 PM" },
          notifications: { messageTone: "Note", mutedChats: 2 },
          storage: {
            usedLabel: "2.4 GB used",
            autoDownloadLabel: "Wi-Fi only",
          },
        },
      })
      .snapshot("app_whatsapp", "android_arabic", {
        locale: "ar",
        conversations: [
          {
            id: "cairo_family",
            name: "فريق القاهرة",
            type: "group",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 5,
            isPinned: true,
            description: "مراجعة الإطلاق والوسائط وإمكانية الوصول",
            members: [
              { id: "me", name: "أنت" },
              { id: "noor", name: "نور", avatar: "/avatars/avatar-zoe.jpg" },
              { id: "omar", name: "عمر", avatar: "/avatars/avatar-marcus.jpg" },
            ],
            admins: ["me", "noor"],
            trust: { endToEndEncrypted: true },
            preferences: { disappearingMessages: "٧ أيام" },
            messages: [
              {
                id: "ar_text",
                type: "text",
                from: "noor",
                text: "واجهة اليمين إلى اليسار جاهزة. لنراجع التنزيل الآن.",
                timestampMs: baseTime - 210_000,
              },
              {
                id: "ar_photo",
                type: "image",
                from: "omar",
                imageUrl: "/media/office-meme.png",
                caption: "المعاينة النهائية قبل النشر",
                media: readyMedia,
                timestampMs: baseTime - 150_000,
              },
              {
                id: "ar_document",
                type: "document",
                from: "noor",
                fileName: "تقرير-إمكانية-الوصول.pdf",
                fileSize: 1_800_000,
                fileType: "PDF",
                media: remoteMedia,
                timestampMs: baseTime - 90_000,
              },
              {
                id: "ar_video",
                type: "video",
                from: "me",
                videoUrl: "/media/launch-clip.mp4",
                thumbnailUrl: "/media/office-meme.png",
                duration: 2.67,
                caption: "نسخة الإطلاق الحتمية",
                status: "read",
                media: readyMedia,
                reactions: [{ emoji: "❤️", count: 4, fromMe: true }],
                replyTo: { messageId: "ar_text" },
                timestampMs: baseTime - 30_000,
              },
            ],
          },
          {
            id: "arabic_support",
            name: "دعم المبدعين",
            unreadCount: 1,
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
            id: "ar_status_1",
            authorId: "cairo_family",
            authorName: "فريق القاهرة",
            avatar: "/avatars/avatar-group.png",
            postedAt: baseTime - 40_000,
            viewed: false,
            media: {
              type: "text",
              text: "جاهزون للنشر",
              backgroundColor: "#375F53",
            },
          },
          {
            id: "ar_status_2",
            authorId: "cairo_family",
            authorName: "فريق القاهرة",
            avatar: "/avatars/avatar-group.png",
            postedAt: baseTime - 36_000,
            viewed: false,
            media: {
              type: "image",
              src: "/media/office-meme.png",
              caption: "نفس المدخلات، ونفس الإطار، ونفس البكسلات.",
            },
          },
        ],
        channels: [
          {
            id: "ar_channel",
            name: "مختبر التفاعل",
            avatar: "/placeholders/app-icon.svg",
            description: "دراسات عملية لتجارب الهاتف",
            followersLabel: "١٨٤ ألف متابع",
            followed: true,
            verified: true,
            unreadCount: 7,
            latestUpdate: {
              id: "ar_channel_update",
              text: "لماذا يظل السحب للرد أسرع من القوائم المخفية",
              postedAt: baseTime - 34_000,
            },
          },
        ],
        callLog: [
          {
            id: "ar_call_noor",
            conversationId: "cairo_family",
            name: "نور",
            avatar: "/avatars/avatar-zoe.jpg",
            direction: "incoming",
            mode: "voice",
            startedAt: baseTime - 420_000,
            durationSeconds: 195,
          },
          {
            id: "ar_call_support",
            conversationId: "arabic_support",
            name: "دعم المبدعين",
            direction: "missed",
            mode: "video",
            startedAt: baseTime - 1_080_000,
          },
        ],
        communities: [
          {
            id: "ar_community",
            name: "مجتمع الإطلاق",
            avatar: "/avatars/avatar-group.png",
            description: "المجموعات المسؤولة عن النسخة الموثقة",
            announcementConversationId: "cairo_family",
            groupConversationIds: ["cairo_family"],
            memberCount: 21,
            unreadCount: 5,
          },
        ],
        profile: { name: "المخرج", about: "ننشر النسخة الموثقة." },
        settings: {
          linkedDevicesCount: 2,
          privacy: {
            lastSeen: "جهات الاتصال",
            profilePhoto: "جهات الاتصال",
            readReceipts: true,
          },
          chats: { theme: "dark", backupLabel: "اليوم، ٦:٢٠ م" },
          notifications: { messageTone: "النغمة الافتراضية", mutedChats: 3 },
          storage: {
            usedLabel: "١٫٨ ج.ب مستخدمة",
            autoDownloadLabel: "عبر Wi-Fi فقط",
          },
        },
      })
      .whatsapp("ios_english", "studio_release", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("studio_release", "2s");
        wa.at("4s").startGesture("ios_text", "long_press");
        wa.at("4.4s").completeGesture("ios_text");
        wa.at("6.2s").cancelGesture("ios_text");
        wa.at("6.5s").openMediaViewer("ios_photo");
        wa.at("9s").closeMediaViewer();
        wa.at("9.4s").startMediaDownload("ios_document");
        wa.at("10.4s").updateMediaDownload("ios_document", 0.38);
        wa.at("11.4s").updateMediaDownload("ios_document", 0.78);
        wa.at("12.4s").completeMediaDownload("ios_document");
        wa.at("13s").startGesture("ios_text", "swipe_reply");
        wa.at("13.5s").updateGesture("ios_text", 0.48);
        wa.at("14s").updateGesture("ios_text", 0.9);
        wa.at("14.4s").completeGesture("ios_text");
        wa.at("16s").send("Locked. RTL, media, and gestures all pass.", {
          messageId: "ios_reply",
          replyTo: { messageId: "ios_text" },
        });
        wa.at("16.1s").dismissReplyComposer();
        wa.at("16.4s").failMessageDelivery("ios_reply", "offline");
        wa.at("17.2s").startMessageRetry("ios_reply");
        wa.at("17.7s").completeMessageRetry("ios_reply");
        wa.openUpdates("18s");
        wa.at("19.2s").showStatusViewer("ios_status_1");
        wa.at("20.5s").advanceStatusViewer("next");
        wa.at("21.7s").closeStatusViewer();
        wa.openChatList("22s");
        wa.switchTo("studio_release", "24s");
        wa.at("25s").startMediaPlayback("ios_video", 0.18);
        wa.at("25.1s").openMediaViewer("ios_video");
        wa.at("27s").updateMediaPlayback("ios_video", 0.66);
        wa.at("29s").pauseMediaPlayback("ios_video", 0.66);
        wa.at("29.2s").closeMediaViewer();
        wa.openCalls("30.2s");
        wa.openCommunities("33.2s");
        wa.openSettings("36.2s");
        wa.openProfile("39.2s");
      })
      .whatsapp("android_arabic", "cairo_family", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("cairo_family", "2s");
        wa.at("4s").startGesture("ar_text", "long_press");
        wa.at("4.4s").completeGesture("ar_text");
        wa.at("6.2s").cancelGesture("ar_text");
        wa.at("6.5s").openMediaViewer("ar_photo");
        wa.at("9s").closeMediaViewer();
        wa.at("9.4s").startMediaDownload("ar_document");
        wa.at("10.4s").updateMediaDownload("ar_document", 0.42);
        wa.at("11.4s").updateMediaDownload("ar_document", 0.81);
        wa.at("12.4s").completeMediaDownload("ar_document");
        wa.at("13s").startGesture("ar_text", "swipe_reply");
        wa.at("13.5s").updateGesture("ar_text", 0.48);
        wa.at("14s").updateGesture("ar_text", 0.9);
        wa.at("14.4s").completeGesture("ar_text");
        wa.at("16s").send("تمت المراجعة. الواجهة والوسائط والإيماءات ناجحة.", {
          messageId: "ar_reply",
          replyTo: { messageId: "ar_text" },
        });
        wa.at("16.1s").dismissReplyComposer();
        wa.at("16.4s").failMessageDelivery("ar_reply", "offline");
        wa.at("17.2s").startMessageRetry("ar_reply");
        wa.at("17.7s").completeMessageRetry("ar_reply");
        wa.openUpdates("18s");
        wa.at("19.2s").showStatusViewer("ar_status_1");
        wa.at("20.5s").advanceStatusViewer("next");
        wa.at("21.7s").closeStatusViewer();
        wa.openChatList("22s");
        wa.switchTo("cairo_family", "24s");
        wa.at("25s").startMediaPlayback("ar_video", 0.18);
        wa.at("25.1s").openMediaViewer("ar_video");
        wa.at("27s").updateMediaPlayback("ar_video", 0.66);
        wa.at("29s").pauseMediaPlayback("ar_video", 0.66);
        wa.at("29.2s").closeMediaViewer();
        wa.openCalls("30.2s");
        wa.openCommunities("33.2s");
        wa.openSettings("36.2s");
        wa.switchTo("arabic_support", "39s");
        wa.openProfile("39.2s");
      })
      .build(),
});
