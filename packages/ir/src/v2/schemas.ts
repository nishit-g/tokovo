import { z } from "zod";

export const ConversationConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  type: z.enum(["dm", "group"]).optional(),
  participants: z.array(z.string()).optional(),
  unreadCount: z.number().optional(),
  isMuted: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  hasStatus: z.boolean().optional(),
});

export const OSConfigSchema = z.object({
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
  conversations: z.array(ConversationConfigSchema).optional(),
  os: OSConfigSchema.optional(),
  theme: z.string().optional(),
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

export const TrackEpisodeIRSchema = z.object({
  id: z.string().min(1),
  fps: z.number().int().positive(),
  durationInFrames: z.number().int().positive(),
  title: z.string().optional(),
  description: z.string().optional(),
  devices: z.array(DeviceConfigSchema).min(1),
  events: z.array(TrackEventSchema),
  markers: z.array(MarkerSchema),
  sections: z.array(SectionSchema),
  director: DirectorStyleSchema.optional(),
  voice: VoiceConfigSchema.optional(),
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
