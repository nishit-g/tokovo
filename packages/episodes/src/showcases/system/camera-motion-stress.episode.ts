import { cameraSubject, cinematicProgram, cinematicShot as shot } from "@tokovo/dsl";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

const id = "camera-motion-stress";
const wa = cameraSubject.scope("phone", "app_whatsapp");
const now = Date.UTC(2026, 8, 8, 18, 30);
const phoneStyle = {
  frame: "phone",
  direction: { entrance: { type: "cut" as const }, framing: "hold" as const },
};
const camera = cinematicProgram(
  {
    fps: 30,
    duration: 600,
    stage: {
      width: 1080,
      height: 1920,
      devices: [{ deviceId: "phone", x: 220, y: 220, width: 640, height: 1390, zIndex: 10 }],
    },
  },
  (cinema) =>
    cinema.planFamily({
      plans: [{ id: "stress", default: true }],
      look: {
        modifiers: {
          impact: {
            model: "impact-shake",
            startFrame: 495,
            durationFrames: 24,
            amplitudePx: 20,
            rotationDeg: 0.6,
            seed: 42,
          },
        },
      },
      framings: {
        phone: { position: [0.5, 0.5], fill: 0.9, max: 1.25 },
        message: { position: [0.5, 0.65], fill: 0.9, mode: "width", max: 1.5 },
        banner: { position: [0.5, 0.3], fill: 0.9, mode: "width", max: 1.5 },
      },
      outputs: [
        {
          id: "portrait",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          compositionProfileId: "hero-device",
          coveragePolicy: "require-shots",
          travel: {
            mode: "intentional",
            reason: "Exercise interruptions and moving semantic targets",
          },
          defaultRig: {
            id: "wide",
            subject: wa.body,
            frame: { fill: 0.9, max: 1.25 },
            motion: { type: "cut" },
          },
        },
      ],
      sequences: [
        {
          outputId: "portrait",
          end: 600,
          shots: [
            shot("push", 90, wa.body)
              .style(phoneStyle)
              .at(0)
              .priority(0)
              .frame("phone")
              .direct({ entrance: { type: "cut" }, framing: "hold" })
              .pushIn(1.25, 0, 80),
            shot("interrupt-push", 90, wa.semantic("last-message"))
              .at(30)
              .priority(10)
              .frame("message")
              .handoff(60, { continuity: "velocity" }),
            shot("interrupt-return", 90, wa.body)
              .at(60)
              .priority(20)
              .frame("phone")
              .handoff(60, { continuity: "velocity" }),
            shot("keyboard-and-scroll", 150, wa.semantic("last-message"))
              .at(150)
              .frame("phone")
              .readWithin(wa.screen, {
                scale: 1.3,
                region: { x: 0.05, y: 0.15, width: 0.9, height: 0.7 },
                halfLifeSeconds: 0.18,
                panLimits: { speedPxPerSecond: 900, accelerationPxPerSecondSquared: 2400 },
              }),
            shot("banner", 60, wa.notification)
              .frame("banner")
              .handoff(30, { continuity: "velocity", framing: "follow-position" }),
            shot("navigate", 60, wa.body).frame("phone").cut(),
            shot("travel-whip", 60, wa.semantic("last-message"))
              .frame("message")
              .direct({
                entrance: { type: "whip", direction: "travel", durationFrames: 18 },
                source: "freeze",
                framing: "hold",
              }),
            shot("bounded-impact", 60, wa.body)
              .frame("phone")
              .direct({ entrance: { type: "cut" }, checkFraming: true })
              .modifiers("impact"),
            shot("safe-reading", 60, wa.semantic("last-message"))
              .frame("phone")
              .readWithin(wa.screen, {
                scale: 1.3,
                minimumReadingScale: 0.8,
                minimumTextPx: 24,
                region: { x: 0.05, y: 0.15, width: 0.9, height: 0.7 },
                avoidSubjects: [wa.device("keyboard"), wa.notification],
              }),
          ],
        },
      ],
    }),
);

export default defineEpisode({
  meta: {
    id,
    title: "Camera Motion Stress",
    description:
      "Interrupted moves, keyboard reflow, wrapped messages, navigation, travel-driven smear and a bounded impact.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 114,
    tags: ["camera", "keyboard", "notifications", "regression"],
  },
  config: { format: "1080x1920", durationInFrames: 600, apps: ["app_whatsapp"] },
  build: () =>
    episode(id, { fps: 30, duration: "20s", seed: id })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        notificationUX: "native",
        installedApps: ["app_whatsapp"],
        os: { time: now, battery: 68 },
      })
      .background({
        type: "gradient",
        gradient: "linear-gradient(145deg, #f3e8d8, #d4e2dc)",
        opacity: 1,
      })
      .cinematics(camera)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "qa",
            name: "Render Review",
            unreadCount: 0,
            messages: Array.from({ length: 14 }, (_, index) => ({
              id: `history-${index}`,
              type: "text",
              from: index % 2 ? "me" : "Render Review",
              text:
                index === 13
                  ? "Keep the whole message readable."
                  : index % 2
                    ? "The review copy is ready."
                    : "Check the timing and the final reply.",
              timestampMs: now - (14 - index) * 60000,
            })),
          },
        ],
      })
      .view("app_whatsapp", "phone", { screen: "chat", conversationId: "qa" })
      .input("phone", "composer", {
        id: "draft",
        at: "5.2s",
        submitAt: "8s",
        until: "8.2s",
        text: "The keyboard changed the layout.",
        expectedFinalValue: "The keyboard changed the layout.",
        cadence: { style: "fast" },
        keyboard: { appearance: "light", returnKey: "send" },
      })
      .whatsapp("phone", "qa", (chat) => {
        chat
          .at("6s")
          .receive(
            "Render Review",
            "This longer message wraps while the keyboard is open. The camera should follow the semantic message, not an old screen coordinate.",
            { messageId: "wrapped" },
          );
        chat.at("6.3s").receive("Render Review", "One more reply moves the conversation again.", {
          messageId: "burst",
        });
        chat.at("8.2s").send("The keyboard changed the layout.", { messageId: "sent" });
        chat.openChatList("12s");
        chat.switchTo("qa", "13s");
      })
      .notificationTrack("phone", (n) => {
        n.at("9.8s").deliver({
          id: "qa-banner",
          appId: "app_whatsapp",
          foregroundBehavior: "present",
          content: { title: "Review complete", body: "Now check the interrupted camera moves." },
        });
        n.at("12s").dismiss("qa-banner");
      })
      .build(),
});
