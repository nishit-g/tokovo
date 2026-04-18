import {
  applyCharacterPresetToCastMember,
  createCharacterPreset,
  createFixtureReactionPlan,
  createNormalizedReactionSource,
  createReactionPlan,
  draftReactionPlanFromSource,
} from "@tokovo/reactions";
import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "v2-reactor-baseline",
    title: "V2 Baseline: Reactor Stream Chaos",
    description:
      "Tokovo-native reactor baseline with deterministic side panels, spoken interruption timing, and stream-style chrome.",
    category: "showcase",
    tags: ["v2", "reactors", "stream-chaos", "shorts", "whatsapp"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("v2-reactor-baseline", { fps: 30, duration: "30s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x"],
        os: {
          time: new Date("2026-04-18T20:41:00"),
          battery: 68,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "grp_reactor",
            name: "Receipt Raiders",
            avatar: "/avatars/avatar-group.png",
            unreadCount: 5,
            type: "group",
            participants: ["Me", "Rhea", "Kabir", "Maya"],
          },
        ],
      })
      .background({ type: "gradient", gradient: "linear-gradient(180deg, #050816 0%, #111827 100%)" })
      .reactors(
        (() => {
          const heroPreset = createCharacterPreset({
            id: "preset-kairo-flagship",
            personaPromptRef: "hero-v1",
            voiceProfile: {
              provider: "gemini",
              model: "gemini-3.1-flash-tts-preview",
              voiceId: "hero-voice",
            },
            visualProfile: {
              displayName: "Kairo.exe",
              accentColor: "#f97316",
              backgroundColor:
                "linear-gradient(180deg, rgba(32,13,8,0.96), rgba(17,24,39,0.98))",
              avatar: {
                kind: "live2d",
                runtime: "preview-only",
                cubismVersion: "cubism5",
                coreScriptSrc: "/scripts/live2dcubismcore.min.js",
                modelJsonSrc: "/live2d/haru/Haru.model3.json",
                previewPosterSrc: "/live2d/haru/Haru.2048/texture_00.png",
                scale: 1,
                offsetX: 0,
                offsetY: 0,
                motions: {
                  idle: "Idle",
                  listening: "Idle",
                  speaking: "TapBody",
                },
                expressions: {
                  shocked: "F08",
                  deadpan: "F01",
                },
                parameterBindings: {
                  mouthOpenParamIds: ["ParamMouthOpenY"],
                  eyeOpenParamIds: ["ParamEyeLOpen", "ParamEyeROpen"],
                  angleXParamId: "ParamAngleX",
                  angleYParamId: "ParamAngleY",
                  bodyAngleXParamId: "ParamBodyAngleX",
                  visemeMap: {
                    A: 1,
                    E: 0.72,
                    I: 0.64,
                    O: 0.85,
                    U: 0.58,
                  },
                },
              },
            },
            assetBundle: {
              id: "bundle-kairo-haru-live2d",
              rights: {
                status: "approved",
                usageScope: "prototype",
                provider: "Live2D Inc.",
                licenseRef: "live2d-sdk-web-5-r5-haru-sample",
                attribution: "Live2D Cubism SDK for Web sample model: Haru",
                notes:
                  "Demo rig uses the official Haru sample model while the custom flagship rig is in development. Sample-model terms and Cubism SDK release-license obligations still apply before production release.",
              },
              assets: [
                {
                  id: "kairo-live2d-core",
                  kind: "other",
                  src: "/scripts/live2dcubismcore.min.js",
                },
                {
                  id: "kairo-live2d-model",
                  kind: "live2d-model",
                  src: "/live2d/haru/Haru.model3.json",
                  notes: "Official Haru sample model from Cubism SDK for Web 5 R5.",
                },
                {
                  id: "kairo-live2d-poster",
                  kind: "image",
                  src: "/live2d/haru/Haru.2048/texture_00.png",
                },
              ],
            },
          });

          const guestPreset = createCharacterPreset({
            id: "preset-mira-pngtuber",
            personaPromptRef: "guest-v1",
            voiceProfile: {
              provider: "gemini",
              model: "gemini-3.1-flash-tts-preview",
              voiceId: "guest-voice",
            },
            visualProfile: {
              displayName: "Mira Byte",
              accentColor: "#38bdf8",
              backgroundColor:
                "linear-gradient(180deg, rgba(8,18,33,0.96), rgba(15,23,42,0.98))",
              avatar: {
                kind: "pngtuber",
                mode: "motion-video",
                speakingFps: 10,
                videoSrc: "/backgrounds/bokeh-loop.mp4",
                mouthTrackSrc: "/pngtuber/mira/mouth_track.json",
                mouthAnchor: {
                  x: 0.5,
                  y: 0.76,
                  scale: 1,
                },
                mouthSprites: {
                  closed: "/pngtuber/mira/mouth/closed.svg",
                  half: "/pngtuber/mira/mouth/half.svg",
                  open: "/pngtuber/mira/mouth/open.svg",
                  e: "/pngtuber/mira/mouth/e.svg",
                  u: "/pngtuber/mira/mouth/u.svg",
                },
                frames: {
                  idle: "/pngtuber/mira/portrait.png",
                  listening: "/pngtuber/mira/portrait.png",
                  speaking: "/pngtuber/mira/portrait.png",
                  shocked: "/pngtuber/mira/portrait.png",
                  deadpan: "/pngtuber/mira/portrait.png",
                },
              },
            },
            assetBundle: {
              id: "bundle-mira-pngtuber",
              rights: {
                status: "approved",
                usageScope: "commercial",
                provider: "Tokovo Internal Studio",
              },
              assets: [
                {
                  id: "mira-portrait",
                  kind: "image",
                  src: "/pngtuber/mira/portrait.png",
                },
                {
                  id: "mira-motion-video",
                  kind: "video",
                  src: "/backgrounds/bokeh-loop.mp4",
                },
                {
                  id: "mira-mouth-track",
                  kind: "mouth-track",
                  src: "/pngtuber/mira/mouth_track.json",
                },
                {
                  id: "mira-mouth-open",
                  kind: "mouth-sprite",
                  src: "/pngtuber/mira/mouth/open.svg",
                },
              ],
            },
          });

          const cast = createFixtureReactionPlan({
            cast: [
              applyCharacterPresetToCastMember({
                id: "hero",
                role: "hero",
                preset: heroPreset,
              }),
              applyCharacterPresetToCastMember({
                id: "guest",
                role: "guest",
                preset: guestPreset,
              }),
            ],
          }).cast;
          const plan = draftReactionPlanFromSource({
            id: "v2-reactor-baseline-plan",
            mode: "assist",
            version: "1",
            formatPreset: "stream-chaos-vertical",
            source: createNormalizedReactionSource({
              id: "v2-reactor-baseline-source",
              sourceRef: {
                kind: "tokovo_episode",
                episodeId: "v2-reactor-baseline",
              },
              title: "Group chat screenshot spiral",
              synopsis:
                "A WhatsApp group discovers that a bad screenshot has gone public and every reply piles on harder.",
              transcript: [
                {
                  id: "line-1",
                  text: "He posted the screenshot publicly??",
                  startFrame: 42,
                  endFrame: 72,
                },
                {
                  id: "line-2",
                  text: "Bro thought cropping would save him.",
                  startFrame: 76,
                  endFrame: 110,
                },
                {
                  id: "line-3",
                  text: "Why are the replies roasting his font too?",
                  startFrame: 144,
                  endFrame: 184,
                },
              ],
            }),
            cast,
            targetDurationFrames: 210,
            providerPins: {
              plannerModel: "gpt-5.4",
              ttsModel: "gemini-3.1-flash-tts-preview",
            },
          });

          return createReactionPlan({
            ...plan,
            characterPresets: [heroPreset, guestPreset],
            assetRegistry: [heroPreset.assetBundle!, guestPreset.assetBundle!],
            reviewState: "approved-render",
            chromeCues: [
              ...plan.chromeCues,
              {
                id: "cue_chat_spike",
                kind: "chat-pulse",
                startFrame: 48,
                endFrame: 110,
                text: "CHAT IS LOSING IT",
                intensity: 0.8,
              },
            ],
          });
        })(),
      )
      .overlay((ov) => {
        ov.at("0.2s").hook("When the group chat finds the screenshot.", {
          durationFrames: 110,
          intensity: 0.95,
        });
      })
      .whatsapp("phone", "grp_reactor", (wa) => {
        wa.switchTo("grp_reactor", "0s");
        wa.at("1.7s").receive("Rhea", "He posted the screenshot publicly??");
        wa.at("2.8s").receive("Kabir", "bro thought cropping would save him");
        wa.at("4.0s").receive("Maya", "open the replies RIGHT NOW");
        wa.at("6.0s").send("No because why are the replies roasting his font too", {
          typed: true,
          charDelay: 2,
        });
        wa.at("10.1s").receive("Rhea", "nah the font slander is deserved");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.span("1.5s", "12s").trackCinematic("lastMessage", {
          scale: 1.08,
          smoothing: 0.18,
        });
      })
      .build(),
});
