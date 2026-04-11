import { defineEpisode } from "../types/index.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

export default defineEpisode({
  meta: {
    id: "render-service-smoke",
    title: "Render Service Smoke",
    category: "test",
    catalogType: "test",
    visibility: "internal",
    tags: ["test", "smoke", "render-service"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 150,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("render-service-smoke", { fps: 30, duration: "5s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [{ id: "smoke-thread", name: "Ops" }],
      })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "smoke-thread", () => 0),
        (wa) => {
          wa.switchTo("smoke-thread", "0s");
          wa.at("0.6s").receive("Ops", "Render service smoke test");
          wa.at("2.2s").send("Smoke render completed.", { typed: true });
        },
      )
      .build(),
});
