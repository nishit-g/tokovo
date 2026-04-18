import type {
  Live2DParameterBindings,
  PngtuberFrameKey,
  PngtuberAvatarConfig,
  ReactionEmotion,
  ReactionFormatPreset,
  ReactionPlan,
  ReactionSegment,
} from "@tokovo/reactions";

export type ReactorLayoutPreset = ReactionFormatPreset;

export type ReactorVisualState =
  | "idle"
  | "listening"
  | "speaking"
  | "laughing"
  | "shocked"
  | "deadpan"
  | "angry"
  | "thinking";

export interface ReactorCue {
  id: string;
  speakerId: string;
  startFrame: number;
  endFrame: number;
  state: ReactorVisualState;
}

export interface ReactorRenderConfig {
  layoutPreset?: ReactorLayoutPreset;
  cardScale?: number;
  showCaptions?: boolean;
  showChrome?: boolean;
  showDebugTimeline?: boolean;
  enableLive2DPreviewRuntime?: boolean;
  cardOverrides?: Record<string, ReactorCardOverride>;
}

export interface Live2DPreviewRuntimeState {
  motionProgress: number;
  mouthOpen: number;
  blink: number;
  focusEnergy: number;
  swayX: number;
  bobY: number;
}

export type PngtuberMouthShape = "closed" | "half" | "open" | "e" | "u";

export type ReactorAvatarOverride =
  | {
      kind: "image";
      activeAssetSrc?: string;
      cropMode?: "cover" | "contain";
    }
  | {
      kind: "pngtuber";
      frameKey?: PngtuberFrameKey;
      speakingFps?: number;
      pulseScale?: number;
      activeAssetSrc?: string;
      mouthTrackSrc?: string;
      mouthShape?: PngtuberMouthShape;
    }
  | {
      kind: "live2d";
      motion?: string;
      expression?: string;
      scale?: number;
      offsetX?: number;
      offsetY?: number;
      runtimeState?: Partial<Live2DPreviewRuntimeState>;
    };

export interface ReactorCardOverride {
  state?: ReactorVisualState;
  emotion?: ReactionEmotion | null;
  isActiveSpeaker?: boolean;
  avatar?: ReactorAvatarOverride;
}

export type ResolvedReactorAvatar =
  | {
      kind: "image";
      activeAssetSrc?: string;
      cropMode: "cover" | "contain";
      usesFallbackGradient: boolean;
    }
  | {
      kind: "pngtuber";
      mode: PngtuberAvatarConfig["mode"];
      activeAssetSrc: string;
      frameKey: PngtuberFrameKey;
      speakingFps: number;
      pulseScale: number;
      playbackFrame: number;
      videoSrc?: string;
      mouthTrackSrc?: string;
      mouthAnchor: {
        x: number;
        y: number;
        scale: number;
      };
      mouthSprites?: Partial<Record<PngtuberMouthShape, string>>;
      mouthShape: PngtuberMouthShape;
    }
  | {
      kind: "live2d";
      runtime: "preview-only";
      cubismVersion: "cubism4" | "cubism5";
      coreScriptSrc: string;
      modelJsonSrc: string;
      posterSrc?: string;
      motion?: string;
      expression?: string;
      scale: number;
      offsetX: number;
      offsetY: number;
      parameterBindings: Live2DParameterBindings;
      runtimeState: Live2DPreviewRuntimeState;
    };

export interface ReactorCardState {
  id: string;
  displayName: string;
  accentColor: string;
  backgroundColor?: string;
  state: ReactorVisualState;
  emotion: ReactionEmotion | null;
  isActiveSpeaker: boolean;
  avatar: ResolvedReactorAvatar;
}

export interface ReactorFrameState {
  activeSegment: ReactionSegment | null;
  activeCaption: {
    text: string;
    speakerId: string;
    startFrame: number;
    endFrame: number;
  } | null;
  cards: ReactorCardState[];
  chrome: {
    liveBadge: boolean;
    viewerCount: number;
    cueText: string | null;
  };
}

export interface ReactorsLayerProps {
  reactionPlan: ReactionPlan;
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
  config?: ReactorRenderConfig;
}
