import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
  meta: {
    id: "keyboard-plugin-demo",
    title: "Keyboard Plugin Demo",
    description: "Demonstrates KeyboardPlugin auto-adding keyboard animations",
    category: "test",
    tags: ["keyboard", "plugin", "demo"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },

  build: () =>
    episode("keyboard-plugin-demo", { fps: 30, duration: "30s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          { id: "dm_sarah", name: "Sarah", avatar: "/avatars/sarah.jpg" },
        ],
      })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder),
        (wa) => {
          wa.at("2s").receive("Sarah", "Hey!");
          wa.at("4s").send("Hey back!");
          wa.at("7s").receive("Sarah", "How are you doing today?");
          wa.at("12s").send("Good! Working on this amazing project");
          wa.at("18s").receive("Sarah", "Tell me more!");
          wa.at("24s").send("It's a video phone simulator with auto-keyboard!");
        },
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          characterProfiles: {
            Sarah: {
              charDelay: 4,
              enabled: false,
            },
          },
          excludeShortMessages: 3,
        }),
      )
      .build(),
});
