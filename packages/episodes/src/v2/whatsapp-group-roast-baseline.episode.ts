import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/creator";

export default defineEpisode({
  meta: {
    id: "v2-whatsapp-group-roast-baseline",
    title: "V2 Baseline: WhatsApp Group Roast",
    description:
      "Baseline episode for roast pacing in a group chat: fast arrivals, typing tension, reaction beats, and camera that follows the current punchline.",
    category: "showcase",
    tags: ["v2", "whatsapp", "group", "roast", "camera", "keyboard"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("v2-whatsapp-group-roast-baseline", { fps: 30, duration: "30s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
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
        os: { time: new Date("2025-06-26T21:12:00"), battery: 54, network: "5G" },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .whatsapp("phone", "grp_receipts", (wa) => {
        wa.switchTo("grp_receipts", "0s");

        // Setup: someone drops the “post”
        wa.at("1.2s").receive("Rhea", "He just posted a screenshot of the chat.");
        wa.at("2.2s").receive("Omar", "NO WAY 💀");
        wa.at("3.0s").receive("Tina", "Drop link.");

        // Roast volley: quick hits, minimal downtime
        wa.span("3.8s", "4.6s").typing("Jay");
        wa.at("4.7s").receive("Jay", "He really thought he ate with that caption.");

        wa.span("5.0s", "5.8s").typing("Rhea");
        wa.at("5.9s").receive("Rhea", "Caption is giving: 'I lie for sport'");

        // Creator POV: typed send with auto keyboard
        wa.at("7.4s").send("I'm not even mad. I'm impressed by the audacity.", {
          typed: true,
          charDelay: 2,
        });

        // Punchline beat: let it land
        wa.at("10.0s").receive("Omar", "audacity got a blue check now 😭");
        wa.at("12.2s").receive("Tina", "Someone tag his mom.");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("1.2s", "6.6s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.2 });
        // Keep anchors strict: WhatsApp always exposes lastMessage; keyboard anchor is not guaranteed per app.
        cam.span("7.2s", "9.2s").trackCinematic("lastMessage", { scale: 1.14, smoothing: 0.16 });
        cam.span("9.2s", "13.2s").trackCinematic("lastMessage", { scale: 1.13, smoothing: 0.18 });
      })
      .build(),
});
