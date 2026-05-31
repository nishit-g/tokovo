import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-overlay-baseline",
    title: "V2 Baseline: Overlays (Hook + Captions + Receipts)",
    description:
      "Creator baseline for hook/caption/receipt overlays that render above devices and stay deterministic.",
    category: "showcase",
    tags: ["v2", "overlay", "hook", "caption", "receipt", "banter"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("v2-overlay-baseline", { fps: 30, duration: "30s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: { time: new Date("2025-06-26T21:12:00"), battery: 54, network: "5G" },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "grp_receipts",
            name: "Receipts Committee",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 8,
            type: "group",
            participants: ["Me", "Rhea", "Omar", "Tina", "Jay"],
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .overlay((ov) => {
        ov.at("0.0s").hook("He posted the screenshot.", { durationFrames: 120, intensity: 0.9 });
        ov.at("3.8s").caption("Watch the group chat turn into a courtroom.", { durationFrames: 150 });
        ov.at("8.6s").receipt("Exhibit A: 'I never lie, I remix the truth.'", { preset: "topLeft", durationFrames: 180 });
        ov.at("16.2s").caption("This is where the details land.", { durationFrames: 120 });
        ov.at("22.8s").cliffhanger("Wait for the last message.", { durationFrames: 180, intensity: 1.0 });
      })
      .whatsapp("phone", "grp_receipts", (wa) => {
        wa.switchTo("grp_receipts", "0s");
        wa.at("2.2s").receive("Rhea", "He posted a screenshot of the group chat.");
        wa.at("3.1s").receive("Omar", "NO WAY 💀");
        wa.at("4.0s").receive("Tina", "Drop link.");
        wa.span("4.8s", "5.6s").typing("Jay");
        wa.at("5.7s").receive("Jay", "he really thought he ate with that caption");
        wa.at("7.8s").send("Stop. The audacity is subscription-based.", { typed: true, charDelay: 2 });
        wa.at("10.4s").receive("Omar", "subscription-based is crazy 😭");
        wa.at("12.8s").receive("Rhea", "Okay but open X, you're trending.");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("2.2s", "13.4s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.2 });
      })
      .build(),
});
