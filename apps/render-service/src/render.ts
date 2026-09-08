import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";

import {
  createRenderArtifactPaths,
  findLatestRenderArtifact,
  writeRenderMetadata,
  type RenderArtifactMetadata,
} from "./artifacts";
import { createR2ArtifactUploadTargets, uploadRenderArtifactsToR2 } from "./storage";
import { releaseCompositionId } from "./constants";
import {
  createRenderServiceError,
  getRenderServiceErrorData,
  toRenderServiceError,
} from "./errors";
import { RenderLogger, type RenderProgressEvent } from "./logger";
import { assertRenderPreflight } from "./preflight";
import { getRenderProfile, type RenderProfileId } from "./profiles";
import { renderEpisodeMedia } from "./remotion";
import {
  explainEpisodeCameraFrame,
  explainRenderDataCameraFrame,
  getEpisodeCameraArtifact,
  getEpisodeCameraProgramManifests,
  getRenderDataCameraArtifact,
  getRenderDataCameraProgramManifests,
} from "video-runner/camera-diagnostics";
import type { EpisodeRenderData } from "video-runner/render-data";

export type RenderEpisodeOptions = {
  episodeId: string;
  jobId: string;
  profile: RenderProfileId;
  /**
   * Immutable prepared input supplied by a non-catalog caller.
   * When omitted, the catalog registry remains the source of render data.
   */
  renderData?: EpisodeRenderData;
  cameraPlanId?: string;
  /** Inclusive source frames for deterministic chunks and release probes. */
  frameRange?: [number, number];
  onProgress?: (event: RenderProgressEvent) => void | Promise<void>;
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

async function sha256File(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
      cameraProgramPath: input.paths.relativeCameraProgramPath,
      cameraDiagnosticsPath: input.paths.relativeCameraDiagnosticsPath,
      projectionHashesPath: input.paths.relativeProjectionHashesPath,
      cameraTracePath: input.paths.relativeCameraTracePath,
      videoUrl: null,
      posterUrl: null,
      metadataUrl: null,
      logsUrl: null,
      cameraProgramUrl: null,
      cameraDiagnosticsUrl: null,
      projectionHashesUrl: null,
      cameraTraceUrl: null,
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
    cameraProgramPath: input.uploadTargets.cameraProgram.locator,
    cameraDiagnosticsPath: input.uploadTargets.cameraDiagnostics.locator,
    projectionHashesPath: input.uploadTargets.projectionHashes.locator,
    cameraTracePath: input.uploadTargets.cameraTrace.locator,
    videoUrl: input.uploadTargets.video.publicUrl,
    posterUrl: input.uploadTargets.poster.publicUrl,
    metadataUrl: input.uploadTargets.metadata.publicUrl,
    logsUrl: input.uploadTargets.logs.publicUrl,
    cameraProgramUrl: input.uploadTargets.cameraProgram.publicUrl,
    cameraDiagnosticsUrl: input.uploadTargets.cameraDiagnostics.publicUrl,
    projectionHashesUrl: input.uploadTargets.projectionHashes.publicUrl,
    cameraTraceUrl: input.uploadTargets.cameraTrace.publicUrl,
    sizeBytes: input.sizeBytes,
  };
}

export async function renderEpisodeArtifact(
  options: RenderEpisodeOptions,
): Promise<RenderEpisodeResult> {
  const startedAt = Date.now();
  const profile = getRenderProfile(options.profile);
  const paths = await createRenderArtifactPaths(options);
  const logger = new RenderLogger(
    paths.logsPath,
    {
      episodeId: options.episodeId,
      jobId: options.jobId,
      profile: profile.id,
    },
    options.onProgress,
  );
  await logger.init();
  await logger.info("render.start", "Starting render", {
    episodeId: options.episodeId,
    jobId: options.jobId,
    profile: profile.id,
    sourceSignature: options.renderData?.sourceSignature,
  });
  if (options.renderData && options.renderData.episodeId !== options.episodeId) {
    throw createRenderServiceError({
      code: "RENDER_DATA_EPISODE_MISMATCH",
      stage: "bootstrap",
      message: `Prepared render data belongs to "${options.renderData.episodeId}", not "${options.episodeId}".`,
      details: {
        episodeId: options.episodeId,
        renderDataEpisodeId: options.renderData.episodeId,
      },
    });
  }
  let camera: Awaited<ReturnType<typeof getEpisodeCameraArtifact>> | undefined;

  try {
    const preflightStart = Date.now();
    await assertRenderPreflight();
    const preflightMs = Date.now() - preflightStart;
    await logger.info("preflight.ok", "Render preflight passed", {
      durationMs: preflightMs,
    });

    camera = options.renderData
      ? getRenderDataCameraArtifact({
          renderData: options.renderData,
          cameraPlanId: options.cameraPlanId,
        })
      : await getEpisodeCameraArtifact({
          episodeId: options.episodeId,
          cameraPlanId: options.cameraPlanId,
        });
    const cameraPrograms = options.renderData
      ? getRenderDataCameraProgramManifests(options.renderData)
      : await getEpisodeCameraProgramManifests(options.episodeId);
    const diagnosticRange: readonly [number, number] = options.frameRange ?? [
      0,
      camera.program.durationInFrames - 1,
    ];
    const representativeFrames = [
      diagnosticRange[0],
      Math.floor((diagnosticRange[0] + diagnosticRange[1]) / 2),
      diagnosticRange[1],
    ].filter((frame, index, frames) => frame >= 0 && frames.indexOf(frame) === index);
    const explanations = await Promise.all(
      camera.program.outputs.flatMap((output) =>
        representativeFrames.map((frame) =>
          options.renderData
            ? explainRenderDataCameraFrame({
                renderData: options.renderData,
                cameraPlanId: camera?.selectedCameraPlanId,
                outputId: output.id,
                frame,
              })
            : explainEpisodeCameraFrame({
                episodeId: options.episodeId,
                cameraPlanId: camera?.selectedCameraPlanId,
                outputId: output.id,
                frame,
              }),
        ),
      ),
    );
    await writeJson(paths.cameraProgramPath, camera);
    await writeJson(paths.cameraDiagnosticsPath, {
      version: 1,
      selectedCameraPlanId: camera.selectedCameraPlanId,
      manifests: cameraPrograms,
      representativeFrames,
      explanations,
    });
    await fs.writeFile(
      paths.cameraTracePath,
      `${explanations
        .map((explanation) => JSON.stringify({ kind: "explain", ...explanation }))
        .join("\n")}\n`,
      "utf8",
    );

    const renderOutput = await renderEpisodeMedia({
      episodeId: options.episodeId,
      renderData: options.renderData,
      cameraPlanId: options.cameraPlanId,
      profile,
      outputLocation: paths.videoPath,
      posterLocation: paths.posterPath,
      cameraTracePath: paths.cameraTracePath,
      frameRange: options.frameRange,
      logger,
    });
    await writeJson(paths.cameraDiagnosticsPath, {
      version: 2,
      selectedCameraPlanId: camera.selectedCameraPlanId,
      manifests: cameraPrograms,
      representativeFrames,
      explanations,
      temporalQuality: renderOutput.cameraQuality ?? null,
    });

    const sizeBytes = await statSize(paths.videoPath);
    const [videoSha256, posterSha256] = await Promise.all([
      sha256File(paths.videoPath),
      sha256File(paths.posterPath),
    ]);
    await writeJson(paths.projectionHashesPath, {
      version: 1,
      cameraSignature: camera.program.signature,
      sourceSignature: renderOutput.sourceSignature,
      bundleSourceSignature: renderOutput.bundleSourceSignature,
      sourceFrameRange: renderOutput.sourceFrameRange,
      files: {
        video: { sha256: videoSha256, sizeBytes },
        poster: {
          sha256: posterSha256,
          sizeBytes: await statSize(paths.posterPath),
        },
      },
    });
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
      cameraPlanId: options.cameraPlanId,
      compositionId: releaseCompositionId,
      fps: renderOutput.composition.fps,
      width: renderOutput.composition.width,
      height: renderOutput.composition.height,
      durationInFrames: renderOutput.sourceFrameRange[1] - renderOutput.sourceFrameRange[0] + 1,
      sourceFrameRange: renderOutput.sourceFrameRange,
      sourceSignature: renderOutput.sourceSignature,
      bundleSourceSignature: renderOutput.bundleSourceSignature,
      camera,
      projectionMode: "render",
      cameraQuality: renderOutput.cameraQuality ?? null,
      renderCache: "renderCache" in renderOutput ? (renderOutput.renderCache ?? null) : null,
      artifact: artifactRecord,
      timingMs: {
        preflight: preflightMs,
        bundle: renderOutput.timingMs.bundle,
        selectComposition: renderOutput.timingMs.selectComposition,
        renderMedia: renderOutput.timingMs.renderMedia,
        renderStill: renderOutput.timingMs.renderStill,
        ...("cameraTexture" in renderOutput.timingMs
          ? { cameraTexture: renderOutput.timingMs.cameraTexture }
          : {}),
        total: Date.now() - startedAt,
      },
      machine: {
        node: process.versions.node,
        platform: process.platform,
        arch: process.arch,
      },
      createdAt: new Date().toISOString(),
    };

    await writeRenderMetadata(paths.metadataPath, metadata).catch((error) => {
      throw createRenderServiceError({
        code: "ARTIFACT_WRITE_FAILED",
        stage: "artifacts",
        message: "Writing render metadata failed",
        details: {
          metadataPath: paths.metadataPath,
        },
        cause: error instanceof Error ? error : undefined,
      });
    });

    if (uploadTargets) {
      await logger.info("storage.upload.start", "Uploading render artifacts to R2", {
        bucket: uploadTargets.bucket,
        keyPrefix: uploadTargets.keyPrefix,
      });
      await uploadRenderArtifactsToR2({
        videoFilePath: paths.videoPath,
        posterFilePath: paths.posterPath,
        metadataFilePath: paths.metadataPath,
        logsFilePath: paths.logsPath,
        cameraProgramFilePath: paths.cameraProgramPath,
        cameraDiagnosticsFilePath: paths.cameraDiagnosticsPath,
        projectionHashesFilePath: paths.projectionHashesPath,
        cameraTraceFilePath: paths.cameraTracePath,
        targets: uploadTargets,
      });
      await logger.info("storage.upload.done", "Uploaded render artifacts to R2", {
        bucket: uploadTargets.bucket,
        keyPrefix: uploadTargets.keyPrefix,
        videoUrl: uploadTargets.video.publicUrl,
        posterUrl: uploadTargets.poster.publicUrl,
        metadataUrl: uploadTargets.metadata.publicUrl,
      });
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
  } catch (error) {
    const renderError = toRenderServiceError(error, {
      code: "RENDER_JOB_FAILED",
      stage: "render",
      message: `Render job "${options.jobId}" failed`,
      details: {
        episodeId: options.episodeId,
        jobId: options.jobId,
        profile: profile.id,
      },
    });

    await writeJson(paths.cameraFailurePacketPath, {
      version: 1,
      episodeId: options.episodeId,
      cameraPlanId: options.cameraPlanId ?? camera?.selectedCameraPlanId,
      camera,
      error: getRenderServiceErrorData(renderError),
    }).catch(() => undefined);

    await logger.error("render.failed", renderError.message, {
      ...getRenderServiceErrorData(renderError),
      episodeId: options.episodeId,
      cameraPlanId: options.cameraPlanId,
      jobId: options.jobId,
      profile: profile.id,
      cameraFailurePacketPath: paths.cameraFailurePacketPath,
    });

    throw renderError;
  }
}

export { findLatestRenderArtifact };
