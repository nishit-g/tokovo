import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "call-screen-exhaustive",
    title: "Call Screen Exhaustive",
    description:
      "System call flow covering incoming full-screen call treatment, answer state, active controls, and return to app.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 112,
    tags: ["system", "call", "ios", "phone", "fullscreen"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 720,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("call-screen-exhaustive", {
      fps: 30,
      duration: "24s",
      title: "Call Screen Exhaustive",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_phone"],
        os: {
          time: new Date("2026-04-10T19:12:00"),
          battery: 63,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_call_test",
            name: "Aarav",
            avatar: "/avatars/avatar-ava.jpg",
            unreadCount: 1,
            isPinned: true,
          },
        ],
      })
      .whatsapp("phone", "dm_call_test", (wa) => {
        wa.switchTo("dm_call_test", "0.6s");
        wa.at("1.3s").receive("Aarav", "Call me when you are free.");
      })
      .deviceTrack("phone", (d) => {
        d.at("4.0s").incomingCall({
          callerId: "aarav",
          callerName: "Aarav Mehta",
          isVideo: false,
          displayMode: "fullscreen",
          callerMetadata: {
            posterStyle: "modern",
            posterColor: "rgba(71, 103, 174, 0.55)",
          },
        });
        d.at("8.2s").answerCall();
        d.at("18.8s").endCall();
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.3s" });
        cam.at("4.2s").focus("device", { scale: 1.06, duration: "0.35s" });
        cam.at("8.3s").focus("device", { scale: 1.04, duration: "0.35s" });
        cam.at("18.9s").focus("device", { scale: 1.01, duration: "0.3s" });
      })
      .build(),
});
