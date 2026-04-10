import { z } from "zod";

export const publishingPlatformSchema = z.enum([
  "x",
  "linkedin",
  "instagram",
  "youtube",
]);

export type PublishingPlatform = z.infer<typeof publishingPlatformSchema>;

export const publishStatusSchema = z.enum([
  "draft",
  "ready",
  "scheduled",
  "published",
  "failed",
]);

export type PublishStatus = z.infer<typeof publishStatusSchema>;

export const channelStatusSchema = z.enum([
  "connected",
  "disconnected",
  "unknown",
]);

export type ChannelStatus = z.infer<typeof channelStatusSchema>;

export const renderArtifactManifestSchema = z.object({
  id: z.string(),
  episodeId: z.string(),
  sourceHash: z.string(),
  videoPath: z.string(),
  thumbnailPath: z.string().optional(),
  durationMs: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export type RenderArtifactManifest = z.infer<
  typeof renderArtifactManifestSchema
>;

export const renderArtifactSchema = renderArtifactManifestSchema.extend({
  syncedAt: z.string(),
});

export type RenderArtifact = z.infer<typeof renderArtifactSchema>;

export const publishingChannelSchema = z.object({
  id: z.string(),
  platform: publishingPlatformSchema,
  postizIntegrationId: z.string(),
  displayName: z.string(),
  status: channelStatusSchema,
  metadataJson: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PublishingChannel = z.infer<typeof publishingChannelSchema>;

export const publishVariantSchema = z.object({
  id: z.string(),
  artifactId: z.string(),
  platform: publishingPlatformSchema,
  caption: z.string(),
  title: z.string().nullable().optional(),
  settingsJson: z.string(),
  status: publishStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PublishVariant = z.infer<typeof publishVariantSchema>;

export const postizUploadSchema = z.object({
  id: z.string(),
  url: z.string(),
  mimeType: z.string().optional(),
});

export type PostizUpload = z.infer<typeof postizUploadSchema>;

export const postizPostReferenceSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  rawJson: z.string().optional(),
});

export type PostizPostReference = z.infer<typeof postizPostReferenceSchema>;

export const scheduledPostSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  channelId: z.string(),
  scheduledAt: z.string(),
  timezone: z.string(),
  status: publishStatusSchema,
  postizPostId: z.string().nullable().optional(),
  postizResponseJson: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ScheduledPost = z.infer<typeof scheduledPostSchema>;

export interface SchedulePostInput {
  channel: PublishingChannel;
  variant: PublishVariant;
  scheduledAt: string;
  timezone: string;
  media: PostizUpload[];
}

export interface SocialPublisher {
  listChannels(): Promise<PublishingChannel[]>;
  uploadMedia(input: { filePath: string }): Promise<PostizUpload>;
  schedulePost(input: SchedulePostInput): Promise<PostizPostReference>;
}

export function normalizePublishStatus(value?: string | null): PublishStatus {
  switch (value) {
    case "published":
      return "published";
    case "scheduled":
    case "queue":
    case "queued":
      return "scheduled";
    case "failed":
    case "error":
      return "failed";
    case "ready":
      return "ready";
    case "draft":
    default:
      return "draft";
  }
}

export function normalizePlatform(value: string): PublishingPlatform | null {
  const normalized = value.toLowerCase();
  if (normalized.includes("twitter") || normalized === "x") return "x";
  if (normalized.includes("linkedin")) return "linkedin";
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("youtube")) return "youtube";
  return null;
}
