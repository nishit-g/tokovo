import type {
  CaptionMode,
  ImageAvatarConfig,
  Live2DAvatarConfig,
  PngtuberAvatarConfig,
  PngtuberFrameKey,
  ReactionEmotion,
  ReactionPlan,
  ReactionSegment,
  ReactorAvatarConfig,
  VisualProfile,
} from "@tokovo/reactions";
import type {
  ReactorCardState,
  ReactorCardOverride,
  ReactorFrameState,
  PngtuberMouthShape,
  ReactorRenderConfig,
  ReactorVisualState,
  ResolvedReactorAvatar,
} from "./types.js";
import { staticFile } from "remotion";

const EMOTION_TO_PNGTUBER_FRAME: Partial<Record<ReactionEmotion, PngtuberFrameKey>> = {
  neutral: "neutral",
  happy: "happy",
  angry: "angry",
  sad: "sad",
  shocked: "shocked",
  deadpan: "deadpan",
  laughing: "laughing",
  thinking: "thinking",
};

const PNGTUBER_SPEAKING_MOUTH_SEQUENCE: PngtuberMouthShape[] = [
  "closed",
  "half",
  "open",
  "half",
];

function resolveAssetSrc(src: string | undefined): string | undefined {
  if (!src) {
    return undefined;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return staticFile(src);
}

function resolveActiveSegment(
  plan: ReactionPlan,
  frame: number,
): ReactionSegment | null {
  return (
    [...plan.segments]
      .filter((segment) => frame >= segment.startFrame && frame < segment.endFrame)
      .sort((left, right) => right.priority - left.priority)[0] ?? null
  );
}

function isCaptionVisible(mode: CaptionMode): boolean {
  return mode !== "off";
}

function resolveCardState(
  isActiveSpeaker: boolean,
  activeSegment: ReactionSegment | null,
): ReactorVisualState {
  if (!activeSegment) {
    return "idle";
  }

  return isActiveSpeaker ? "speaking" : "listening";
}

function normalizeAvatarConfig(
  visualProfile: VisualProfile,
): ReactorAvatarConfig | undefined {
  if (visualProfile.avatar) {
    return visualProfile.avatar;
  }

  if (!visualProfile.avatarImageSrc) {
    return undefined;
  }

  return {
    kind: "image",
    imageSrc: visualProfile.avatarImageSrc,
    cropMode: "cover",
  } satisfies ImageAvatarConfig;
}

function resolvePngtuberFrameKey(
  avatar: PngtuberAvatarConfig,
  state: ReactorVisualState,
  emotion: ReactionEmotion | null,
): PngtuberFrameKey {
  const emotionFrameKey = emotion ? EMOTION_TO_PNGTUBER_FRAME[emotion] : undefined;

  if (emotionFrameKey && avatar.frames[emotionFrameKey]) {
    return emotionFrameKey;
  }

  if (state === "listening" && avatar.frames.listening) {
    return "listening";
  }

  if (state === "speaking") {
    return "speaking";
  }

  if (avatar.frames.neutral) {
    return "neutral";
  }

  return "idle";
}

function resolvePngtuberMouthShape(
  state: ReactorVisualState,
  frame: number,
  speakingFps: number,
  override?: PngtuberMouthShape,
): PngtuberMouthShape {
  if (override) {
    return override;
  }

  if (state !== "speaking") {
    return "closed";
  }

  const cycle = Math.max(1, Math.round(30 / speakingFps));
  const sequenceIndex = Math.floor(frame / cycle) % PNGTUBER_SPEAKING_MOUTH_SEQUENCE.length;
  return PNGTUBER_SPEAKING_MOUTH_SEQUENCE[sequenceIndex] ?? "open";
}

function resolvePngtuberAvatar(
  avatar: PngtuberAvatarConfig,
  state: ReactorVisualState,
  emotion: ReactionEmotion | null,
  frame: number,
  override?: Extract<ReactorCardOverride["avatar"], { kind: "pngtuber" }>,
): Extract<ResolvedReactorAvatar, { kind: "pngtuber" }> {
  const frameKey = override?.frameKey ?? resolvePngtuberFrameKey(avatar, state, emotion);
  const idleAssetSrc = resolveAssetSrc(avatar.frames.idle);
  if (!idleAssetSrc) {
    throw new Error("PNGTuber avatar must define an idle frame asset");
  }

  const activeAssetSrc =
    override?.activeAssetSrc
      ? resolveAssetSrc(override.activeAssetSrc) ?? idleAssetSrc
      : resolveAssetSrc(
      avatar.frames[frameKey] ?? avatar.frames.speaking ?? avatar.frames.idle,
    ) ?? idleAssetSrc;
  const speakingFps = override?.speakingFps ?? avatar.speakingFps;
  const cycle = Math.max(1, Math.round(30 / speakingFps));
  const pulseStep = state === "speaking" ? frame % cycle : 0;
  const pulseScale = override?.pulseScale
    ?? (state === "speaking" && cycle > 1
      ? 1 + pulseStep / (cycle * 24)
      : 1);
  const mouthSprites = avatar.mouthSprites
    ? Object.fromEntries(
        Object.entries(avatar.mouthSprites).map(([key, src]) => [key, resolveAssetSrc(src) ?? src]),
      ) as Partial<Record<PngtuberMouthShape, string>>
    : undefined;
  const mouthShape = resolvePngtuberMouthShape(
    state,
    frame,
    speakingFps,
    override?.mouthShape,
  );

  return {
    kind: "pngtuber",
    mode: avatar.mode,
    activeAssetSrc,
    frameKey,
    speakingFps,
    pulseScale,
    playbackFrame: frame,
    videoSrc: avatar.videoSrc ? resolveAssetSrc(avatar.videoSrc) ?? avatar.videoSrc : undefined,
    mouthTrackSrc:
      override?.mouthTrackSrc
        ? resolveAssetSrc(override.mouthTrackSrc) ?? override.mouthTrackSrc
        : avatar.mouthTrackSrc
        ? resolveAssetSrc(avatar.mouthTrackSrc) ?? avatar.mouthTrackSrc
        : undefined,
    mouthAnchor: avatar.mouthAnchor,
    mouthSprites,
    mouthShape,
  };
}

function resolveLive2DAvatar(
  avatar: Live2DAvatarConfig,
  state: ReactorVisualState,
  emotion: ReactionEmotion | null,
  frame: number,
  override?: Extract<ReactorCardOverride["avatar"], { kind: "live2d" }>,
): Extract<ResolvedReactorAvatar, { kind: "live2d" }> {
  const motion = override?.motion
    ?? (
    state === "speaking"
      ? avatar.motions.speaking
      : state === "listening"
        ? avatar.motions.listening
        : avatar.motions.idle
  );
  const expression = override?.expression
    ?? (emotion
    ? avatar.expressions[emotion] ?? avatar.expressions.neutral
    : avatar.expressions.neutral);
  const cycle = state === "speaking" ? 18 : state === "listening" ? 42 : 60;
  const motionProgress = ((frame % cycle) + 1) / cycle;
  const mouthOpen = state === "speaking"
    ? 0.45 + 0.35 * (0.5 + 0.5 * Math.sin((frame / 2.2) * Math.PI))
    : 0.08;
  const blinkWindow = frame % 96;
  const blink =
    blinkWindow >= 74 && blinkWindow <= 80
      ? 1 - Math.abs(77 - blinkWindow) / 3
      : 0;
  const focusEnergy = state === "speaking" ? 0.92 : state === "listening" ? 0.64 : 0.36;
  const swayX = Math.sin(frame / 18) * (state === "speaking" ? 6 : 3);
  const bobY = Math.cos(frame / 22) * (state === "speaking" ? 5 : 2.5);
  const runtimeState = {
    motionProgress,
    mouthOpen,
    blink,
    focusEnergy,
    swayX,
    bobY,
    ...override?.runtimeState,
  };

  return {
    kind: "live2d",
    runtime: "preview-only",
    cubismVersion: avatar.cubismVersion,
    coreScriptSrc:
      resolveAssetSrc(
        "coreScriptSrc" in avatar
          ? avatar.coreScriptSrc
          : "/scripts/live2dcubismcore.min.js",
      ) ?? "/scripts/live2dcubismcore.min.js",
    modelJsonSrc: resolveAssetSrc(avatar.modelJsonSrc) ?? avatar.modelJsonSrc,
    posterSrc: resolveAssetSrc(avatar.previewPosterSrc),
    motion,
    expression,
    scale: override?.scale ?? avatar.scale,
    offsetX: override?.offsetX ?? avatar.offsetX,
    offsetY: override?.offsetY ?? avatar.offsetY,
    parameterBindings: avatar.parameterBindings,
    runtimeState,
  };
}

export function resolveReactorAvatar(
  visualProfile: VisualProfile,
  state: ReactorVisualState,
  emotion: ReactionEmotion | null,
  frame: number,
  avatarOverride?: ReactorCardOverride["avatar"],
): ResolvedReactorAvatar {
  const avatar = normalizeAvatarConfig(visualProfile);

  if (!avatar) {
    return {
      kind: "image",
      cropMode: "cover",
      usesFallbackGradient: true,
    };
  }

  switch (avatar.kind) {
    case "image":
      return {
        kind: "image",
        activeAssetSrc:
          resolveAssetSrc(
            avatarOverride?.kind === "image" ? avatarOverride.activeAssetSrc : undefined,
          ) ?? resolveAssetSrc(avatar.imageSrc),
        cropMode:
          avatarOverride?.kind === "image" && avatarOverride.cropMode
            ? avatarOverride.cropMode
            : avatar.cropMode,
        usesFallbackGradient: false,
      };
    case "pngtuber":
      return resolvePngtuberAvatar(
        avatar,
        state,
        emotion,
        frame,
        avatarOverride?.kind === "pngtuber" ? avatarOverride : undefined,
      );
    case "live2d":
      return resolveLive2DAvatar(
        avatar,
        state,
        emotion,
        frame,
        avatarOverride?.kind === "live2d" ? avatarOverride : undefined,
      );
  }
}

function applyCardOverride(
  card: ReactorCardState,
  visualProfile: VisualProfile,
  frame: number,
  override: ReactorCardOverride,
): ReactorCardState {
  const state = override.state ?? card.state;
  const emotion = Object.prototype.hasOwnProperty.call(override, "emotion")
    ? override.emotion ?? null
    : card.emotion;
  const isActiveSpeaker = override.isActiveSpeaker ?? state === "speaking";

  return {
    ...card,
    state,
    emotion,
    isActiveSpeaker,
    avatar:
      override.avatar || override.state || Object.prototype.hasOwnProperty.call(override, "emotion")
        ? resolveReactorAvatar(visualProfile, state, emotion, frame, override.avatar)
        : card.avatar,
  };
}

export function buildReactorFrameState(
  plan: ReactionPlan,
  frame: number,
  config: Pick<
    ReactorRenderConfig,
    "showCaptions" | "showChrome" | "cardOverrides"
  > = {},
): ReactorFrameState {
  const activeSegment = resolveActiveSegment(plan, frame);
  const cards = plan.cast.map((member) => {
    const isActiveSpeaker = activeSegment?.speakerId === member.id;
    const emotion = isActiveSpeaker ? activeSegment?.emotion ?? null : null;
    const state = resolveCardState(isActiveSpeaker, activeSegment);

    return {
      id: member.id,
      displayName: member.visualProfile.displayName,
      accentColor: member.visualProfile.accentColor,
      backgroundColor: member.visualProfile.backgroundColor,
      state,
      emotion,
      isActiveSpeaker,
      avatar: resolveReactorAvatar(member.visualProfile, state, emotion, frame),
    } satisfies ReactorCardState;
  }).map((card) => {
    const override = config.cardOverrides?.[card.id];
    if (!override) {
      return card;
    }

    const castMember = plan.cast.find((member) => member.id === card.id);
    if (!castMember) {
      return card;
    }

    return applyCardOverride(card, castMember.visualProfile, frame, override);
  });

  const activeCue =
    plan.chromeCues.find((cue) => frame >= cue.startFrame && frame < cue.endFrame) ??
    null;

  return {
    activeSegment,
    activeCaption:
      config.showCaptions === false ||
      !activeSegment ||
      !isCaptionVisible(activeSegment.captionMode)
        ? null
        : {
            text: activeSegment.text,
            speakerId: activeSegment.speakerId,
            startFrame: activeSegment.startFrame,
            endFrame: activeSegment.endFrame,
          },
    cards,
    chrome: {
      liveBadge: config.showChrome !== false && plan.chrome.liveBadge,
      viewerCount: config.showChrome === false ? 0 : plan.chrome.viewerCount,
      cueText: config.showChrome === false ? null : activeCue?.text ?? null,
    },
  };
}
