import fs from "node:fs/promises";
import path from "node:path";

import { closeBrowser } from "./remotion";
import {
  createRenderServiceError,
  formatRenderServiceError,
  getRenderServiceErrorData,
  toRenderServiceError,
} from "./errors";
import { runRenderDoctor } from "./preflight";
import { findLatestRenderArtifact, renderEpisodeArtifact } from "./render";
import { createPresignedArtifactUrls } from "./storage";
import { repoRoot } from "./constants";

const DEFAULT_EPISODE_ID = "v2-creator-series-showcase";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function positional(index: number): string | undefined {
  return process.argv.slice(2)[index];
}

async function runDoctor(): Promise<void> {
  const result = await runRenderDoctor();
  for (const check of result.checks) {
    const prefix = check.ok ? "PASS" : "FAIL";
    console.log(`[render:doctor] ${prefix} ${check.id} - ${check.message}`);
  }
  if (!result.ok) process.exitCode = 1;
}

async function runRender(): Promise<void> {
  const episodeId =
    argValue("--episode") ?? positional(1) ?? process.env.EPISODE_ID ?? DEFAULT_EPISODE_ID;
  const profile =
    (argValue("--profile") as "fast-preview" | "review" | "release" | undefined) ??
    (process.env.PROFILE as "fast-preview" | "review" | "release" | undefined) ??
    "review";
  const jobId = argValue("--job") ?? process.env.JOB_ID ?? `manual-${Date.now()}`;

  const result = await renderEpisodeArtifact({
    episodeId,
    jobId,
    profile,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        episodeId,
        profile,
        videoPath: result.videoPath,
        posterPath: result.posterPath,
        metadataPath: result.metadataPath,
        artifactStorageProvider: result.metadata.artifact.storageProvider,
        artifactVideoPath: result.metadata.artifact.videoPath,
        artifactPosterPath: result.metadata.artifact.posterPath,
        artifactMetadataPath: result.metadata.artifact.metadataPath,
        artifactLogsPath: result.metadata.artifact.logsPath,
        artifactVideoUrl: result.metadata.artifact.videoUrl ?? null,
        artifactPosterUrl: result.metadata.artifact.posterUrl ?? null,
        artifactMetadataUrl: result.metadata.artifact.metadataUrl ?? null,
      },
      null,
      2,
    ),
  );
}

async function runArtifactUrls(): Promise<void> {
  const episodeId =
    argValue("--episode") ?? positional(1) ?? process.env.EPISODE_ID ?? DEFAULT_EPISODE_ID;
  const expiresInRaw = argValue("--expires-in") ?? process.env.EXPIRES_IN ?? "3600";
  const expiresInSeconds = Number(expiresInRaw);
  if (!Number.isFinite(expiresInSeconds) || expiresInSeconds < 1) {
    throw createRenderServiceError({
      code: "CLI_INVALID_ARGUMENT",
      stage: "cli",
      message: `Invalid expires-in value "${expiresInRaw}"`,
      details: {
        flag: "--expires-in",
        value: expiresInRaw,
      },
    });
  }

  const artifact = await findLatestRenderArtifact(episodeId);
  if (!artifact) {
    throw createRenderServiceError({
      code: "ARTIFACT_NOT_FOUND",
      stage: "artifacts",
      message: `No render artifact found for episode "${episodeId}"`,
      details: {
        episodeId,
      },
    });
  }

  const presignedUrls =
    artifact.artifact.storageProvider === "r2"
      ? await createPresignedArtifactUrls(artifact.artifact, Math.floor(expiresInSeconds))
      : {
          videoUrl: null,
          posterUrl: null,
          metadataUrl: null,
          logsUrl: null,
          expiresInSeconds: Math.floor(expiresInSeconds),
        };

  console.log(
    JSON.stringify(
      {
        ok: true,
        episodeId,
        profile: artifact.profile,
        createdAt: artifact.createdAt,
        artifactStorageProvider: artifact.artifact.storageProvider,
        artifactVideoPath: artifact.artifact.videoPath,
        artifactPosterPath: artifact.artifact.posterPath,
        artifactMetadataPath: artifact.artifact.metadataPath,
        artifactLogsPath: artifact.artifact.logsPath,
        ...presignedUrls,
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const command = positional(0) ?? "doctor";

  try {
    if (command === "doctor") {
      await runDoctor();
      return;
    }

    if (command === "smoke") {
      await fs.rm(path.join(repoRoot, ".remotion", "bundles"), {
        recursive: true,
        force: true,
      });
      process.env.EPISODE_ID = process.env.EPISODE_ID ?? "render-service-smoke";
      process.env.PROFILE = process.env.PROFILE ?? "fast-preview";
      process.env.TOKOVO_EPISODE_CATALOG_PROFILE =
        process.env.TOKOVO_EPISODE_CATALOG_PROFILE ?? "studio";
      await runRender();
      return;
    }

    if (command === "render") {
      await runRender();
      return;
    }

    if (command === "artifact-urls") {
      await runArtifactUrls();
      return;
    }

    throw createRenderServiceError({
      code: "CLI_UNKNOWN_COMMAND",
      stage: "cli",
      message: `Unknown render-service command "${command}"`,
      details: {
        command,
      },
    });
  } finally {
    await closeBrowser();
  }
}

main().catch((error) => {
  const renderError = toRenderServiceError(error, {
    code: "RENDER_JOB_FAILED",
    stage: "cli",
    message: "Render-service command failed",
  });
  console.error("[render-service]", formatRenderServiceError(renderError), {
    ...getRenderServiceErrorData(renderError),
    cause: renderError.cause?.message,
  });
  process.exit(1);
});
