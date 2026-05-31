/**
 * Testing Episode
 *
 * Category: test
 * Format: iphone-16-pro
 *
 * @see packages/episodes/README.md
 */

import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

// Declaration order counter (required for event ordering)
let order = 0;
const getOrder = () => order++;

export default defineEpisode({
  meta: {
    id: "test",
    title: "Testing Episode",
    description: "A Tokovo episode",
    category: "test",
    tags: ["app_whatsapp"],
  },
  config: {
    format: "iphone-16-pro",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("test", {
      fps: 30,
      duration: "30s",
      title: "Testing Episode",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [{ id: "dm_contact", name: "Contact", avatar: "" }],
      })

      // === WHATSAPP TRACK ===
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_contact", getOrder),
        (wa) => {
          // Add your WhatsApp events here:
          wa.switchTo("dm_contact", "0s");
          wa.at("1s").receive("Contact", "Hello! 👋");
          wa.span("3s", "5s").typing("me");
          wa.at("5s").send("Hi there! How are you?");
          wa.at("7s").receive("Contact", "I'm great, thanks!");
        },
      )

      // === CAMERA TRACK (optional) ===
      .camera((cam) => {
        cam.at("5s").animate({ scale: 1.05, duration: "0.3s" });
        cam.at("10s").animate({ scale: 1, duration: "0.5s" });
      })

      // === AUDIO TRACK (optional) ===
      .audio((_audio) => {
        // _audio.span("0s", "30s").bgm("ambient", { volume: 0.1 });
      })

      // === MARKERS (optional) ===
      .mark("start", "0s")

      .build(),
});
