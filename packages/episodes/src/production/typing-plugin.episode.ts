import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { TypingIndicatorPlugin, KeyboardPlugin } from "@tokovo/compiler";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
  meta: {
    id: "typing-plugin-demo",
    title: "Typing Indicator Plugin Demo",
    description: "Demonstrates TypingIndicatorPlugin eliminating boilerplate",
    category: "test",
    tags: ["typing", "plugin", "demo"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },

  build: () =>
    episode("typing-plugin-demo", { fps: 30, duration: "30s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_sarah", name: "Sarah", avatar: "/avatars/sarah.jpg" },
        ],
      })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder),
        (wa) => {
          wa.switchTo("dm_sarah", "0s");
          wa.at("2s").receive("Sarah", "Hey!");
          wa.at("4s").send("Hey back!");
          wa.at("7s").receive("Sarah", "How are you doing today?");
          wa.at("10s").send("Good! Just working on this cool project");
          wa.at("15s").receive("Sarah", "Nice! Tell me more about it");
          wa.at("20s").send("It's a video phone simulator");
          wa.at("25s").receive("Sarah", "Wow that sounds amazing!");
        },
      )
      .use(
        new TypingIndicatorPlugin({
          mode: "auto",
          charsPerSecond: 12,
          characterProfiles: {
            Sarah: {
              charsPerSecond: 15,
              burstTyping: true,
              realisticPauses: true,
            },
            me: {
              charsPerSecond: 10,
              burstTyping: false,
            },
          },
          enableRealisticPauses: true,
          delayBefore: 0.5,
        }),
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )
      .build(),
});
