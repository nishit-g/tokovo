import { episode } from "../code-first-episode.js";
import { defineEpisode } from "../types/episode-definition.js";

const FPS = 30;
const baseTime = new Date("2026-07-24T19:30:00.000Z").getTime();

const mintVoiceSegments = {
  "scheduled-it": {
    id: "scheduled-it",
    startMs: 0,
    endMs: 255,
    speaker: "mint",
  },
  "sent-to-everyone": {
    id: "sent-to-everyone",
    startMs: 495,
    endMs: 794,
    speaker: "mint",
  },
  "wrong-draft": {
    id: "wrong-draft",
    startMs: 1134,
    endMs: 1549,
    speaker: "mint",
  },
} as const;

type MintVoiceSegmentId = keyof typeof mintVoiceSegments;

const mintSpriteVoice = {
  id: "mint-sprite-three-message",
  manifestPath: "/voice/mint-sprite/three-message.json",
  audioPath: "/voice/mint-sprite/three-message.wav",
  durationMs: 1549,
  segments: mintVoiceSegments,
  start(segmentId: MintVoiceSegmentId, fps = FPS): number {
    return Math.round((mintVoiceSegments[segmentId].startMs / 1000) * fps);
  },
  end(segmentId: MintVoiceSegmentId, fps = FPS): number {
    return Math.round((mintVoiceSegments[segmentId].endMs / 1000) * fps);
  },
  duration(segmentId: MintVoiceSegmentId, fps = FPS): number {
    const segment = mintVoiceSegments[segmentId];
    return Math.round(((segment.endMs - segment.startMs) / 1000) * fps);
  },
} as const;

export default defineEpisode({
  meta: {
    id: "mint-sprite-three-message",
    title: "Mint Sprite: Three Messages",
    description:
      "An eight-second WhatsApp micro-story proving one reusable character identity across proud, frozen, and guilty reactions with deterministic blurb voice.",
    category: "production",
    catalogType: "story",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 90,
    tags: [
      "story",
      "whatsapp",
      "performer",
      "character",
      "blurb-voice",
      "micro-story",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 240,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("mint-sprite-three-message", {
      fps: FPS,
      duration: "8s",
      title: "Mint Sprite: Three Messages",
      seed: "mint-sprite-three-message-v1",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "light",
        theme: "whatsapp-signal-pop",
        installedApps: ["app_whatsapp"],
        os: {
          time: baseTime,
          battery: 72,
          network: "5G",
        },
      })
      .background("signal-pop")
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "launch_room",
            name: "Launch Room",
            avatar: "/avatars/avatar-group.png",
            type: "group",
            unreadCount: 0,
            isPinned: true,
            members: [
              { id: "me", name: "You" },
              { id: "mira", name: "Mira" },
              { id: "noa", name: "Noa" },
            ],
          },
        ],
      })
      .whatsapp("phone", "launch_room", (whatsapp) => {
        whatsapp.switchTo("launch_room", "0s");

        whatsapp.span("0.15s", "0.52s").typing("Mira");
        whatsapp
          .at("0.58s")
          .receive("Mira", "You scheduled the launch post, right?", {
            messageId: "mint_scheduled_question",
          });

        whatsapp.span("2.2s", "2.58s").typing("Mira");
        whatsapp
          .at("2.65s")
          .receive("Mira", "It went to the entire company.", {
            messageId: "mint_everyone_reveal",
          });

        whatsapp.span("4.55s", "4.92s").typing("Noa");
        whatsapp
          .at("5s")
          .receive("Noa", "That was the apology draft.", {
            messageId: "mint_wrong_draft_reveal",
          });
      })
      .voice(mintSpriteVoice, (voice) => {
        voice.at("0.92s").play("scheduled-it", { volume: 0.92 });
        voice.at("3.05s").play("sent-to-everyone", { volume: 0.96 });
        voice.at("5.36s").play("wrong-draft", { volume: 0.94 });
      })
      .overlay((overlay) => {
        overlay.at("0s").hook("ONE CHAT. THREE EMOTIONS.", {
          lane: "story-hook",
          durationFrames: 39,
          intensity: 0.82,
        });

        overlay.span("0.78s", "2.96s").performer(
          "/performers/mint-sprite/proud.png",
          {
            lane: "mint-sprite",
            xPct: 0.18,
            preset: "bottomLeft",
            intensity: 0.65,
          },
        );
        overlay.span("2.96s", "5.3s").performer(
          "/performers/mint-sprite/frozen.png",
          {
            lane: "mint-sprite",
            xPct: 0.18,
            preset: "bottomLeft",
            intensity: 0.65,
          },
        );
        overlay.span("5.3s", "8s").performer(
          "/performers/mint-sprite/guilty.png",
          {
            lane: "mint-sprite",
            xPct: 0.18,
            preset: "bottomLeft",
            intensity: 0.65,
          },
        );

        overlay.at("6.45s").receipt("SAME CHARACTER · MESSAGE-AWARE PERFORMANCE", {
          lane: "proof",
          preset: "top",
          durationFrames: 40,
          intensity: 0.74,
        });
      })
      .build(),
});
