import fs from "node:fs";
import path from "node:path";

import {
  normalizePlatform,
  publishingChannelSchema,
  type PostizPostReference,
  type PostizUpload,
  type PublishingChannel,
  type SchedulePostInput,
  type SocialPublisher,
} from "../index.js";
import { getPostizApiKey, getPostizBaseUrl } from "./config.js";

interface PostizIntegrationRecord {
  id?: string;
  name?: string;
  identifier?: string;
  provider?: string;
  displayName?: string;
  accountName?: string;
  profileName?: string;
  status?: string;
  connected?: boolean;
  [key: string]: unknown;
}

function buildHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getPostizApiKey()}`,
  };
}

function buildPublicUrl(pathname: string): string {
  return `${getPostizBaseUrl()}/public/v1${pathname}`;
}

function stringifySettings(input: SchedulePostInput): Record<string, unknown> {
  const parsed = JSON.parse(input.variant.settingsJson) as Record<string, unknown>;
  switch (input.variant.platform) {
    case "youtube":
      return {
        __type: "youtube",
        title: input.variant.title ?? input.variant.caption.slice(0, 100),
        privacyStatus: "private",
        ...parsed,
      };
    case "instagram":
      return {
        __type: "instagram",
        postType: "reel",
        ...parsed,
      };
    case "linkedin":
      return {
        __type: "linkedin",
        ...parsed,
      };
    case "x":
    default:
      return {
        __type: "x",
        ...parsed,
      };
  }
}

function normalizeIntegration(record: PostizIntegrationRecord): PublishingChannel | null {
  const platform = normalizePlatform(
    String(record.provider ?? record.identifier ?? record.name ?? ""),
  );
  if (!platform) {
    return null;
  }

  const now = new Date().toISOString();
  return publishingChannelSchema.parse({
    id: `channel_${String(record.id ?? record.identifier ?? record.name ?? platform)}`,
    platform,
    postizIntegrationId: String(record.id ?? record.identifier ?? record.name ?? platform),
    displayName:
      String(
        record.displayName ??
          record.accountName ??
          record.profileName ??
          record.name ??
          `${platform} account`,
      ) || `${platform} account`,
    status:
      record.connected === false || record.status === "disconnected"
        ? "disconnected"
        : "connected",
    metadataJson: JSON.stringify(record),
    createdAt: now,
    updatedAt: now,
  });
}

export class PostizPublisher implements SocialPublisher {
  async listChannels(): Promise<PublishingChannel[]> {
    const response = await fetch(buildPublicUrl("/integrations"), {
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Postiz integrations request failed: ${response.status}`);
    }

    const body = (await response.json()) as
      | PostizIntegrationRecord[]
      | {
          items?: PostizIntegrationRecord[];
          integrations?: PostizIntegrationRecord[];
          data?: PostizIntegrationRecord[];
        };

    const records = Array.isArray(body)
      ? body
      : body.items ?? body.integrations ?? body.data ?? [];

    return records
      .map(normalizeIntegration)
      .filter((value): value is PublishingChannel => value !== null);
  }

  async uploadMedia(input: { filePath: string }): Promise<PostizUpload> {
    const fileBuffer = await fs.promises.readFile(input.filePath);
    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]), path.basename(input.filePath));

    const response = await fetch(buildPublicUrl("/uploads/upload-file"), {
      method: "POST",
      headers: buildHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Postiz upload failed: ${response.status}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    return {
      id: String(body.id ?? body.fileId ?? body.mediaId ?? path.basename(input.filePath)),
      url: String(body.url ?? body.path ?? body.fileUrl ?? ""),
      mimeType: typeof body.mimeType === "string" ? body.mimeType : undefined,
    };
  }

  async schedulePost(input: SchedulePostInput): Promise<PostizPostReference> {
    const payload = {
      integrationId: input.channel.postizIntegrationId,
      content: input.variant.caption,
      scheduleDate: input.scheduledAt,
      timezone: input.timezone,
      media: input.media.map((entry) => ({
        id: entry.id,
        url: entry.url,
      })),
      settings: stringifySettings(input),
      title: input.variant.title ?? undefined,
    };

    const response = await fetch(buildPublicUrl("/posts"), {
      method: "POST",
      headers: {
        ...buildHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Postiz schedule failed: ${response.status} ${rawText}`);
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
    } catch {
      parsed = {};
    }

    const nestedData =
      typeof parsed.data === "object" && parsed.data !== null
        ? (parsed.data as Record<string, unknown>)
        : null;

    return {
      id: String(parsed.id ?? parsed.postId ?? nestedData?.id ?? `${input.variant.id}:${input.channel.id}`),
      status: typeof parsed.status === "string" ? parsed.status : undefined,
      rawJson: rawText,
    };
  }
}
