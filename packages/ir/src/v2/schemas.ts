import { z } from "zod";

export const OSConfigSchema = z.object({
  locale: z.string().min(1).optional(),
  appearance: z.enum(["light", "dark"]).optional(),
  hourCycle: z.enum(["h12", "h24"]).optional(),
  lockScreenWallpaper: z.string().min(1).optional(),
  time: z.union([z.date(), z.number()]).optional(),
  battery: z.number().min(0).max(100).optional(),
  charging: z.boolean().optional(),
  network: z.enum(["wifi", "5G", "4G", "3G", "none"]).optional(),
  strength: z.number().min(0).max(4).optional(),
  dnd: z.boolean().optional(),
});

export const DeviceConfigSchema = z.object({
  id: z.string(),
  profile: z.string(),
  app: z.string(),
  os: OSConfigSchema.optional(),
  theme: z.string().optional(),
  appearance: z.enum(["light", "dark"]).optional(),
  locked: z.boolean().optional(),
  installedApps: z.array(z.string()).optional(),
  homeScreen: z
    .object({
      preset: z.enum(["ios-default", "android-default"]).optional(),
      dock: z.array(z.string()).optional(),
      pages: z.array(z.array(z.string())).optional(),
      wallpaper: z.string().optional(),
    })
    .optional(),
  screenRecording: z.boolean().optional(),
});

export const AppSnapshotEntrySchema = z.object({
  appId: z.string(),
  deviceId: z.string(),
  snapshotVersion: z.number().int().positive(),
  snapshot: z.unknown(),
});

export const AppInitialViewEntrySchema = z.object({
  appId: z.string(),
  deviceId: z.string(),
  viewVersion: z.number().int().positive(),
  view: z.unknown(),
});

export const MarkerSchema = z.object({
  id: z.string(),
  frame: z.number().int().nonnegative(),
});

export const SectionSchema = z.object({
  id: z.string(),
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().nonnegative(),
});

export const DirectorStyleSchema = z.enum([
  "ViralDramaV1",
  "Cinematic",
  "Documentary",
]);

export const VoiceSegmentScheduleSchema = z.object({
  segmentId: z.string(),
  at: z.number().nonnegative(),
  volume: z.number().min(0).max(1).optional(),
  speed: z.number().positive().optional(),
});

export const VoiceConfigSchema = z.object({
  manifestPath: z.string(),
  audioPath: z.string(),
  usePerSegmentControl: z.boolean().optional(),
  segmentSchedule: z.array(VoiceSegmentScheduleSchema).optional(),
});

export const HandRigAssetsSchema = z.object({
  underlaySrc: z.string().min(1),
  leftThumbSrc: z.string().min(1),
  rightThumbSrc: z.string().min(1),
});

export const HandPerformanceCueSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("hold"),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    motion: z.enum(["steady", "walking", "nervous"]),
    intensity: z.number().min(0).max(1).optional(),
  }),
  z.object({
    kind: z.literal("type"),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    mode: z.enum(["oneThumb", "twoThumbs"]),
    intensity: z.number().min(0).max(1).optional(),
  }),
  z.object({
    kind: z.literal("tap"),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    target: z.string().min(1),
    hand: z.enum(["left", "right"]).optional(),
    intensity: z.number().min(0).max(1).optional(),
  }),
  z.object({
    kind: z.literal("swipe"),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
    direction: z.enum(["up", "down", "left", "right"]),
    hand: z.enum(["left", "right"]).optional(),
    intensity: z.number().min(0).max(1).optional(),
  }),
]);

export const HandPerformanceSchema = z.object({
  deviceId: z.string().min(1),
  rigId: z.string().min(1),
  assets: HandRigAssetsSchema,
  defaultMotion: z.enum(["steady", "walking", "nervous"]).optional(),
  defaultTypingMode: z.enum(["oneThumb", "twoThumbs"]).optional(),
  motionIntensity: z.number().min(0).max(1).optional(),
  stage: z
    .object({
      deviceScale: z.number().positive().optional(),
      offsetX: z.number().optional(),
      offsetY: z.number().optional(),
      gripWidthRatio: z.number().positive().optional(),
      gripTopRatio: z.number().optional(),
      thumbWidthRatio: z.number().positive().optional(),
    })
    .optional(),
  cues: z.array(HandPerformanceCueSchema),
});

export const TrackEventBaseSchema = z.object({
  at: z.number().int().nonnegative(),
  duration: z.number().int().nonnegative().optional(),
  deviceId: z.string().optional(),
  _declarationOrder: z.number().int().optional(),
});

export const TrackEventSchema = TrackEventBaseSchema.extend({
  kind: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

const InputSelectionSchema = z.object({
  anchor: z.number().int().nonnegative(),
  focus: z.number().int().nonnegative(),
});

const InputCadenceSchema = z.object({
  style: z.enum(["slow", "natural", "fast"]).optional(),
  framesPerGrapheme: z.number().positive().optional(),
  varianceFrames: z.number().nonnegative().optional(),
  punctuationPauseFrames: z.number().int().nonnegative().optional(),
  focusLeadFrames: z.number().int().nonnegative().optional(),
  keyPressDurationFrames: z.number().int().positive().optional(),
});

const InputSourceSchema = z.enum([
  "softwareKeyboard",
  "hardwareKeyboard",
  "paste",
  "voice",
]);

const InputLayoutSchema = z.enum(["letters", "numbers", "symbols", "emoji"]);

const InputScriptStepSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("type"),
    text: z.string(),
    source: z.enum(["softwareKeyboard", "hardwareKeyboard"]).optional(),
    cadence: InputCadenceSchema.optional(),
  }),
  z.object({
    type: z.literal("pause"),
    frames: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal("deleteBackward"),
    count: z.number().int().nonnegative().optional(),
    intervalFrames: z.number().int().positive().optional(),
  }),
  z.object({ type: z.literal("setSelection"), selection: InputSelectionSchema }),
  z.object({
    type: z.literal("moveCursor"),
    position: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal("replaceRange"),
    range: InputSelectionSchema,
    text: z.string(),
    source: InputSourceSchema.optional(),
  }),
  z.object({
    type: z.literal("compose"),
    updates: z.array(z.string()),
    commit: z.string(),
    intervalFrames: z.number().int().positive().optional(),
    keys: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal("setSuggestions"),
    suggestions: z.array(z.string()),
  }),
  z.object({
    type: z.literal("chooseSuggestion"),
    index: z.number().int().nonnegative(),
    text: z.string(),
    replaceRange: InputSelectionSchema.optional(),
  }),
  z.object({ type: z.literal("switchLayout"), layout: InputLayoutSchema }),
  z.object({ type: z.literal("paste"), text: z.string() }),
  z.object({ type: z.literal("voice"), text: z.string() }),
]);

export const InputSessionSchema = z
  .object({
    id: z.string().min(1).optional(),
    deviceId: z.string().min(1),
    appInstanceId: z.string().min(1),
    fieldId: z.string().min(1),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().nonnegative().optional(),
    submitAtFrame: z.number().int().nonnegative().optional(),
    clearOnSubmit: z.boolean().optional(),
    initialValue: z.string().optional(),
    text: z.string().optional(),
    script: z.array(InputScriptStepSchema).optional(),
    expectedFinalValue: z.string().optional(),
    seed: z.union([z.string(), z.number()]).optional(),
    source: InputSourceSchema.optional(),
    locale: z.string().min(1).optional(),
    direction: z.enum(["ltr", "rtl", "auto"]).optional(),
    keyboard: z
      .object({
        platform: z.enum(["ios", "android"]).optional(),
        locale: z.string().min(1).optional(),
        layout: InputLayoutSchema.optional(),
        returnKey: z
          .enum(["return", "send", "search", "done", "go", "next"])
          .optional(),
        appearance: z.enum(["light", "dark"]).optional(),
        themeId: z.literal("system").optional(),
        autocapitalization: z
          .enum(["none", "sentences", "words", "characters"])
          .optional(),
        autocorrection: z.boolean().optional(),
      })
      .optional(),
    cadence: InputCadenceSchema.optional(),
  })
  .refine((session) => !(session.text !== undefined && session.script !== undefined), {
    message: "Input session must provide either text or script, not both",
    path: ["script"],
  });

const NotificationActionTargetSchema = z.object({
  navigation: z
    .object({
      appId: z.string().min(1).optional(),
      route: z.string().min(1).optional(),
      params: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  appEvent: z
    .object({
      appId: z.string().min(1).optional(),
      type: z.string().min(1),
      payload: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
}).refine((target) => target.navigation !== undefined || target.appEvent !== undefined, {
  message: "Notification action target must declare navigation and/or appEvent",
});

const NotificationActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  role: z.enum(["default", "destructive"]).optional(),
  target: NotificationActionTargetSchema,
});

export const NotificationIntentSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  appId: z.string().min(1),
  appInstanceId: z.string().min(1).optional(),
  deliverAtFrame: z.number().int().nonnegative(),
  sequence: z.number().int().nonnegative().optional(),
  content: z.object({
    title: z.string(),
    body: z.string(),
    subtitle: z.string().optional(),
    media: z
      .object({
        kind: z.enum(["image", "video"]),
        src: z.string().min(1),
        alt: z.string().optional(),
        aspectRatio: z.number().positive().optional(),
      })
      .optional(),
  }),
  category: z.enum(["message", "social", "work", "system", "reminder"]).optional(),
  threadId: z.string().min(1).optional(),
  groupId: z.string().min(1).optional(),
  interruption: z.enum(["passive", "active", "timeSensitive", "critical"]).optional(),
  privacy: z.enum(["public", "private", "sensitive"]).optional(),
  previewPolicy: z.enum(["always", "whenUnlocked", "never"]).optional(),
  deliveryCondition: z
    .enum(["always", "onlyWhenLocked", "onlyWhenUnlocked", "onlyWhenAppClosed"])
    .optional(),
  foregroundBehavior: z.enum(["suppress", "present"]).optional(),
  sound: z
    .union([
      z.enum(["default", "silent"]),
      z.object({
        soundId: z.string().min(1),
        volume: z.number().min(0).max(1).optional(),
      }),
    ])
    .optional(),
  bannerDurationFrames: z.number().int().positive().optional(),
  retentionUntilFrame: z.number().int().nonnegative().optional(),
  actions: z.array(NotificationActionSchema).optional(),
  reply: z
    .object({
      actionId: z.string().min(1),
      placeholder: z.string().optional(),
      textPayloadKey: z.string().min(1).optional(),
      target: NotificationActionTargetSchema,
    })
    .optional(),
  defaultAction: NotificationActionTargetSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const NotificationInteractionSchema = z
  .object({
    id: z.string().min(1).optional(),
    deviceId: z.string().min(1),
    atFrame: z.number().int().nonnegative(),
    type: z.enum([
      "tap",
      "chooseAction",
      "reply",
      "dismiss",
      "clearAll",
      "openCenter",
      "closeCenter",
    ]),
    notificationId: z.string().min(1).optional(),
    actionId: z.string().min(1).optional(),
    replyText: z.string().optional(),
    sequence: z.number().int().nonnegative().optional(),
  })
  .superRefine((interaction, ctx) => {
    const targetsOne = ["tap", "chooseAction", "reply", "dismiss"].includes(
      interaction.type,
    );
    if (targetsOne && !interaction.notificationId) {
      ctx.addIssue({
        code: "custom",
        path: ["notificationId"],
        message: `${interaction.type} requires notificationId`,
      });
    }
    if (interaction.type === "chooseAction" && !interaction.actionId) {
      ctx.addIssue({
        code: "custom",
        path: ["actionId"],
        message: "chooseAction requires actionId",
      });
    }
    if (interaction.type === "reply" && interaction.replyText === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["replyText"],
        message: "reply requires replyText",
      });
    }
  });

export const TrackEpisodeIRSchema = z.object({
  id: z.string().min(1),
  fps: z.number().int().positive(),
  durationInFrames: z.number().int().positive(),
  title: z.string().optional(),
  description: z.string().optional(),
  devices: z.array(DeviceConfigSchema).min(1),
  appSnapshots: z.array(AppSnapshotEntrySchema).default([]),
  initialViews: z.array(AppInitialViewEntrySchema).default([]),
  events: z.array(TrackEventSchema),
  inputSessions: z.array(InputSessionSchema).optional(),
  notificationIntents: z.array(NotificationIntentSchema).optional(),
  notificationInteractions: z.array(NotificationInteractionSchema).optional(),
  markers: z.array(MarkerSchema),
  sections: z.array(SectionSchema),
  director: DirectorStyleSchema.optional(),
  voice: VoiceConfigSchema.optional(),
  handPerformances: z.array(HandPerformanceSchema).optional(),
});

export type ValidatedTrackEpisodeIR = z.infer<typeof TrackEpisodeIRSchema>;

export function validateTrackEpisodeIR(ir: unknown): ValidatedTrackEpisodeIR {
  return TrackEpisodeIRSchema.parse(ir);
}

export function safeValidateTrackEpisodeIR(ir: unknown):
  | {
      success: true;
      data: ValidatedTrackEpisodeIR;
    }
  | {
      success: false;
      error: z.ZodError;
    } {
  const result = TrackEpisodeIRSchema.safeParse(ir);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
