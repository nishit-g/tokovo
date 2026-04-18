import { z } from "zod";

export const ReactionFormatPresetSchema = z.enum([
  "stream-chaos-vertical",
  "hero-left",
  "hero-right",
  "duo-sides",
]);

export type ReactionFormatPreset = z.infer<typeof ReactionFormatPresetSchema>;

export const ReactionReviewStateSchema = z.enum([
  "draft",
  "locked-script",
  "locked-audio",
  "approved-render",
]);

export type ReactionReviewState = z.infer<typeof ReactionReviewStateSchema>;

export const ReactionEmotionSchema = z.enum([
  "neutral",
  "happy",
  "angry",
  "sad",
  "shocked",
  "deadpan",
  "laughing",
  "thinking",
]);

export type ReactionEmotion = z.infer<typeof ReactionEmotionSchema>;

export const InterruptTypeSchema = z.enum([
  "none",
  "soft-cut",
  "hard-cut",
  "punch-in",
  "stacked",
]);

export type InterruptType = z.infer<typeof InterruptTypeSchema>;

export const CaptionModeSchema = z.enum(["always-on", "speech-only", "off"]);

export type CaptionMode = z.infer<typeof CaptionModeSchema>;

export const RightsInfoSchema = z.object({
  status: z.enum(["internal-review", "approved", "licensed", "blocked"]),
  notes: z.string().optional(),
});

export type RightsInfo = z.infer<typeof RightsInfoSchema>;

export const AssetUsageScopeSchema = z.enum([
  "internal",
  "commercial",
  "editorial",
  "prototype",
]);

export type AssetUsageScope = z.infer<typeof AssetUsageScopeSchema>;

export const AvatarAssetKindSchema = z.enum([
  "image",
  "video",
  "json",
  "live2d-model",
  "mouth-track",
  "mouth-sprite",
  "other",
]);

export type AvatarAssetKind = z.infer<typeof AvatarAssetKindSchema>;

export const AvatarAssetDescriptorSchema = z.object({
  id: z.string().min(1),
  kind: AvatarAssetKindSchema,
  src: z.string().min(1),
  notes: z.string().optional(),
});

export type AvatarAssetDescriptor = z.infer<typeof AvatarAssetDescriptorSchema>;

export const AssetRightsSchema = z.object({
  status: RightsInfoSchema.shape.status,
  usageScope: AssetUsageScopeSchema.default("internal"),
  provider: z.string().min(1).optional(),
  licenseRef: z.string().min(1).optional(),
  attribution: z.string().optional(),
  notes: z.string().optional(),
});

export type AssetRights = z.infer<typeof AssetRightsSchema>;

export const AvatarAssetBundleSchema = z.object({
  id: z.string().min(1),
  rights: AssetRightsSchema,
  assets: z.array(AvatarAssetDescriptorSchema).min(1),
});

export type AvatarAssetBundle = z.infer<typeof AvatarAssetBundleSchema>;

export const ProvenanceSchema = z.object({
  sourceUrl: z.string().url(),
  platform: z.string().min(1),
  creatorHandle: z.string().optional(),
  importedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;

const RequiredProvenanceSchema = z.preprocess(
  (value) => value ?? {},
  ProvenanceSchema,
);

export const PngtuberFrameKeySchema = z.enum([
  "idle",
  "listening",
  "speaking",
  "neutral",
  "happy",
  "angry",
  "sad",
  "shocked",
  "deadpan",
  "laughing",
  "thinking",
]);

export type PngtuberFrameKey = z.infer<typeof PngtuberFrameKeySchema>;

export const ImageAvatarConfigSchema = z.object({
  kind: z.literal("image"),
  imageSrc: z.string().min(1),
  cropMode: z.enum(["cover", "contain"]).default("cover"),
});

export type ImageAvatarConfig = z.infer<typeof ImageAvatarConfigSchema>;

export const PngtuberAvatarConfigSchema = z.object({
  kind: z.literal("pngtuber"),
  mode: z.enum(["frame-swap", "motion-video"]).default("frame-swap"),
  speakingFps: z.number().positive().default(8),
  videoSrc: z.string().min(1).optional(),
  mouthTrackSrc: z.string().min(1).optional(),
  mouthAnchor: z
    .object({
      x: z.number().min(0).max(1).default(0.5),
      y: z.number().min(0).max(1).default(0.74),
      scale: z.number().positive().default(1),
    })
    .default({
      x: 0.5,
      y: 0.74,
      scale: 1,
    }),
  mouthSprites: z
    .object({
      closed: z.string().min(1),
      open: z.string().min(1),
      half: z.string().min(1).optional(),
      e: z.string().min(1).optional(),
      u: z.string().min(1).optional(),
    })
    .optional(),
  frames: z.object({
    idle: z.string().min(1),
    listening: z.string().min(1).optional(),
    speaking: z.string().min(1),
    neutral: z.string().min(1).optional(),
    happy: z.string().min(1).optional(),
    angry: z.string().min(1).optional(),
    sad: z.string().min(1).optional(),
    shocked: z.string().min(1).optional(),
    deadpan: z.string().min(1).optional(),
    laughing: z.string().min(1).optional(),
    thinking: z.string().min(1).optional(),
  }),
}).superRefine((avatar, ctx) => {
  if (avatar.mode !== "motion-video") {
    return;
  }

  if (!avatar.videoSrc) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "videoSrc is required when pngtuber mode is motion-video",
      path: ["videoSrc"],
    });
  }

  if (!avatar.mouthTrackSrc) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "mouthTrackSrc is required when pngtuber mode is motion-video",
      path: ["mouthTrackSrc"],
    });
  }

  if (!avatar.mouthSprites) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "mouthSprites are required when pngtuber mode is motion-video",
      path: ["mouthSprites"],
    });
  }
});

export type PngtuberAvatarConfig = z.infer<typeof PngtuberAvatarConfigSchema>;

export const Live2DParameterBindingsSchema = z.object({
  mouthOpenParamIds: z.array(z.string().min(1)).default([]),
  eyeOpenParamIds: z.array(z.string().min(1)).default([]),
  angleXParamId: z.string().min(1).optional(),
  angleYParamId: z.string().min(1).optional(),
  bodyAngleXParamId: z.string().min(1).optional(),
  visemeMap: z
    .object({
      A: z.number().min(0).max(1).optional(),
      E: z.number().min(0).max(1).optional(),
      I: z.number().min(0).max(1).optional(),
      O: z.number().min(0).max(1).optional(),
      U: z.number().min(0).max(1).optional(),
    })
    .default({}),
});

export type Live2DParameterBindings = z.infer<
  typeof Live2DParameterBindingsSchema
>;

export const Live2DAvatarConfigSchema = z.object({
  kind: z.literal("live2d"),
  runtime: z.literal("preview-only"),
  cubismVersion: z.enum(["cubism4", "cubism5"]).default("cubism5"),
  coreScriptSrc: z.string().min(1).default("/scripts/live2dcubismcore.min.js"),
  modelJsonSrc: z.string().min(1),
  previewPosterSrc: z.string().min(1).optional(),
  motions: z
    .object({
      idle: z.string().min(1).optional(),
      listening: z.string().min(1).optional(),
      speaking: z.string().min(1).optional(),
    })
    .default({}),
  expressions: z
    .object({
      neutral: z.string().min(1).optional(),
      happy: z.string().min(1).optional(),
      angry: z.string().min(1).optional(),
      sad: z.string().min(1).optional(),
      shocked: z.string().min(1).optional(),
      deadpan: z.string().min(1).optional(),
      laughing: z.string().min(1).optional(),
      thinking: z.string().min(1).optional(),
    })
    .default({}),
  scale: z.number().positive().default(1),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  parameterBindings: Live2DParameterBindingsSchema.default({
    mouthOpenParamIds: [],
    eyeOpenParamIds: [],
    visemeMap: {},
  }),
});

export type Live2DAvatarConfig = z.infer<typeof Live2DAvatarConfigSchema>;

export const ReactorAvatarConfigSchema = z.discriminatedUnion("kind", [
  ImageAvatarConfigSchema,
  PngtuberAvatarConfigSchema,
  Live2DAvatarConfigSchema,
]);

export type ReactorAvatarConfig = z.infer<typeof ReactorAvatarConfigSchema>;

export const VisualProfileSchema = z.object({
  displayName: z.string().min(1),
  accentColor: z.string().min(1),
  backgroundColor: z.string().optional(),
  avatarImageSrc: z.string().optional(),
  avatar: ReactorAvatarConfigSchema.optional(),
});

export type VisualProfile = z.infer<typeof VisualProfileSchema>;

export interface VoiceProfile {
  provider: string;
  model: string;
  voiceId: string;
  stylePrompt?: string;
  fallbackChain?: VoiceProfile[];
}

export const VoiceProfileSchema: z.ZodType<VoiceProfile> = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  voiceId: z.string().min(1),
  stylePrompt: z.string().optional(),
  fallbackChain: z
    .array(
      z.object({
        provider: z.string().min(1),
        model: z.string().min(1),
        voiceId: z.string().min(1),
        stylePrompt: z.string().optional(),
      }),
    )
    .optional(),
});

export const CharacterPresetSchema = z.object({
  id: z.string().min(1),
  personaPromptRef: z.string().min(1),
  visualProfile: VisualProfileSchema,
  voiceProfile: VoiceProfileSchema,
  assetBundle: AvatarAssetBundleSchema.optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type CharacterPreset = z.infer<typeof CharacterPresetSchema>;

export const SourceRefSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("tokovo_episode"),
    episodeId: z.string().min(1),
  }),
  z.object({
    kind: z.literal("imported_post"),
    provenance: RequiredProvenanceSchema,
    rights: RightsInfoSchema,
  }),
  z.object({
    kind: z.literal("imported_clip"),
    provenance: z.preprocess(
      (value) => value ?? {},
      ProvenanceSchema.extend({
        durationMs: z.number().positive().optional(),
      }),
    ),
    rights: RightsInfoSchema,
    assetRefs: z.array(z.string()).default([]),
  }),
]);

export type SourceRef = z.infer<typeof SourceRefSchema>;

export const ReactorCastMemberSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["hero", "guest", "panelist"]),
  presetId: z.string().min(1).optional(),
  visualProfile: VisualProfileSchema,
  voiceProfile: VoiceProfileSchema,
  personaPromptRef: z.string().min(1),
});

export type ReactorCastMember = z.infer<typeof ReactorCastMemberSchema>;

export const ReactionSegmentSchema = z
  .object({
    id: z.string().min(1),
    speakerId: z.string().min(1),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    text: z.string().min(1),
    emotion: ReactionEmotionSchema,
    interruptType: InterruptTypeSchema,
    captionMode: CaptionModeSchema,
    priority: z.number().int(),
    audioRef: z.string().optional(),
  })
  .refine((segment) => segment.endFrame > segment.startFrame, {
    message: "endFrame must be greater than startFrame",
    path: ["endFrame"],
  });

export type ReactionSegment = z.infer<typeof ReactionSegmentSchema>;

export const StreamChromeCueSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["chat-pulse", "donation", "emote-burst", "turn-indicator"]),
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().positive(),
  text: z.string().optional(),
  intensity: z.number().min(0).max(1).default(0.65),
});

export type StreamChromeCue = z.infer<typeof StreamChromeCueSchema>;

export const ReactionTurnPolicySchema = z.object({
  minimumGapFrames: z.number().int().nonnegative().default(2),
  preferHigherPriorityInterrupts: z.boolean().default(true),
});

export type ReactionTurnPolicy = z.infer<typeof ReactionTurnPolicySchema>;

export const ReactionPlanSchema = z
  .object({
    id: z.string().min(1),
    sourceRef: SourceRefSchema,
    formatPreset: ReactionFormatPresetSchema.default("stream-chaos-vertical"),
    cast: z.array(ReactorCastMemberSchema),
    segments: z.array(ReactionSegmentSchema),
    characterPresets: z.array(CharacterPresetSchema).default([]),
    assetRegistry: z.array(AvatarAssetBundleSchema).default([]),
    captions: z
      .object({
        defaultMode: CaptionModeSchema.default("always-on"),
        highlightWords: z.boolean().default(true),
      })
      .default({
        defaultMode: "always-on",
        highlightWords: true,
      }),
    chrome: z
      .object({
        intensity: z.number().min(0).max(1).default(0.75),
        liveBadge: z.boolean().default(true),
        viewerCount: z.number().int().nonnegative().default(1243),
      })
      .default({
        intensity: 0.75,
        liveBadge: true,
        viewerCount: 1243,
      }),
    chromeCues: z.array(StreamChromeCueSchema).default([]),
    musicPolicy: z
      .object({
        ducking: z.number().min(0).max(1).default(0.22),
        allowOverlap: z.boolean().default(false),
      })
      .default({
        ducking: 0.22,
        allowOverlap: false,
      }),
    turnPolicy: ReactionTurnPolicySchema.default({
      minimumGapFrames: 2,
      preferHigherPriorityInterrupts: true,
    }),
    promptVersionRefs: z.array(z.string()).default([]),
    reviewState: ReactionReviewStateSchema.default("draft"),
    providerPins: z
      .object({
        plannerModel: z.string().optional(),
        ttsModel: z.string().optional(),
      })
      .default({}),
    version: z.string().min(1),
    generatedAt: z.string().datetime().optional(),
    contentHash: z.string().min(1),
  })
  .superRefine((plan, ctx) => {
    const castIds = new Set<string>();

    for (const [index, member] of plan.cast.entries()) {
      if (castIds.has(member.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate cast id "${member.id}"`,
          path: ["cast", index, "id"],
        });
      }
      castIds.add(member.id);
    }

    for (const [index, segment] of plan.segments.entries()) {
      if (!castIds.has(segment.speakerId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown speakerId "${segment.speakerId}"`,
          path: ["segments", index, "speakerId"],
        });
      }
    }
  });

export type ReactionPlan = z.infer<typeof ReactionPlanSchema>;

export type CreateReactionPlanInput = Omit<
  ReactionPlan,
  | "contentHash"
  | "generatedAt"
  | "formatPreset"
  | "reviewState"
  | "characterPresets"
  | "assetRegistry"
  | "captions"
  | "chrome"
  | "chromeCues"
  | "musicPolicy"
  | "turnPolicy"
  | "promptVersionRefs"
  | "providerPins"
> &
  Partial<
    Pick<
      ReactionPlan,
      | "formatPreset"
      | "reviewState"
      | "characterPresets"
      | "assetRegistry"
      | "captions"
      | "chrome"
      | "chromeCues"
      | "musicPolicy"
      | "turnPolicy"
      | "promptVersionRefs"
      | "providerPins"
      | "generatedAt"
    >
  >;

export const NormalizedReactionTranscriptEntrySchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  startFrame: z.number().int().nonnegative().optional(),
  endFrame: z.number().int().positive().optional(),
  emphasis: z.number().min(0).max(1).default(0.5),
});

export type NormalizedReactionTranscriptEntry = z.infer<
  typeof NormalizedReactionTranscriptEntrySchema
>;

export const NormalizedReactionBeatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  frameHint: z.number().int().nonnegative().optional(),
  priority: z.number().int().default(50),
});

export type NormalizedReactionBeat = z.infer<
  typeof NormalizedReactionBeatSchema
>;

export const NormalizedReactionSourceSchema = z.object({
  id: z.string().min(1),
  sourceRef: SourceRefSchema,
  title: z.string().min(1),
  synopsis: z.string().default(""),
  transcript: z.array(NormalizedReactionTranscriptEntrySchema).default([]),
  beatHints: z.array(NormalizedReactionBeatSchema).default([]),
  assetRefs: z.array(z.string()).default([]),
});

export type NormalizedReactionSource = z.infer<
  typeof NormalizedReactionSourceSchema
>;

export const ReactionDirectorModeSchema = z.enum(["assist", "auto"]);

export type ReactionDirectorMode = z.infer<typeof ReactionDirectorModeSchema>;

export const ReactionPromptTemplateKeySchema = z.enum([
  "setup",
  "interruption-points",
  "escalation",
  "punchline",
  "exit-hook",
]);

export type ReactionPromptTemplateKey = z.infer<
  typeof ReactionPromptTemplateKeySchema
>;

export const ReactionPromptTemplateSchema = z.object({
  key: ReactionPromptTemplateKeySchema,
  versionRef: z.string().min(1),
  systemPrompt: z.string().min(1),
  userPrompt: z.string().min(1),
});

export type ReactionPromptTemplate = z.infer<
  typeof ReactionPromptTemplateSchema
>;

export const ReactionDirectorRequestSchema = z.object({
  id: z.string().min(1),
  mode: ReactionDirectorModeSchema,
  source: NormalizedReactionSourceSchema,
  cast: z.array(ReactorCastMemberSchema).min(1),
  formatPreset: ReactionFormatPresetSchema.default("stream-chaos-vertical"),
  targetDurationFrames: z.number().int().positive().default(120),
  version: z.string().min(1).default("1"),
  promptVersionRefs: z.array(z.string()).optional(),
  providerPins: z
    .object({
      plannerModel: z.string().optional(),
      ttsModel: z.string().optional(),
    })
    .optional(),
});

export type ReactionDirectorRequest = z.infer<
  typeof ReactionDirectorRequestSchema
>;

export const ReactionAuditEventSchema = z.object({
  id: z.string().min(1),
  at: z.string().datetime(),
  kind: z.enum([
    "plan-generated",
    "review-state-transitioned",
    "tts-cache-hit",
    "tts-generated",
  ]),
  planId: z.string().min(1),
  artifactId: z.string().optional(),
  metadata: z.record(z.string(), z.string()).default({}),
});

export type ReactionAuditEvent = z.infer<typeof ReactionAuditEventSchema>;

const REACTION_REVIEW_STATE_ORDER: ReactionReviewState[] = [
  "draft",
  "locked-script",
  "locked-audio",
  "approved-render",
];

const DEFAULT_REACTION_PROMPT_LIBRARY: Record<
  ReactionPromptTemplateKey,
  { versionRef: string; systemPrompt: string }
> = {
  setup: {
    versionRef: "reaction.setup@v1",
    systemPrompt:
      "Identify the central tension fast and frame the first reactor interruption for a chaotic social short.",
  },
  "interruption-points": {
    versionRef: "reaction.interruption-points@v1",
    systemPrompt:
      "Find the 1-3 best interruption windows where a reactor can add energy without covering critical source information.",
  },
  escalation: {
    versionRef: "reaction.escalation@v1",
    systemPrompt:
      "Escalate the reactor banter in short bursts while preserving clear speaker turns and retention-focused pacing.",
  },
  punchline: {
    versionRef: "reaction.punchline@v1",
    systemPrompt:
      "Land the strongest punchline in the back half of the clip with a clean emotion and interruption tag.",
  },
  "exit-hook": {
    versionRef: "reaction.exit-hook@v1",
    systemPrompt:
      "End on a hook that pushes comments, rewatches, or clip shares without bloating the runtime.",
  },
};

const DEFAULT_REACTION_PROMPT_ORDER = Object.keys(
  DEFAULT_REACTION_PROMPT_LIBRARY,
) as ReactionPromptTemplateKey[];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}

function computeContentHash(input: Omit<ReactionPlan, "contentHash">): string {
  const { generatedAt: _generatedAt, ...stableInput } = input;
  const serialized = stableSerialize(stableInput);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function finalizeReactionPlan(
  input: Omit<ReactionPlan, "contentHash">,
): ReactionPlan {
  return ReactionPlanSchema.parse({
    ...input,
    contentHash: computeContentHash(input),
  });
}

export function createTokovoEpisodeSourceRef(episodeId: string): SourceRef {
  return {
    kind: "tokovo_episode",
    episodeId,
  };
}

export function createNormalizedReactionSource(
  input: z.input<typeof NormalizedReactionSourceSchema>,
): NormalizedReactionSource {
  return NormalizedReactionSourceSchema.parse(input);
}

export function createCharacterPreset(
  input: z.input<typeof CharacterPresetSchema>,
): CharacterPreset {
  return CharacterPresetSchema.parse(input);
}

export function applyCharacterPresetToCastMember(input: {
  id: string;
  role: ReactorCastMember["role"];
  preset: CharacterPreset;
}): ReactorCastMember {
  return ReactorCastMemberSchema.parse({
    id: input.id,
    role: input.role,
    presetId: input.preset.id,
    visualProfile: input.preset.visualProfile,
    voiceProfile: input.preset.voiceProfile,
    personaPromptRef: input.preset.personaPromptRef,
  });
}

export function arbitrateReactionSegments(
  segments: ReactionSegment[],
  policy: Partial<ReactionTurnPolicy> = {},
): ReactionSegment[] {
  const resolvedPolicy = ReactionTurnPolicySchema.parse(policy);
  const minimumGapFrames = resolvedPolicy.minimumGapFrames;
  const ordered = [...segments]
    .map((segment) => ({ ...segment }))
    .sort((left, right) => {
      if (left.startFrame !== right.startFrame) {
        return left.startFrame - right.startFrame;
      }
      return right.priority - left.priority;
    });

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1]!;
    const current = ordered[index]!;
    const requiredStart = previous.endFrame + minimumGapFrames;

    if (current.startFrame >= requiredStart) {
      continue;
    }

    const shouldInterrupt =
      resolvedPolicy.preferHigherPriorityInterrupts &&
      current.priority >= previous.priority &&
      current.interruptType !== "none";

    if (shouldInterrupt) {
      previous.endFrame = Math.max(
        previous.startFrame + 12,
        current.startFrame - minimumGapFrames,
      );
    }

    if (current.startFrame < previous.endFrame + minimumGapFrames) {
      current.startFrame = previous.endFrame + minimumGapFrames;
      current.endFrame = Math.max(current.startFrame + 12, current.endFrame);
    }
  }

  return ordered;
}

export function buildReactionDirectorPrompts(
  input: z.input<typeof ReactionDirectorRequestSchema>,
): ReactionPromptTemplate[] {
  const request = ReactionDirectorRequestSchema.parse(input);
  const castSummary = request.cast
    .map((member) => `${member.visualProfile.displayName}(${member.role})`)
    .join(", ");
  const transcriptPreview = request.source.transcript
    .slice(0, 5)
    .map((entry) => `- ${entry.text}`)
    .join("\n");

  const versionRefs =
    request.promptVersionRefs && request.promptVersionRefs.length > 0
      ? request.promptVersionRefs
      : DEFAULT_REACTION_PROMPT_ORDER.map(
          (key) => DEFAULT_REACTION_PROMPT_LIBRARY[key].versionRef,
        );

  if (versionRefs.length !== DEFAULT_REACTION_PROMPT_ORDER.length) {
    throw new Error(
      `Expected ${DEFAULT_REACTION_PROMPT_ORDER.length} prompt version refs, received ${versionRefs.length}`,
    );
  }

  return DEFAULT_REACTION_PROMPT_ORDER.map((key, index) =>
    ReactionPromptTemplateSchema.parse({
      key,
      versionRef: versionRefs[index]!,
      systemPrompt: DEFAULT_REACTION_PROMPT_LIBRARY[key].systemPrompt,
      userPrompt: [
        `Mode: ${request.mode}`,
        `Format: ${request.formatPreset}`,
        `Source: ${request.source.title}`,
        `Synopsis: ${request.source.synopsis || "n/a"}`,
        `Cast: ${castSummary}`,
        `Transcript preview:\n${transcriptPreview || "- n/a"}`,
      ].join("\n"),
    }),
  );
}

function inferEmotionFromText(text: string): ReactionEmotion {
  const lower = text.toLowerCase();
  if (/[!?]{2,}/.test(text) || /(no way|wtf|bro|crazy|insane)/.test(lower)) {
    return "shocked";
  }
  if (/(haha|lol|lmao|rofl)/.test(lower)) {
    return "laughing";
  }
  if (/(why|how|wait)/.test(lower)) {
    return "thinking";
  }
  if (/(hate|stupid|idiot|angry|mad)/.test(lower)) {
    return "angry";
  }
  return "deadpan";
}

function clampSegmentEnd(
  startFrame: number,
  requestedEndFrame: number | undefined,
  fallbackLength: number,
): number {
  return Math.max(startFrame + 12, requestedEndFrame ?? startFrame + fallbackLength);
}

export function draftReactionPlanFromSource(
  input: z.input<typeof ReactionDirectorRequestSchema>,
): ReactionPlan {
  const request = ReactionDirectorRequestSchema.parse(input);
  const prompts = buildReactionDirectorPrompts(request);
  const transcript = request.source.transcript.length
    ? request.source.transcript
    : [
        {
          id: `${request.source.id}-fallback`,
          text: request.source.synopsis || request.source.title,
          emphasis: 0.5,
        },
      ];
  const segmentWindow = Math.max(
    24,
    Math.floor(request.targetDurationFrames / Math.max(transcript.length + 1, 2)),
  );

  const segments = transcript.slice(0, 3).map((entry, index) => {
    const speaker = request.cast[index % request.cast.length]!;
    const startFrame =
      entry.startFrame ?? 12 + index * Math.max(18, Math.floor(segmentWindow * 0.8));
    const endFrame = clampSegmentEnd(entry.startFrame ?? startFrame, entry.endFrame, segmentWindow);

    return {
      id: `seg_${index}`,
      speakerId: speaker.id,
      startFrame,
      endFrame,
      text: entry.text,
      emotion: inferEmotionFromText(entry.text),
      interruptType:
        index === 0 ? "hard-cut" : index % 2 === 0 ? "punch-in" : "soft-cut",
      captionMode: "always-on" as const,
      priority: 100 - index * 10,
    } satisfies ReactionSegment;
  });

  return createReactionPlan({
    id: request.id,
    sourceRef: request.source.sourceRef,
    formatPreset: request.formatPreset,
    cast: request.cast,
    segments: arbitrateReactionSegments(segments),
    version: request.version,
    promptVersionRefs:
      request.promptVersionRefs && request.promptVersionRefs.length > 0
        ? request.promptVersionRefs
        : prompts.map((prompt) => prompt.versionRef),
    providerPins: request.providerPins ?? {},
  });
}

export function transitionReactionPlanState(
  plan: ReactionPlan,
  nextState: ReactionReviewState,
): ReactionPlan {
  const currentIndex = REACTION_REVIEW_STATE_ORDER.indexOf(plan.reviewState);
  const nextIndex = REACTION_REVIEW_STATE_ORDER.indexOf(nextState);

  if (nextIndex !== currentIndex + 1) {
    throw new Error(
      `Invalid reaction review state transition: ${plan.reviewState} -> ${nextState}`,
    );
  }

  return finalizeReactionPlan({
    ...plan,
    reviewState: nextState,
  });
}

export function updateReactionPlan(
  plan: ReactionPlan,
  patch: Partial<Omit<ReactionPlan, "id" | "sourceRef" | "contentHash">>,
): ReactionPlan {
  const { contentHash: _contentHash, ...current } = plan;
  return finalizeReactionPlan({
    ...current,
    ...patch,
  });
}

export function isReactionPlanApprovedForRender(plan: ReactionPlan): boolean {
  return plan.reviewState === "approved-render";
}

export function assertReactionPlanApprovedForRender(
  plan: ReactionPlan,
): ReactionPlan {
  if (!isReactionPlanApprovedForRender(plan)) {
    throw new Error(
      `Reaction plan "${plan.id}" must be in approved-render state before render. Current state: ${plan.reviewState}`,
    );
  }

  return plan;
}

export function createReactionAuditEvent(input: {
  kind: ReactionAuditEvent["kind"];
  planId: string;
  artifactId?: string;
  metadata?: Record<string, string>;
}): ReactionAuditEvent {
  return ReactionAuditEventSchema.parse({
    id: `${input.kind}:${input.planId}:${Date.now()}`,
    at: new Date().toISOString(),
    kind: input.kind,
    planId: input.planId,
    artifactId: input.artifactId,
    metadata: input.metadata ?? {},
  });
}

export function createImportedPostSourceRef(input: {
  sourceUrl: string;
  platform: string;
  creatorHandle?: string;
  notes?: string;
  rights?: RightsInfo;
}): Extract<SourceRef, { kind: "imported_post" }> {
  return {
    kind: "imported_post",
    provenance: {
      sourceUrl: input.sourceUrl,
      platform: input.platform,
      creatorHandle: input.creatorHandle,
      importedAt: new Date().toISOString(),
      notes: input.notes,
    },
    rights: input.rights ?? { status: "internal-review" },
  };
}

export function createReactionPlan(
  input: CreateReactionPlanInput,
): ReactionPlan {
  const base = {
    ...input,
    formatPreset: input.formatPreset ?? "stream-chaos-vertical",
    characterPresets: input.characterPresets ?? [],
    assetRegistry: input.assetRegistry ?? [],
    captions: {
      defaultMode: input.captions?.defaultMode ?? "always-on",
      highlightWords: input.captions?.highlightWords ?? true,
    },
    chrome: {
      intensity: input.chrome?.intensity ?? 0.75,
      liveBadge: input.chrome?.liveBadge ?? true,
      viewerCount: input.chrome?.viewerCount ?? 1243,
    },
    chromeCues: input.chromeCues ?? [],
    musicPolicy: {
      ducking: input.musicPolicy?.ducking ?? 0.22,
      allowOverlap: input.musicPolicy?.allowOverlap ?? false,
    },
    turnPolicy: {
      minimumGapFrames: input.turnPolicy?.minimumGapFrames ?? 2,
      preferHigherPriorityInterrupts:
        input.turnPolicy?.preferHigherPriorityInterrupts ?? true,
    },
    reviewState: input.reviewState ?? "draft",
    promptVersionRefs: input.promptVersionRefs ?? [],
    providerPins: input.providerPins ?? {},
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  } satisfies Omit<ReactionPlan, "contentHash">;

  return finalizeReactionPlan(base);
}

export function createFixtureReactionPlan(
  overrides: Partial<CreateReactionPlanInput> = {},
): ReactionPlan {
  return createReactionPlan({
    id: overrides.id ?? "fixture-reaction-plan",
    sourceRef:
      overrides.sourceRef ?? createTokovoEpisodeSourceRef("fixture-episode"),
    cast: overrides.cast ?? [
      {
        id: "hero",
        role: "hero",
        visualProfile: {
          displayName: "Hero",
          accentColor: "#f97316",
        },
        voiceProfile: {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "hero-voice",
        },
        personaPromptRef: "hero-v1",
      },
      {
        id: "guest",
        role: "guest",
        visualProfile: {
          displayName: "Guest",
          accentColor: "#38bdf8",
        },
        voiceProfile: {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "guest-voice",
        },
        personaPromptRef: "guest-v1",
      },
    ],
    segments: overrides.segments ?? [
      {
        id: "seg_0",
        speakerId: "hero",
        startFrame: 18,
        endFrame: 54,
        text: "Bro this escalated instantly.",
        emotion: "shocked",
        interruptType: "hard-cut",
        captionMode: "always-on",
        priority: 100,
      },
      {
        id: "seg_1",
        speakerId: "guest",
        startFrame: 58,
        endFrame: 88,
        text: "The replies are even worse.",
        emotion: "deadpan",
        interruptType: "punch-in",
        captionMode: "always-on",
        priority: 90,
      },
    ],
    version: overrides.version ?? "1",
    formatPreset: overrides.formatPreset,
    reviewState: overrides.reviewState,
    captions: overrides.captions,
    chrome: overrides.chrome,
    chromeCues: overrides.chromeCues,
    musicPolicy: overrides.musicPolicy,
    promptVersionRefs: overrides.promptVersionRefs,
    providerPins: overrides.providerPins,
    generatedAt: overrides.generatedAt,
  });
}
