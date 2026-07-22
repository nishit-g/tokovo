import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";

const INSTALLED_APPS = [
  "app_whatsapp",
  "app_imessage",
  "app_instagram",
  "app_x",
  "app_linkedin",
  "app_snapchat",
  "app_teams",
  "app_camera",
];

const conversationSnapshot = (name: string, seedText: string) => ({
  conversations: [
    {
      id: "language_lab",
      name,
      avatar: "/avatars/avatar-priya.jpg",
      unreadCount: 1,
      messages: [
        {
          id: `seed_${name}`,
          type: "text",
          from: name,
          text: seedText,
          timestamp: Date.parse("2026-07-21T09:39:00Z"),
        },
      ],
    },
  ],
});

export default defineEpisode({
  meta: {
    id: "os-surface-mega-exhaustive",
    title: "Tokovo OS Surface Mega Episode",
    description:
      "One deterministic proof spanning four native OS themes, localized lock and home surfaces, cinematic subjects, multilingual input, notification policy, privacy, grouping, center state, and a real quick-reply action.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 100,
    tags: [
      "system",
      "mega",
      "ios",
      "android",
      "lockscreen",
      "homescreen",
      "notifications",
      "keyboard",
      "multilingual",
      "rtl",
      "ime",
      "themes",
      "cinematic-subjects",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2160,
    apps: [
      "app_whatsapp",
      "app_imessage",
      "app_instagram",
      "app_x",
      "app_linkedin",
      "app_snapchat",
      "app_teams",
    ],
  },
  build: () =>
    episode("os-surface-mega-exhaustive", {
      fps: 30,
      duration: "72s",
      title: "Tokovo OS Surface Mega Episode",
      seed: "os-surface-mega-vnext",
    })
      .device("ios_light_hi", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        installedApps: INSTALLED_APPS,
        homeScreen: {
          dock: ["app_imessage", "app_whatsapp", "app_camera", "app_instagram"],
          pages: [["app_x", "app_linkedin", "app_snapchat", "app_teams"]],
        },
        os: {
          locale: "hi-IN",
          appearance: "light",
          hourCycle: "h24",
          time: new Date("2026-07-21T09:41:00Z"),
          battery: 74,
          network: "5G",
        },
      })
      .device("android_dark_ar", "pixel", {
        app: "app_whatsapp",
        locked: true,
        installedApps: INSTALLED_APPS,
        homeScreen: {
          dock: ["app_camera", "app_whatsapp", "app_x", "app_teams", "app_instagram"],
          pages: [["app_linkedin", "app_snapchat", "app_imessage"]],
        },
        os: {
          locale: "ar-SA",
          appearance: "dark",
          hourCycle: "h24",
          time: new Date("2026-07-21T09:41:00Z"),
          battery: 48,
          network: "wifi",
          dnd: true,
        },
      })
      .device("ios_dark_ja", "iphone16", {
        app: "app_whatsapp",
        locked: true,
        installedApps: INSTALLED_APPS,
        homeScreen: {
          dock: ["app_imessage", "app_camera", "app_whatsapp", "app_instagram"],
          pages: [["app_x", "app_teams", "app_linkedin", "app_snapchat"]],
        },
        os: {
          locale: "ja-JP",
          appearance: "dark",
          hourCycle: "h24",
          time: new Date("2026-07-21T21:41:00Z"),
          battery: 91,
          network: "wifi",
        },
      })
      .device("android_light_en", "pixel", {
        app: "app_whatsapp",
        locked: true,
        installedApps: INSTALLED_APPS,
        homeScreen: {
          dock: ["app_camera", "app_imessage", "app_whatsapp", "app_x", "app_instagram"],
          pages: [["app_teams", "app_linkedin", "app_snapchat"]],
        },
        os: {
          locale: "en-US",
          appearance: "light",
          hourCycle: "h12",
          time: new Date("2026-07-21T09:41:00Z"),
          battery: 82,
          network: "5G",
        },
      })
      .background("studio-quiet-dark")
      .snapshot(
        "app_whatsapp",
        "ios_light_hi",
        conversationSnapshot("भाषा QA", "हर मात्रा और संयुक्त अक्षर सही रहना चाहिए।"),
      )
      .snapshot("app_whatsapp", "android_dark_ar", {
        ...conversationSnapshot("فريق اللغة", "يجب أن يبقى اتجاه المؤشر صحيحًا."),
        locale: "ar",
      })
      .snapshot(
        "app_whatsapp",
        "ios_dark_ja",
        conversationSnapshot("言語 QA", "変換中の文字は確定テキストではありません。"),
      )
      .snapshot(
        "app_whatsapp",
        "android_light_en",
        conversationSnapshot("Input QA", "Repair the typo without rebuilding the draft."),
      )
      .overlay((overlay) => {
        overlay.at("0s").hook("FOUR NATIVE SYSTEM THEMES", {
          durationFrames: 84,
          intensity: 0.82,
        });
        overlay.at("24s").caption("ONE INPUT CONTRACT · FOUR WRITING SYSTEMS", {
          durationFrames: 96,
        });
        overlay.at("60s").caption("PRIVACY · GROUPING · CENTER · QUICK REPLY", {
          durationFrames: 54,
        });
        overlay.at("69.5s").receipt("ONE EPISODE · RANDOM-ACCESS SAFE", {
          preset: "topLeft",
          durationFrames: 72,
        });
      })
      .audio((audio) => {
        audio.span("0s", "72s").bgm("/music/cinematic-ambient.mp3", {
          volume: 0.16,
          fadeIn: "1.2s",
          fadeOut: "2.5s",
        });
      })
      .deviceTrack("ios_light_hi", (device) => {
        device.at("6s").unlock();
        device.at("6.7s").goHome({ transition: { durationFrames: 16, style: "iosZoom" } });
        device.at("24.7s").openApp("app_whatsapp", {
          transition: { durationFrames: 16, style: "iosZoom" },
        });
        device.at("60s").lock();
      })
      .deviceTrack("android_dark_ar", (device) => {
        device.at("6s").unlock();
        device.at("6.7s").goHome({ transition: { durationFrames: 16, style: "iosZoom" } });
        device.at("33.2s").openApp("app_whatsapp", {
          transition: { durationFrames: 14, style: "iosZoom" },
        });
      })
      .deviceTrack("ios_dark_ja", (device) => {
        device.at("20s").unlock();
        device.at("20.7s").goHome({ transition: { durationFrames: 16, style: "iosZoom" } });
        device.at("42.7s").openApp("app_whatsapp", {
          transition: { durationFrames: 16, style: "iosZoom" },
        });
      })
      .deviceTrack("android_light_en", (device) => {
        device.at("20s").unlock();
        device.at("20.7s").goHome({ transition: { durationFrames: 14, style: "iosZoom" } });
        device.at("51.7s").openApp("app_whatsapp", {
          transition: { durationFrames: 14, style: "iosZoom" },
        });
      })
      .notificationTrack("ios_light_hi", (notifications) => {
        notifications.at("0.8s").deliver({
          id: "hi_passive",
          appId: "app_linkedin",
          content: {
            title: "LinkedIn",
            body: "आपकी प्रोफ़ाइल को 18 बार देखा गया।",
          },
          category: "social",
          interruption: "passive",
          privacy: "public",
          threadId: "hi_social",
          groupId: "hi_social",
        });
        notifications.at("2.1s").deliver({
          id: "hi_private",
          appId: "app_whatsapp",
          content: {
            title: "माँ",
            body: "आज रात घर कब आओगे?",
            avatar: { src: "/avatars/avatar-priya.jpg", alt: "माँ" },
          },
          category: "message",
          interruption: "active",
          privacy: "private",
          previewPolicy: "whenUnlocked",
          threadId: "language_lab",
          groupId: "language_lab",
        });
        notifications.at("28.8s").deliver({
          id: "foreground_suppressed",
          appId: "app_whatsapp",
          content: {
            title: "भाषा QA",
            body: "Foreground alert must stay quiet.",
          },
          interruption: "active",
          foregroundBehavior: "suppress",
          privacy: "private",
          threadId: "language_lab",
        });
        notifications.at("60.8s").deliver({
          id: "center_group_one",
          appId: "app_instagram",
          content: { title: "Instagram", body: "नया कमेंट: शानदार कट।" },
          interruption: "active",
          privacy: "public",
          threadId: "launch_post",
          groupId: "launch_post",
        });
        notifications.at("61.2s").deliver({
          id: "center_group_two",
          appId: "app_instagram",
          content: { title: "Instagram", body: "3 और लोगों ने जवाब दिया।" },
          interruption: "active",
          privacy: "public",
          threadId: "launch_post",
          groupId: "launch_post",
        });
        notifications.at("62s").openCenter();
        notifications.at("64.4s").closeCenter();
      })
      .notificationTrack("android_dark_ar", (notifications) => {
        notifications.at("1.2s").deliver({
          id: "ar_hidden",
          appId: "app_teams",
          content: { title: "غرفة الإطلاق", body: "رمز الإصدار في الرسالة." },
          category: "work",
          interruption: "timeSensitive",
          privacy: "sensitive",
          previewPolicy: "never",
          threadId: "release_room",
          groupId: "release_room",
        });
        notifications.at("3.4s").deliver({
          id: "ar_critical",
          appId: "app_teams",
          content: { title: "تنبيه عاجل", body: "ابدأ مكالمة الحادث الآن." },
          category: "work",
          interruption: "critical",
          privacy: "private",
          threadId: "incident",
          groupId: "incident",
        });
        notifications.at("65.6s").deliver({
          id: "arabic_quick_reply",
          appId: "app_whatsapp",
          content: {
            title: "فريق اللغة",
            body: "هل النسخة النهائية جاهزة؟",
            avatar: { src: "/avatars/avatar-group.png", alt: "فريق اللغة" },
          },
          category: "message",
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "language_lab",
          reply: {
            actionId: "reply",
            placeholder: "رد",
            textPayloadKey: "text",
            target: {
              navigation: {
                appId: "app_whatsapp",
                route: "conversation",
                params: { conversationId: "language_lab" },
              },
              appEvent: {
                appId: "app_whatsapp",
                type: "MESSAGE_SENT",
                payload: { conversationId: "language_lab" },
              },
            },
          },
        });
        notifications.at("66s").openCenter();
        notifications.at("68s").reply("arabic_quick_reply", "نعم، جاهزة للإرسال.");
        notifications.at("68.15s").closeCenter();
      })
      .notificationTrack("ios_dark_ja", (notifications) => {
        notifications.at("14.8s").deliver({
          id: "ja_passive",
          appId: "app_x",
          content: { title: "X", body: "下書きが保存されました。" },
          category: "social",
          interruption: "passive",
          privacy: "public",
          threadId: "draft",
        });
        notifications.at("17.1s").deliver({
          id: "ja_active",
          appId: "app_imessage",
          content: { title: "編集チーム", body: "最終版を確認してください。" },
          category: "message",
          interruption: "active",
          privacy: "private",
          threadId: "language_lab",
        });
      })
      .notificationTrack("android_light_en", (notifications) => {
        notifications.at("15.3s").deliver({
          id: "en_active",
          appId: "app_snapchat",
          content: { title: "Studio", body: "A new snap is ready." },
          category: "social",
          interruption: "active",
          privacy: "public",
          threadId: "studio",
        });
        notifications.at("17.8s").deliver({
          id: "en_critical",
          appId: "app_teams",
          content: {
            title: "Release Room",
            body: "Build recovered. Approval required.",
          },
          category: "work",
          interruption: "critical",
          privacy: "private",
          threadId: "release",
        });
      })
      .whatsapp("ios_light_hi", "language_lab", (whatsapp) => {
        whatsapp.switchTo("language_lab", "25.2s");
        whatsapp.at("32s").send("कल सुबह ९ बजे अंतिम संस्करण भेज दूँगा।");
      })
      .whatsapp("android_dark_ar", "language_lab", (whatsapp) => {
        whatsapp.switchTo("language_lab", "33.7s");
        whatsapp.at("41s").send("سأرسل النسخة النهائية الليلة.");
      })
      .whatsapp("ios_dark_ja", "language_lab", (whatsapp) => {
        whatsapp.switchTo("language_lab", "43.2s");
        whatsapp.at("50s").send("明日の朝、最終版を送ります。");
      })
      .whatsapp("android_light_en", "language_lab", (whatsapp) => {
        whatsapp.switchTo("language_lab", "52.2s");
        whatsapp.at("59s").send("Ship the fix 🔥🚀");
      })
      .input("ios_light_hi", "composer", {
        id: "mega_hindi",
        at: "25.8s",
        submitAt: "31.7s",
        until: "32s",
        locale: "hi-IN",
        text: "कल सुबह ९ बजे अंतिम संस्करण भेज दूँगा।",
        expectedFinalValue: "कल सुबह ९ बजे अंतिम संस्करण भेज दूँगा।",
        cadence: { style: "fast" },
        keyboard: { appearance: "light", returnKey: "send" },
      })
      .input("android_dark_ar", "composer", {
        id: "mega_arabic",
        at: "34.2s",
        submitAt: "40.7s",
        until: "41s",
        locale: "ar-SA",
        direction: "auto",
        text: "سأرسل النسخة النهائية الليلة.",
        expectedFinalValue: "سأرسل النسخة النهائية الليلة.",
        cadence: { style: "fast" },
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .input("ios_dark_ja", "composer", {
        id: "mega_japanese_ime",
        at: "43.8s",
        submitAt: "49.7s",
        until: "50s",
        locale: "ja-JP",
        script: [
          {
            type: "compose",
            updates: ["ashita", "あした", "明日", "明日の朝", "明日の朝、最終版を送ります"],
            commit: "明日の朝、最終版を送ります。",
            keys: ["a", "し", "明", "朝", "送"],
            intervalFrames: 18,
          },
          {
            type: "setSuggestions",
            suggestions: ["送ります", "共有します", "確認します"],
          },
        ],
        expectedFinalValue: "明日の朝、最終版を送ります。",
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .input("android_light_en", "composer", {
        id: "mega_correction_emoji",
        at: "52.8s",
        submitAt: "58.7s",
        until: "59s",
        locale: "en-US",
        script: [
          { type: "type", text: "Ship the fox ", cadence: { style: "fast" } },
          { type: "setSelection", selection: { anchor: 9, focus: 12 } },
          {
            type: "replaceRange",
            range: { anchor: 9, focus: 12 },
            text: "fix",
          },
          { type: "setSelection", selection: { anchor: 13, focus: 13 } },
          { type: "switchLayout", layout: "emoji" },
          { type: "type", text: "🔥🚀", cadence: { framesPerGrapheme: 12 } },
        ],
        expectedFinalValue: "Ship the fix 🔥🚀",
        keyboard: { appearance: "light", returnKey: "send" },
      })
      .build(),
});
