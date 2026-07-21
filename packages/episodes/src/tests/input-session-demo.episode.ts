import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { episode } from "@tokovo/dsl";

import { defineEpisode } from "../types/episode-definition.js";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
  meta: {
    id: "input-session-demo",
    title: "Input Session Demo",
    description: "Demonstrates explicit, field-scoped input sessions and submission.",
    category: "test",
    tags: ["keyboard", "input", "demo"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 450,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("input-session-demo", { fps: 30, duration: "15s" })
      .device("phone", "iphone16", { app: "app_whatsapp" })
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
          wa.at("1s").receive("Sarah", "Hey!");
          wa.at("6s").send("Hey back 👋");
        },
      )
      .input("phone", "composer", {
        at: "2s",
        submitAt: "5.7s",
        until: "6s",
        locale: "en-US",
        script: [
          { type: "type", text: "Hey back ", cadence: { style: "natural" } },
          { type: "switchLayout", layout: "emoji" },
          { type: "type", text: "👋" },
        ],
        expectedFinalValue: "Hey back 👋",
        keyboard: { returnKey: "send", appearance: "light" },
      })
      .build(),
});
