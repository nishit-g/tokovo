import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "payload-first-smoke",
    title: "Payload-First Smoke",
    description:
      "Minimal code-first smoke episode kept under the legacy ID to verify render boundaries stay green without Payload.",
    category: "test",
    tags: ["smoke", "code-first", "whatsapp"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 240,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("payload-first-smoke", {
      fps: 30,
      duration: "8s",
      title: "Payload-First Smoke",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [{ id: "smoke-chat", name: "Manifest Smoke", type: "group" }],
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .whatsapp("phone", "smoke-chat", (wa) => {
        wa.switchTo("smoke-chat", "0s");
        wa.at("1.2s").receive("Founder", "Registry path looks stable.");
        wa.at("2.8s").send("Resolver, build, and render loop is green.");
      })
      .build(),
});
