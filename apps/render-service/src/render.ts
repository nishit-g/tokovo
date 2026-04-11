import fs from "node:fs/promises";
import path from "node:path";

import {
  createRenderArtifactPaths,
  findLatestRenderArtifact,
  writeRenderMetadata,
  type RenderArtifactMetadata,
} from "./artifacts";
import {
  createR2ArtifactUploadTargets,
  uploadRenderArtifactsToR2,
} from "./storage";
import { releaseCompositionId } from "./constants";
import { RenderLogger } from "./logger";
import { assertRenderPreflight } from "./preflight";
import { getRenderProfile, type RenderProfileId } from "./profiles";
import { renderEpisodeMedia } from "./remotion";

export type RenderEpisodeOptions = {
  episodeId: string;
  jobId: string;
  profile: RenderProfileId;
};

export type RenderEpisodeResult = {
  videoPath: string;
  posterPath: string;
  metadataPath: string;
  logsPath: string;
  metadata: RenderArtifactMetadata;
};

async function statSize(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size;
}

function createArtifactRecord(input: {
  paths: Awaited<ReturnType<typeof createRenderArtifactPaths>>;
  sizeBytes: number;
  uploadTargets: ReturnType<typeof createR2ArtifactUploadTargets>;
}): RenderArtifactMetadata["artifact"] {
  if (!input.uploadTargets) {
    return {
      storageProvider: "local",
      videoPath: input.paths.relativeVideoPath,
      posterPath: input.paths.relativePosterPath,
      metadataPath: input.paths.relativeMetadataPath,
      logsPath: input.paths.relativeLogsPath,
      videoUrl: null,
      posterUrl: null,
      metadataUrl: null,
      logsUrl: null,
      sizeBytes: input.sizeBytes,
    };
  }

  return {
    storageProvider: "r2",
    bucket: input.uploadTargets.bucket,
    keyPrefix: input.uploadTargets.keyPrefix,
    videoPath: input.uploadTargets.video.locator,
    posterPath: input.uploadTargets.poster.locator,
    metadataPath: input.uploadTargets.metadata.locator,
    logsPath: input.uploadTargets.logs.locator,
    videoUrl: input.uploadTargets.video.publicUrl,
    posterUrl: input.uploadTargets.poster.publicUrl,
    metadataUrl: input.uploadTargets.metadata.publicUrl,
    logsUrl: input.uploadTargets.logs.publicUrl,
    sizeBytes: input.sizeBytes,
  };
}

export async function renderEpisodeArtifact(
  options: RenderEpisodeOptions,
): Promise<RenderEpisodeResult> {
  const startedAt = Date.now();
  const profile = getRenderProfile(options.profile);
  const paths = await createRenderArtifactPaths(options);
  const logger = new RenderLogger(paths.logsPath, {
    episodeId: options.episodeId,
    jobId: options.jobId,
    profile: profile.id,
  });
  await logger.init();
  await logger.info("render.start", "Starting render", {
    episodeId: options.episodeId,
    jobId: options.jobId,
    profile: profile.id,
  });

  const preflightStart = Date.now();
  await assertRenderPreflight();
  const preflightMs = Date.now() - preflightStart;
  await logger.info("preflight.ok", "Render preflight passed", {
    durationMs: preflightMs,
  });

  const renderOutput = await renderEpisodeMedia({
    episodeId: options.episodeId,
    profile,
    outputLocation: paths.videoPath,
    posterLocation: paths.posterPath,
    logger,
  });

  const sizeBytes = await statSize(paths.videoPath);
  const uploadTargets = createR2ArtifactUploadTargets(paths.storagePrefix);
  const artifactRecord = createArtifactRecord({
    paths,
    sizeBytes,
    uploadTargets,
  });

  const metadata: RenderArtifactMetadata = {
    episodeId: options.episodeId,
    jobId: options.jobId,
    profile: profile.id,
    compositionId: releaseCompositionId,
    fps: renderOutput.composition.fps,
    width: renderOutput.composition.width,
    height: renderOutput.composition.height,
    durationInFrames: renderOutput.composition.durationInFrames,
    sourceSignature: renderOutput.sourceSignature,
    artifact: artifactRecord,
    timingMs: {
      preflight: preflightMs,
      bundle: renderOutput.timingMs.bundle,
      selectComposition: renderOutput.timingMs.selectComposition,
      renderMedia: renderOutput.timingMs.renderMedia,
      renderStill: renderOutput.timingMs.renderStill,
      total: Date.now() - startedAt,
    },
    machine: {
      node: process.versions.node,
      platform: process.platform,
      arch: process.arch,
    },
    createdAt: new Date().toISOString(),
  };

  await writeRenderMetadata(paths.metadataPath, metadata);

  if (uploadTargets) {
    await logger.info(
      "storage.upload.start",
      "Uploading render artifacts to R2",
      {
        bucket: uploadTargets.bucket,
        keyPrefix: uploadTargets.keyPrefix,
      },
    );
    await uploadRenderArtifactsToR2({
      videoFilePath: paths.videoPath,
      posterFilePath: paths.posterPath,
      metadataFilePath: paths.metadataPath,
      logsFilePath: paths.logsPath,
      targets: uploadTargets,
    });
    await logger.info(
      "storage.upload.done",
      "Uploaded render artifacts to R2",
      {
        bucket: uploadTargets.bucket,
        keyPrefix: uploadTargets.keyPrefix,
        videoUrl: uploadTargets.video.publicUrl,
        posterUrl: uploadTargets.poster.publicUrl,
        metadataUrl: uploadTargets.metadata.publicUrl,
      },
    );
  }

  await logger.info("render.done", "Render completed", {
    videoPath: paths.videoPath,
    posterPath: paths.posterPath,
    metadataPath: paths.metadataPath,
    artifactStorageProvider: metadata.artifact.storageProvider,
    artifactVideoPath: metadata.artifact.videoPath,
    artifactPosterPath: metadata.artifact.posterPath,
    artifactMetadataPath: metadata.artifact.metadataPath,
    sizeBytes: metadata.artifact.sizeBytes,
    totalMs: metadata.timingMs.total,
  });

  return {
    videoPath: paths.videoPath,
    posterPath: paths.posterPath,
    metadataPath: paths.metadataPath,
    logsPath: paths.logsPath,
    metadata,
  };
}

export { findLatestRenderArtifact };
