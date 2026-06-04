import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createRenderServiceError } from "./errors";
import { getR2Config, type R2Config } from "./env";

export type R2ArtifactTarget = {
  objectKey: string;
  locator: string;
  publicUrl: string | null;
};

export type R2ArtifactUploadTargets = {
  bucket: string;
  keyPrefix: string;
  video: R2ArtifactTarget;
  poster: R2ArtifactTarget;
  metadata: R2ArtifactTarget;
  logs: R2ArtifactTarget;
};

export type PresignedArtifactUrls = {
  videoUrl: string | null;
  posterUrl: string | null;
  metadataUrl: string | null;
  logsUrl: string | null;
  expiresInSeconds: number;
};

export type PresignedAssetUrlMap = Record<string, string>;

let cachedClient: S3Client | null = null;
let cachedClientSignature = "";
const presignedGetUrlCache = new Map<string, { url: string; expiresAtMs: number }>();

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function getClient(config: R2Config): S3Client {
  const signature = createR2ClientSignature(config);
  if (cachedClient && cachedClientSignature === signature) {
    return cachedClient;
  }

  cachedClientSignature = signature;
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return cachedClient;
}

function createR2ClientSignature(config: R2Config): string {
  return createHash("sha256")
    .update(
      [
        config.endpoint,
        config.region,
        config.accessKeyId,
        config.secretAccessKey,
        config.bucket,
      ].join("|"),
    )
    .digest("hex");
}

function createTarget(
  bucket: string,
  publicBaseUrl: string | null,
  objectKey: string,
): R2ArtifactTarget {
  return {
    objectKey,
    locator: `r2://${bucket}/${objectKey}`,
    publicUrl: publicBaseUrl
      ? new URL(objectKey, withTrailingSlash(publicBaseUrl)).toString()
      : null,
  };
}

export function createR2ArtifactUploadTargets(
  storagePrefix: string,
): R2ArtifactUploadTargets | null {
  const config = getR2Config();
  if (!config) return null;

  const keyPrefix = config.keyPrefix
    ? path.posix.join(config.keyPrefix, storagePrefix)
    : storagePrefix;

  return {
    bucket: config.bucket,
    keyPrefix,
    video: createTarget(
      config.bucket,
      config.publicBaseUrl,
      path.posix.join(keyPrefix, "video.mp4"),
    ),
    poster: createTarget(
      config.bucket,
      config.publicBaseUrl,
      path.posix.join(keyPrefix, "poster.png"),
    ),
    metadata: createTarget(
      config.bucket,
      config.publicBaseUrl,
      path.posix.join(keyPrefix, "metadata.json"),
    ),
    logs: createTarget(
      config.bucket,
      config.publicBaseUrl,
      path.posix.join(keyPrefix, "logs.ndjson"),
    ),
  };
}

function parseR2Locator(locator: string): { bucket: string; key: string } | null {
  if (!locator.startsWith("r2://")) return null;
  const remainder = locator.slice("r2://".length);
  const slashIndex = remainder.indexOf("/");
  if (slashIndex <= 0) return null;
  return {
    bucket: remainder.slice(0, slashIndex),
    key: remainder.slice(slashIndex + 1),
  };
}

async function presignGetObject(locator: string, expiresInSeconds: number): Promise<string | null> {
  const parsed = parseR2Locator(locator);
  const config = getR2Config();
  if (!parsed || !config) return null;

  const cacheKey = `${createR2ClientSignature(config)}|${locator}|${expiresInSeconds}`;
  const cached = presignedGetUrlCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAtMs - now > 60_000) {
    return cached.url;
  }

  const client = getClient(config);
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: parsed.bucket,
      Key: parsed.key,
    }),
    { expiresIn: expiresInSeconds },
  );
  presignedGetUrlCache.set(cacheKey, {
    url,
    expiresAtMs: now + expiresInSeconds * 1000,
  });
  return url;
}

export async function createPresignedArtifactUrls(
  artifact: {
    videoPath: string;
    posterPath: string;
    metadataPath: string;
    logsPath: string;
  },
  expiresInSeconds = 3600,
): Promise<PresignedArtifactUrls> {
  return {
    videoUrl: await presignGetObject(artifact.videoPath, expiresInSeconds),
    posterUrl: await presignGetObject(artifact.posterPath, expiresInSeconds),
    metadataUrl: await presignGetObject(artifact.metadataPath, expiresInSeconds),
    logsUrl: await presignGetObject(artifact.logsPath, expiresInSeconds),
    expiresInSeconds,
  };
}

export async function createPresignedAssetUrlMap(
  assetSources: string[],
  expiresInSeconds = 3600,
): Promise<PresignedAssetUrlMap> {
  const uniqueSources = [...new Set(assetSources)].filter((src) => src.startsWith("r2://"));
  const entries = await Promise.all(
    uniqueSources.map(async (src) => {
      const url = await presignGetObject(src, expiresInSeconds);
      return url ? ([src, url] as const) : null;
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is readonly [string, string] => entry !== null),
  );
}

async function uploadFile(
  config: R2Config,
  input: {
    filePath: string;
    objectKey: string;
    contentType: string;
  },
): Promise<void> {
  const client = getClient(config);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: input.objectKey,
      Body: fs.createReadStream(input.filePath),
      ContentType: input.contentType,
    }),
  );
}

export async function uploadRenderArtifactsToR2(input: {
  videoFilePath: string;
  posterFilePath: string;
  metadataFilePath: string;
  logsFilePath: string;
  targets: R2ArtifactUploadTargets;
}): Promise<void> {
  const config = getR2Config();
  if (!config) {
    throw createRenderServiceError({
      code: "STORAGE_CONFIG_INVALID",
      stage: "storage",
      message: "R2 upload requested without a valid R2 configuration",
    });
  }

  try {
    await uploadFile(config, {
      filePath: input.videoFilePath,
      objectKey: input.targets.video.objectKey,
      contentType: "video/mp4",
    });
    await uploadFile(config, {
      filePath: input.posterFilePath,
      objectKey: input.targets.poster.objectKey,
      contentType: "image/png",
    });
    await uploadFile(config, {
      filePath: input.logsFilePath,
      objectKey: input.targets.logs.objectKey,
      contentType: "application/x-ndjson",
    });
    await uploadFile(config, {
      filePath: input.metadataFilePath,
      objectKey: input.targets.metadata.objectKey,
      contentType: "application/json",
    });
  } catch (error) {
    throw createRenderServiceError({
      code: "STORAGE_UPLOAD_FAILED",
      stage: "storage",
      message: "Failed to upload render artifacts to R2",
      retryable: true,
      details: {
        bucket: input.targets.bucket,
        keyPrefix: input.targets.keyPrefix,
      },
      cause: error instanceof Error ? error : undefined,
    });
  }
}
