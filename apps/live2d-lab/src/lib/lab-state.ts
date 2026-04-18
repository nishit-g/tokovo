import {
  createReactionPlan,
  type ReactionPlan,
  type ReactionSegment,
} from "@tokovo/reactions";

export interface LabAssetCheck {
  id: string;
  label: string;
  expectedPath: string;
  required: boolean;
  description: string;
}

export interface LabScenarioDefinition {
  id: string;
  label: string;
  description: string;
  durationInFrames: number;
  segments: ReactionSegment[];
}

export interface PngtuberMouthTrackProfile {
  id: string;
  label: string;
  description: string;
  mouthTrackSrc: string;
}

const LIVE2D_CORE_PATH = "/scripts/live2dcubismcore.min.js";
const LIVE2D_MODEL_PATH = "/live2d/haru/Haru.model3.json";
const LIVE2D_POSTER_PATH = "/live2d/haru/Haru.2048/texture_00.png";
const PNG_VIDEO_PATH = "/backgrounds/bokeh-loop.mp4";
const PNG_MOUTH_TRACK_PATH = "/pngtuber/mira/mouth_track.json";
const PNG_PORTRAIT_PATH = "/pngtuber/mira/portrait.png";
const PNG_MOUTH_SPRITES = {
  closed: "/pngtuber/mira/mouth/closed.svg",
  half: "/pngtuber/mira/mouth/half.svg",
  open: "/pngtuber/mira/mouth/open.svg",
  e: "/pngtuber/mira/mouth/e.svg",
  u: "/pngtuber/mira/mouth/u.svg",
} as const;

export const PNG_MOUTH_TRACK_PROFILES: PngtuberMouthTrackProfile[] = [
  {
    id: "snappy",
    label: "Snappy",
    description: "Fast punchy mouth cadence for sharp Shorts reactions.",
    mouthTrackSrc: "/pngtuber/mira/mouth_track.json",
  },
  {
    id: "drawl",
    label: "Drawl",
    description: "Longer held vowel shapes for slower commentary beats.",
    mouthTrackSrc: "/pngtuber/mira/mouth_track_drawl.json",
  },
  {
    id: "chaos",
    label: "Chaos",
    description: "High-energy open-mouth cadence for loud interruption moments.",
    mouthTrackSrc: "/pngtuber/mira/mouth_track_chaos.json",
  },
];

const PNG_FRAMES = {
  idle: PNG_PORTRAIT_PATH,
  listening: PNG_PORTRAIT_PATH,
  speaking: PNG_PORTRAIT_PATH,
  shocked: PNG_PORTRAIT_PATH,
  deadpan: PNG_PORTRAIT_PATH,
} as const;

export const LAB_SCENARIOS: Record<string, LabScenarioDefinition> = {
  "idle-baseline": {
    id: "idle-baseline",
    label: "Idle Baseline",
    description: "Verify the hero rig loads, idles, and holds stable while the guest stays quiet.",
    durationInFrames: 240,
    segments: [
      {
        id: "idle-hero-checkin",
        speakerId: "hero",
        startFrame: 30,
        endFrame: 90,
        text: "Live2D core online. Holding idle and checking motion stability.",
        emotion: "neutral",
        interruptType: "soft-cut",
        captionMode: "speech-only",
        priority: 90,
      },
    ],
  },
  "hero-interruption": {
    id: "hero-interruption",
    label: "Hero Interruption",
    description: "Stress the speaking state and a hard interruption from the hero rig.",
    durationInFrames: 300,
    segments: [
      {
        id: "hero-open",
        speakerId: "hero",
        startFrame: 20,
        endFrame: 95,
        text: "He posted the screenshot publicly. No recovery. Full damage.",
        emotion: "shocked",
        interruptType: "hard-cut",
        captionMode: "always-on",
        priority: 100,
      },
      {
        id: "hero-deadpan-tail",
        speakerId: "hero",
        startFrame: 118,
        endFrame: 175,
        text: "And somehow the font made it worse.",
        emotion: "deadpan",
        interruptType: "punch-in",
        captionMode: "speech-only",
        priority: 88,
      },
    ],
  },
  "duo-crossfire": {
    id: "duo-crossfire",
    label: "Duo Crossfire",
    description: "Run the flagship Live2D hero against the PNGTuber guest with fast turn-taking.",
    durationInFrames: 420,
    segments: [
      {
        id: "duo-hero-01",
        speakerId: "hero",
        startFrame: 24,
        endFrame: 90,
        text: "He really thought the crop would save him.",
        emotion: "happy",
        interruptType: "punch-in",
        captionMode: "always-on",
        priority: 100,
      },
      {
        id: "duo-guest-01",
        speakerId: "guest",
        startFrame: 96,
        endFrame: 148,
        text: "Chat is not letting that font go.",
        emotion: "deadpan",
        interruptType: "hard-cut",
        captionMode: "speech-only",
        priority: 96,
      },
      {
        id: "duo-hero-02",
        speakerId: "hero",
        startFrame: 162,
        endFrame: 224,
        text: "Focus the rig. I want to see the shocked expression land clean.",
        emotion: "shocked",
        interruptType: "punch-in",
        captionMode: "always-on",
        priority: 102,
      },
      {
        id: "duo-guest-02",
        speakerId: "guest",
        startFrame: 236,
        endFrame: 288,
        text: "Guest panel steady. No dropped frames. No mercy.",
        emotion: "thinking",
        interruptType: "soft-cut",
        captionMode: "speech-only",
        priority: 90,
      },
    ],
  },
};

export function getLabAssetChecks(): LabAssetCheck[] {
  return [
    {
      id: "core-script",
      label: "Cubism Core",
      expectedPath: LIVE2D_CORE_PATH,
      required: true,
      description: "Official Cubism Core runtime used by the Live2D preview adapter.",
    },
    {
      id: "live2d-model",
      label: "Haru model",
      expectedPath: LIVE2D_MODEL_PATH,
      required: true,
      description: "Official Haru sample manifest used to validate the live avatar runtime.",
    },
    {
      id: "live2d-poster",
      label: "Poster texture",
      expectedPath: LIVE2D_POSTER_PATH,
      required: true,
      description: "Fallback poster texture for stage preview and diagnostics.",
    },
    {
      id: "png-speaker",
      label: "PNGTuber portrait",
      expectedPath: PNG_PORTRAIT_PATH,
      required: true,
      description: "Generated flagship portrait plate for the PNGTuber performer.",
    },
    {
      id: "png-mouth-track",
      label: "PNGTuber mouth track",
      expectedPath: PNG_MOUTH_TRACK_PATH,
      required: true,
      description: "Timed mouth cues for motion-video PNGTuber playback.",
    },
    {
      id: "png-mouth-track-chaos",
      label: "PNGTuber chaos track",
      expectedPath: "/pngtuber/mira/mouth_track_chaos.json",
      required: true,
      description: "Alternate high-energy mouth profile for the PNGTuber performer.",
    },
    {
      id: "png-mouth-open",
      label: "PNGTuber mouth sprite",
      expectedPath: PNG_MOUTH_SPRITES.open,
      required: true,
      description: "Open-mouth sprite used by the tracked PNGTuber overlay.",
    },
  ];
}

export function buildLabReactionPlan(
  scenarioId: keyof typeof LAB_SCENARIOS = "duo-crossfire",
): ReactionPlan {
  const scenario = LAB_SCENARIOS[scenarioId];

  return createReactionPlan({
    id: `live2d-lab-${scenario.id}`,
    version: "1",
    sourceRef: {
      kind: "tokovo_episode",
      episodeId: "live2d-lab",
    },
    formatPreset: "stream-chaos-vertical",
    reviewState: "approved-render",
    cast: [
      {
        id: "hero",
        role: "hero",
        personaPromptRef: "lab-hero-v1",
        voiceProfile: {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "lab-hero",
        },
        visualProfile: {
          displayName: "Kairo Runtime",
          accentColor: "#fb923c",
          backgroundColor:
            "linear-gradient(180deg, rgba(39,16,4,0.96), rgba(15,23,42,0.98))",
          avatar: {
            kind: "live2d",
            runtime: "preview-only",
            cubismVersion: "cubism5",
            coreScriptSrc: LIVE2D_CORE_PATH,
            modelJsonSrc: LIVE2D_MODEL_PATH,
            previewPosterSrc: LIVE2D_POSTER_PATH,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            motions: {
              idle: "Idle",
              listening: "Idle",
              speaking: "TapBody",
            },
            expressions: {
              neutral: "F01",
              happy: "F05",
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
      },
      {
        id: "guest",
        role: "guest",
        personaPromptRef: "lab-guest-v1",
        voiceProfile: {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "lab-guest",
        },
        visualProfile: {
          displayName: "Mira Panel",
          accentColor: "#38bdf8",
          backgroundColor:
            "linear-gradient(180deg, rgba(8,18,33,0.96), rgba(15,23,42,0.98))",
          avatar: {
            kind: "pngtuber",
            mode: "motion-video",
            speakingFps: 10,
            videoSrc: PNG_VIDEO_PATH,
            mouthTrackSrc: PNG_MOUTH_TRACK_PATH,
            mouthAnchor: {
              x: 0.5,
              y: 0.76,
              scale: 1,
            },
            mouthSprites: PNG_MOUTH_SPRITES,
            frames: PNG_FRAMES,
          },
        },
      },
    ],
    segments: scenario.segments,
    chrome: {
      intensity: 0.78,
      liveBadge: true,
      viewerCount: 48291,
    },
    chromeCues: [
      {
        id: `${scenario.id}-qa`,
        kind: "chat-pulse",
        startFrame: 12,
        endFrame: 88,
        text: "LAB RUN ACTIVE",
        intensity: 0.72,
      },
    ],
    captions: {
      defaultMode: "always-on",
      highlightWords: true,
    },
    providerPins: {
      plannerModel: "gpt-5.4",
      ttsModel: "gemini-3.1-flash-tts-preview",
    },
  });
}
