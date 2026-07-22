import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "keyboard-input-exhaustive",
    title: "Keyboard Input Exhaustive",
    description:
      "Canonical multilingual input showcase proving grapheme-safe Hindi and Arabic, Japanese IME composition, emoji layout switching, corrections, light/dark themes, and clear-on-send.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 130,
    tags: [
      "system",
      "keyboard",
      "input",
      "multilingual",
      "ime",
      "rtl",
      "themes",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1020,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("keyboard-input-exhaustive", {
      fps: 30,
      duration: "34s",
      title: "Keyboard Input Exhaustive",
      seed: "keyboard-input-exhaustive-vnext",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2026-04-10T19:05:00Z"),
          battery: 63,
          network: "wifi",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_editor",
            name: "Language QA",
            avatar: "/avatars/avatar-priya.jpg",
            unreadCount: 1,
            messages: [],
          },
        ],
      })
      .whatsapp("phone", "dm_editor", (wa) => {
        wa.switchTo("dm_editor", "0.8s");
        wa.at("1.3s").receive(
          "Language QA",
          "Hindi first — keep every matra intact.",
        );
        wa.at("7.4s").send("कल सुबह 9 बजे भेज दूँगा।");
        wa.at("7.8s").receive(
          "Language QA",
          "Now RTL. The cursor must stay correct.",
        );
        wa.at("13.6s").send("سأرسل النسخة النهائية الليلة.");
        wa.at("14.0s").receive(
          "Language QA",
          "IME next — composition is not committed text.",
        );
        wa.at("19.6s").send("明日の朝、最終版を送ります。");
        wa.at("20.0s").receive(
          "Language QA",
          "Switch layouts without losing the draft.",
        );
        wa.at("25.2s").send("Looks 10/10 🔥🚀");
        wa.at("25.6s").receive(
          "Language QA",
          "Last one: make a typo, then repair it.",
        );
        wa.at("31.6s").send("Ship the fix", {
          input: {
            duration: "5.6s",
            style: "natural",
            correction: {
              typed: "Ship the fox",
              replace: "fox",
              with: "fix",
            },
            keyboard: { appearance: "dark" },
          },
        });
      })
      .input("phone", "composer", {
        id: "hindi-light",
        at: "2s",
        submitAt: "7s",
        until: "7.4s",
        locale: "hi-IN",
        text: "कल सुबह 9 बजे भेज दूँगा।",
        expectedFinalValue: "कल सुबह 9 बजे भेज दूँगा।",
        cadence: { style: "fast" },
        keyboard: { appearance: "light", returnKey: "send" },
      })
      .input("phone", "composer", {
        id: "arabic-dark-rtl",
        at: "8.2s",
        submitAt: "13.2s",
        until: "13.6s",
        locale: "ar-SA",
        direction: "auto",
        text: "سأرسل النسخة النهائية الليلة.",
        expectedFinalValue: "سأرسل النسخة النهائية الليلة.",
        cadence: { style: "fast" },
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .input("phone", "composer", {
        id: "japanese-ime-dark",
        at: "14.4s",
        submitAt: "19.2s",
        until: "19.6s",
        locale: "ja-JP",
        script: [
          {
            type: "compose",
            updates: [
              "ashita",
              "あした",
              "明日",
              "明日の朝",
              "明日の朝、最終版を送ります",
            ],
            commit: "明日の朝、最終版を送ります。",
            keys: ["a", "し", "明", "朝", "送"],
            intervalFrames: 16,
          },
          {
            type: "setSuggestions",
            suggestions: ["送ります", "共有します", "確認します"],
          },
        ],
        expectedFinalValue: "明日の朝、最終版を送ります。",
        keyboard: { appearance: "dark", returnKey: "send" },
      })
      .input("phone", "composer", {
        id: "emoji-layout-switch",
        at: "20.4s",
        submitAt: "24.8s",
        until: "25.2s",
        locale: "en-US",
        script: [
          { type: "type", text: "Looks 10/10 ", cadence: { style: "fast" } },
          { type: "switchLayout", layout: "emoji" },
          { type: "type", text: "🔥🚀", cadence: { framesPerGrapheme: 12 } },
        ],
        expectedFinalValue: "Looks 10/10 🔥🚀",
        keyboard: { appearance: "light", returnKey: "send" },
      })
      .build(),
});
