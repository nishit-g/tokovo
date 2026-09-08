import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";
import { pingSentItCamera } from "./ping-sent-it.camera.js";

const FPS = 30;
const baseTime = new Date("2026-07-27T19:30:00.000Z").getTime();

const pingVoiceSegments = {
  "ping-delivered": {
    id: "ping-delivered",
    startMs: 0,
    endMs: 217,
    speaker: "ping",
  },
  "teal-where": {
    id: "teal-where",
    startMs: 457,
    endMs: 742,
    speaker: "teal",
  },
  "ping-room": {
    id: "ping-room",
    startMs: 1022,
    endMs: 1317,
    speaker: "ping",
  },
  "teal-two-thousand": {
    id: "teal-two-thousand",
    startMs: 1617,
    endMs: 1889,
    speaker: "teal",
  },
  "violet-good": {
    id: "violet-good",
    startMs: 2309,
    endMs: 2510,
    speaker: "violet",
  },
  "ping-relief": {
    id: "ping-relief",
    startMs: 2970,
    endMs: 3319,
    speaker: "ping",
  },
  "violet-corrected": {
    id: "violet-corrected",
    startMs: 3559,
    endMs: 3995,
    speaker: "violet",
  },
  "ping-delivered-again": {
    id: "ping-delivered-again",
    startMs: 4645,
    endMs: 4864,
    speaker: "ping",
  },
  "teal-where-again": {
    id: "teal-where-again",
    startMs: 5104,
    endMs: 5289,
    speaker: "teal",
  },
} as const;

type PingVoiceSegmentId = keyof typeof pingVoiceSegments;

const pingSentItVoice = {
  id: "ping-sent-it",
  manifestPath: "/voice/ping-sent-it/ping-sent-it.json",
  audioPath: "/voice/ping-sent-it/ping-sent-it.wav",
  durationMs: 5289,
  segments: pingVoiceSegments,
  start(segmentId: PingVoiceSegmentId, fps = FPS): number {
    return Math.round((pingVoiceSegments[segmentId].startMs / 1000) * fps);
  },
  end(segmentId: PingVoiceSegmentId, fps = FPS): number {
    return Math.round((pingVoiceSegments[segmentId].endMs / 1000) * fps);
  },
  duration(segmentId: PingVoiceSegmentId, fps = FPS): number {
    const segment = pingVoiceSegments[segmentId];
    return Math.round(((segment.endMs - segment.startMs) / 1000) * fps);
  },
} as const;

export default defineEpisode({
  meta: {
    id: "ping-sent-it",
    title: "Ping Sent It",
    description:
      "A 21-second PINGS pilot where an eager notification courier delivers twice and asks where only after the damage is done.",
    category: "production",
    catalogType: "story",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 86,
    tags: [
      "story",
      "whatsapp",
      "iphone",
      "pings",
      "performer",
      "animated-character",
      "blurb-voice",
      "micro-hooks",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 630,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("ping-sent-it", {
      fps: FPS,
      duration: "21s",
      title: "Ping Sent It",
      seed: "ping-sent-it-v1",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        theme: "whatsapp-signal-pop",
        installedApps: ["app_whatsapp"],
        os: {
          time: baseTime,
          battery: 74,
          network: "5G",
        },
      })
      .background("signal-pop")
      .cinematics(pingSentItCamera)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "pings_room",
            name: "Launch Room",
            avatar: "/avatars/avatar-group.png",
            type: "group",
            unreadCount: 0,
            isPinned: true,
            members: [
              { id: "me", name: "Ping" },
              { id: "teal", name: "Teal" },
              { id: "violet", name: "Violet" },
            ],
            messages: [
              {
                id: "ping_seed_delivered",
                type: "text",
                from: "me",
                text: "Delivered ✅",
                status: "read",
                timestampMs: baseTime - 2_000,
              },
            ],
          },
        ],
      })
      .whatsapp("phone", "pings_room", (whatsapp) => {
        whatsapp.switchTo("pings_room", "0s");

        whatsapp.at("1.3s").receive("Teal", "Ping. Where did you send it?", {
          messageId: "ping_teal_where",
        });

        whatsapp.at("4.3s").send("Launch Room?", {
          messageId: "ping_room_answer",
          input: {
            id: "ping-room-input",
            duration: "1.9s",
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

        whatsapp.at("6.3s").receive("Teal", "That room has 2,431 people.", {
          messageId: "ping_teal_scale",
        });

        whatsapp.span("9.4s", "10.35s").typing("Violet");
        whatsapp.at("10.5s").receive("Violet", "Good.", {
          messageId: "ping_violet_good",
        });

        whatsapp.at("12.7s").receive("Violet", "Now send the corrected file.", {
          messageId: "ping_violet_corrected",
        });

        whatsapp.at("15.5s").send("Delivered ✅", {
          messageId: "ping_delivered_again",
          input: {
            id: "ping-delivered-input",
            duration: "1.5s",
            style: "fast",
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

        whatsapp.span("17.6s", "18.25s").typing("Teal");
        whatsapp.at("18.4s").receive("Teal", "…where?", {
          messageId: "ping_teal_where_again",
        });
      })
      .voice(pingSentItVoice, (voice) => {
        voice.at("0.45s").play("ping-delivered", { volume: 0.9 });
        voice.at("1.62s").play("teal-where", { volume: 0.88 });
        voice.at("4.28s").play("ping-room", { volume: 0.88 });
        voice.at("6.46s").play("teal-two-thousand", { volume: 0.92 });
        voice.at("10.48s").play("violet-good", { volume: 0.9 });
        voice.at("11.18s").play("ping-relief", { volume: 0.88 });
        voice.at("12.72s").play("violet-corrected", { volume: 0.92 });
        voice.at("15.48s").play("ping-delivered-again", { volume: 0.9 });
        voice.at("18.52s").play("teal-where-again", { volume: 0.94 });
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("HE NEVER ASKS WHERE.", {
          lane: "story-hook",
          durationFrames: 38,
          intensity: 0.78,
        });

        overlay.span("0s", "1.3s").performer("/performers/teal-manager/calm.png", {
          lane: "teal",
          xPct: 0.14,
          yPct: 0.72,
          intensity: 0.25,
        });
        overlay.span("1.3s", "6.3s").performer("/performers/teal-manager/suspicious.png", {
          lane: "teal",
          xPct: 0.14,
          yPct: 0.72,
          intensity: 0.25,
        });
        overlay.span("6.3s", "21s").performer("/performers/teal-manager/judgmental.png", {
          lane: "teal",
          xPct: 0.14,
          yPct: 0.72,
          intensity: 0.25,
        });

        overlay.span("0s", "1.3s").performer("/performers/ping-courier/review.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("1.3s", "4.3s").performer("/performers/ping-courier/waiting.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("4.3s", "10.5s").performer("/performers/ping-courier/failed.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("10.5s", "11.65s").performer("/performers/ping-courier/jumping.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("11.65s", "15.5s").performer("/performers/ping-courier/running.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("15.5s", "16.65s").performer("/performers/ping-courier/jumping.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("16.65s", "18.4s").performer("/performers/ping-courier/waiting.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });
        overlay.span("18.4s", "21s").performer("/performers/ping-courier/failed.gif", {
          lane: "ping",
          xPct: 0.5,
          yPct: 0.77,
            intensity: 0.72,
        });

        overlay.span("0s", "10.5s").performer("/performers/violet-founder/composed.png", {
          lane: "violet",
          xPct: 0.86,
          yPct: 0.72,
          intensity: 0.25,
        });
        overlay.span("10.5s", "12.7s").performer("/performers/violet-founder/verdict.png", {
          lane: "violet",
          xPct: 0.86,
          yPct: 0.72,
          intensity: 0.25,
        });
        overlay.span("12.7s", "21s").performer("/performers/violet-founder/interrupt.png", {
          lane: "violet",
          xPct: 0.86,
          yPct: 0.72,
          intensity: 0.25,
        });
      })
      .audio((audio) => {
        audio.span("0s", "21s").bgm("/music/ambient-track.mp3", {
          volume: 0.075,
          fadeIn: "0.8s",
          fadeOut: "1.2s",
        });
      })
      .build(),
});
