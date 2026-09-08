import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";
import { ensembleLaunchRoomCamera } from "./ensemble-launch-room.camera.js";

const FPS = 30;
const baseTime = new Date("2026-07-24T20:15:00.000Z").getTime();

const ensembleVoiceSegments = {
  "mint-scheduled": {
    id: "mint-scheduled",
    startMs: 0,
    endMs: 238,
    speaker: "mint",
  },
  "teal-legal-reaction": {
    id: "teal-legal-reaction",
    startMs: 478,
    endMs: 755,
    speaker: "teal",
  },
  "mint-company-wide": {
    id: "mint-company-wide",
    startMs: 1035,
    endMs: 1334,
    speaker: "mint",
  },
  "violet-which-draft": {
    id: "violet-which-draft",
    startMs: 1954,
    endMs: 2182,
    speaker: "violet",
  },
  "teal-apology-draft": {
    id: "teal-apology-draft",
    startMs: 2482,
    endMs: 2750,
    speaker: "teal",
  },
  "violet-keep-it": {
    id: "violet-keep-it",
    startMs: 3400,
    endMs: 3819,
    speaker: "violet",
  },
  "mint-relief": {
    id: "mint-relief",
    startMs: 4279,
    endMs: 4498,
    speaker: "mint",
  },
  "violet-rename": {
    id: "violet-rename",
    startMs: 4798,
    endMs: 5235,
    speaker: "violet",
  },
} as const;

type EnsembleVoiceSegmentId = keyof typeof ensembleVoiceSegments;

const ensembleVoice = {
  id: "ensemble-launch-room",
  manifestPath: "/voice/ensemble-launch-room/ensemble-launch-room.json",
  audioPath: "/voice/ensemble-launch-room/ensemble-launch-room.wav",
  durationMs: 5235,
  segments: ensembleVoiceSegments,
  start(segmentId: EnsembleVoiceSegmentId, fps = FPS): number {
    return Math.round((ensembleVoiceSegments[segmentId].startMs / 1000) * fps);
  },
  end(segmentId: EnsembleVoiceSegmentId, fps = FPS): number {
    return Math.round((ensembleVoiceSegments[segmentId].endMs / 1000) * fps);
  },
  duration(segmentId: EnsembleVoiceSegmentId, fps = FPS): number {
    const segment = ensembleVoiceSegments[segmentId];
    return Math.round(((segment.endMs - segment.startMs) / 1000) * fps);
  },
} as const;

export default defineEpisode({
  meta: {
    id: "ensemble-launch-room",
    title: "Launch Room: Three-Person Cut",
    description:
      "A 26-second iPhone ensemble scene where Mint, Teal, and Violet carry confidence, blame, power, and the final punchline through distinct deterministic voices and reactions.",
    category: "production",
    catalogType: "story",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 88,
    tags: [
      "story",
      "whatsapp",
      "iphone",
      "ensemble",
      "performers",
      "blurb-voice",
      "cinematography",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 780,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("ensemble-launch-room", {
      fps: FPS,
      duration: "26s",
      title: "Launch Room: Three-Person Cut",
      seed: "ensemble-launch-room-v1",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        theme: "whatsapp-signal-pop",
        installedApps: ["app_whatsapp"],
        os: {
          time: baseTime,
          battery: 68,
          network: "5G",
        },
      })
      .background("signal-pop")
      .cinematics(ensembleLaunchRoomCamera)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "ensemble_room",
            name: "Launch Room",
            avatar: "/avatars/avatar-group.png",
            type: "group",
            unreadCount: 0,
            isPinned: true,
            members: [
              { id: "me", name: "Mint" },
              { id: "teal", name: "Teal" },
              { id: "violet", name: "Violet" },
            ],
            messages: [
              {
                id: "ensemble_mint_scheduled",
                type: "text",
                from: "me",
                text: "Scheduled it ✅",
                status: "read",
                timestampMs: baseTime - 8_000,
              },
            ],
          },
        ],
      })
      .whatsapp("phone", "ensemble_room", (whatsapp) => {
        whatsapp.switchTo("ensemble_room", "0s");

        whatsapp.span("2.2s", "2.85s").typing("Teal");
        whatsapp
          .at("3s")
          .receive("Teal", "Why is Legal reacting with 👀?", {
            messageId: "ensemble_teal_legal",
          });

        whatsapp.at("8.2s").send("…it went company-wide.", {
          messageId: "ensemble_mint_company",
          input: {
            id: "ensemble-mint-confession-input",
            duration: "2.6s",
            style: "natural",
            locale: "en-US",
            keyboard: {
              platform: "ios",
              appearance: "light",
              returnKey: "send",
              autocapitalization: "sentences",
              autocorrection: true,
            },
          },
        });

        whatsapp.span("10.05s", "10.48s").typing("Violet");
        whatsapp.at("10.6s").receive("Violet", "Which draft?", {
          messageId: "ensemble_violet_draft",
        });

        whatsapp.span("12.55s", "13.05s").typing("Teal");
        whatsapp.at("13.2s").receive("Teal", "The apology draft.", {
          messageId: "ensemble_teal_apology",
        });

        whatsapp.span("15.1s", "18s").typing("Violet");
        whatsapp
          .at("18.2s")
          .receive("Violet", "Keep it. Engagement tripled.", {
            messageId: "ensemble_violet_keep",
          });

        whatsapp.at("21.2s").send("We’re safe?", {
          messageId: "ensemble_mint_relief",
        });

        whatsapp
          .at("23.05s")
          .receive("Violet", "But rename the file.", {
            messageId: "ensemble_violet_rename",
          });
      })
      .voice(ensembleVoice, (voice) => {
        voice.at("0.45s").play("mint-scheduled", { volume: 0.9 });
        voice.at("3.04s").play("teal-legal-reaction", { volume: 0.9 });
        voice.at("8.18s").play("mint-company-wide", { volume: 0.96 });
        voice.at("10.62s").play("violet-which-draft", { volume: 0.86 });
        voice.at("13.18s").play("teal-apology-draft", { volume: 0.92 });
        voice.at("18.18s").play("violet-keep-it", { volume: 0.92 });
        voice.at("21.18s").play("mint-relief", { volume: 0.9 });
        voice.at("23.04s").play("violet-rename", { volume: 0.94 });
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("THE POST WAS SCHEDULED.", {
          lane: "story-hook",
          durationFrames: 66,
          intensity: 0.84,
        });

        overlay.span("0s", "3s").performer(
          "/performers/teal-manager/calm.png",
          {
            lane: "teal",
            xPct: 0.14,
            yPct: 0.72,
            intensity: 0.28,
          },
        );
        overlay.span("3s", "13.2s").performer(
          "/performers/teal-manager/suspicious.png",
          {
            lane: "teal",
            xPct: 0.14,
            yPct: 0.72,
            intensity: 0.28,
          },
        );
        overlay.span("13.2s", "26s").performer(
          "/performers/teal-manager/judgmental.png",
          {
            lane: "teal",
            xPct: 0.14,
            yPct: 0.72,
            intensity: 0.28,
          },
        );

        overlay.span("0s", "3s").performer(
          "/performers/mint-sprite/proud.png",
          {
            lane: "mint",
            xPct: 0.5,
            yPct: 0.76,
            intensity: 0.12,
          },
        );
        overlay.span("3s", "8.2s").performer(
          "/performers/mint-sprite/frozen.png",
          {
            lane: "mint",
            xPct: 0.5,
            yPct: 0.76,
            intensity: 0.12,
          },
        );
        overlay.span("8.2s", "18.2s").performer(
          "/performers/mint-sprite/guilty.png",
          {
            lane: "mint",
            xPct: 0.5,
            yPct: 0.76,
            intensity: 0.12,
          },
        );
        overlay.span("18.2s", "21s").performer(
          "/performers/mint-sprite/frozen.png",
          {
            lane: "mint",
            xPct: 0.5,
            yPct: 0.76,
            intensity: 0.12,
          },
        );
        overlay.span("21s", "23.05s").performer(
          "/performers/mint-sprite/proud.png",
          {
            lane: "mint",
            xPct: 0.5,
            yPct: 0.76,
            intensity: 0.12,
          },
        );
        overlay.span("23.05s", "26s").performer(
          "/performers/mint-sprite/frozen.png",
          {
            lane: "mint",
            xPct: 0.5,
            yPct: 0.76,
            intensity: 0.12,
          },
        );

        overlay.span("0s", "10.6s").performer(
          "/performers/violet-founder/composed.png",
          {
            lane: "violet",
            xPct: 0.86,
            yPct: 0.72,
            intensity: 0.26,
          },
        );
        overlay.span("10.6s", "18.2s").performer(
          "/performers/violet-founder/interrupt.png",
          {
            lane: "violet",
            xPct: 0.86,
            yPct: 0.72,
            intensity: 0.26,
          },
        );
        overlay.span("18.2s", "26s").performer(
          "/performers/violet-founder/verdict.png",
          {
            lane: "violet",
            xPct: 0.86,
            yPct: 0.72,
            intensity: 0.26,
          },
        );
      })
      .audio((audio) => {
        audio.span("0s", "26s").bgm("/music/ambient-track.mp3", {
          volume: 0.1,
          fadeIn: "1.2s",
          fadeOut: "1.8s",
        });
      })
      .build(),
});
