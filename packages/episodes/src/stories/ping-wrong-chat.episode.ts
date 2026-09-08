import { cameraSubject, cinematicProgram, cinematicShot as shot } from "@tokovo/dsl";
import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";

const DURATION = 270;
const baseTime = Date.UTC(2026, 8, 8, 9, 41);
const phone = cameraSubject.scope("phone", "app_whatsapp");
const camera = cinematicProgram({
  fps: 30,
  duration: DURATION,
  stage: {
    width: 1080,
    height: 1920,
    devices: [{ deviceId: "phone", x: 54, y: 260, width: 760, height: 1627, zIndex: 10 }],
  },
}, (cinema) => cinema.planFamily({
  plans: [{ id: "wrong-chat", default: true }],
  framings: {
    scene: { position: [0.4, 0.54], fill: 0.88, mode: "contain", padding: 24, min: 0.75, max: 1.15 },
  },
  outputs: [{
    id: "portrait-main",
    viewport: { x: 0, y: 0, width: 1080, height: 1920 },
    coveragePolicy: "require-shots",
    compositionProfileId: "hero-device",
    travel: { mode: "stabilized", subject: phone.body, position: [0.36, 0.61], maxDriftPx: [0, 0] },
    defaultRig: {
      id: "held-scene",
      subject: phone.body,
      frame: { fill: 0.88, padding: 24, min: 0.75, max: 1.15 },
      motion: { type: "cut" },
    },
  }],
  sequences: [{ outputId: "portrait-main", end: DURATION, shots: [
    shot("let-the-reply-land", DURATION, phone.body).frame("scene").cut(),
  ] }],
}));

export default defineEpisode({
  meta: {
    id: "ping-wrong-chat",
    title: "Wrong Chat — Performance Study",
    description: "A nine-second composition and reaction study: a complaint, a manager's reply, and an unsuccessful escape.",
    category: "production",
    catalogType: "story",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 85,
    tags: ["story", "whatsapp", "performer", "visual-study"],
  },
  config: { format: "1080x1920", durationInFrames: DURATION, apps: ["app_whatsapp"] },
  build: () => episode("ping-wrong-chat", {
    fps: 30, duration: "9s", title: "Wrong Chat", seed: "wrong-chat-v1",
  })
    .device("phone", "iphone16", {
      app: "app_whatsapp", appearance: "light", theme: "whatsapp-coral-studio",
      installedApps: ["app_whatsapp"],
      os: { time: baseTime, battery: 82, network: "5G" },
    })
    .background({
      type: "gradient",
      gradient: "radial-gradient(ellipse at 74% 70%, #F2D4BB 0%, transparent 53%), linear-gradient(145deg, #FFFAF4, #F6E9DC)",
      opacity: 1,
    })
    .cinematics(camera)
    .snapshot("app_whatsapp", "phone", {
      conversations: [{
        id: "work", name: "Work chat", type: "group", unreadCount: 0,
        members: [
          { id: "me", name: "Ping", accentColor: "#FF825C", onAccentColor: "#30251F" },
          { id: "manager", name: "Manager", accentColor: "#FFFFFF", onAccentColor: "#30251F" },
        ],
        messages: [{
          id: "complaint", type: "text", from: "me",
          text: "This meeting could've been an email.",
          status: "read", timestampMs: baseTime - 1000,
        }],
      }],
    })
    .whatsapp("phone", "work", (wa) => {
      wa.switchTo("work", "0s");
      wa.at("2.1s").receive("Manager", "You're presenting it.", { messageId: "reply" });
      wa.at("4.5s").deleteMessage("complaint", { deletedForEveryone: true });
      wa.span("5.2s", "5.85s").typing("Manager");
      wa.at("6s").receive("Manager", "Screenshot saved.", { messageId: "receipt" });
    })
    .overlay((overlay) => {
      const placement = { lane: "ping", xPct: 0.72, yPct: 0.2, widthPct: 0.9 };
      overlay.span("0s", "3s").performer("/performers/calendar-invite-cast/coral/neutral.png", {
        ...placement, xPct: 0.83, yPct: 0.24, widthPct: 0.76, flipX: true,
      });
      // The reply gets 0.9 seconds of reading time before the pose changes.
      overlay.span("3s", "6.8s").performer("/performers/calendar-invite-cast/coral/panic.png", placement);
      overlay.span("6.8s", "7.8s").performer("/performers/calendar-invite-cast/coral/panic.png", {
        ...placement, performerMotion: "duck",
      });
    })
    .build(),
});
