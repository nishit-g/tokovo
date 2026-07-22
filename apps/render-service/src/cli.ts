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
import {
  diffEpisodeCameraPlans,
  explainEpisodeCameraFrame,
  getEpisodeCameraProgramManifests,
  getRegisteredCinematicSubjectSchemas,
} from "video-runner/camera-diagnostics";

const DEFAULT_EPISODE_ID = "v2-creator-series-showcase";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function positional(index: number): string | undefined {
  return process.argv.slice(2)[index];
}

function optionalFrameRange(): [number, number] | undefined {
  const startRaw = argValue("--start-frame");
  const endRaw = argValue("--end-frame");
  if (startRaw === undefined && endRaw === undefined) return undefined;
  if (startRaw === undefined || endRaw === undefined) {
    throw new Error("--start-frame and --end-frame must be supplied together.");
  }
  const startFrame = Number(startRaw);
  const endFrame = Number(endRaw);
  if (
    !Number.isInteger(startFrame) ||
    !Number.isInteger(endFrame) ||
    startFrame < 0 ||
    endFrame < startFrame
  ) {
    throw new Error(`Invalid inclusive frame range "${startRaw}-${endRaw}".`);
  }
  return [startFrame, endFrame];
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
  const cameraPlanId = argValue("--camera-plan") ?? process.env.CAMERA_PLAN_ID ?? undefined;
  const frameRange = optionalFrameRange();

  const result = await renderEpisodeArtifact({
    episodeId,
    jobId,
    profile,
    cameraPlanId,
    frameRange,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        episodeId,
        profile,
        cameraPlanId: cameraPlanId ?? null,
        frameRange: frameRange ?? null,
        videoPath: result.videoPath,
        posterPath: result.posterPath,
        metadataPath: result.metadataPath,
        artifactStorageProvider: result.metadata.artifact.storageProvider,
        artifactVideoPath: result.metadata.artifact.videoPath,
        artifactPosterPath: result.metadata.artifact.posterPath,
        artifactMetadataPath: result.metadata.artifact.metadataPath,
        artifactLogsPath: result.metadata.artifact.logsPath,
        cameraProgramPath: result.metadata.artifact.cameraProgramPath,
        cameraDiagnosticsPath: result.metadata.artifact.cameraDiagnosticsPath,
        projectionHashesPath: result.metadata.artifact.projectionHashesPath,
        cameraTracePath: result.metadata.artifact.cameraTracePath,
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
        cameraProgramPath: artifact.artifact.cameraProgramPath,
        cameraDiagnosticsPath: artifact.artifact.cameraDiagnosticsPath,
        projectionHashesPath: artifact.artifact.projectionHashesPath,
        cameraTracePath: artifact.artifact.cameraTracePath,
        ...presignedUrls,
      },
      null,
      2,
    ),
  );
}

async function runCameraCommand(): Promise<void> {
  const action = positional(1) ?? "programs";
  const episodeId =
    argValue("--episode") ?? positional(2) ?? process.env.EPISODE_ID ?? DEFAULT_EPISODE_ID;
  if (action === "programs") {
    console.log(JSON.stringify(await getEpisodeCameraProgramManifests(episodeId), null, 2));
    return;
  }
  if (action === "explain") {
    const frameRaw = argValue("--frame") ?? "0";
    const frame = Number(frameRaw);
    if (!Number.isInteger(frame) || frame < 0) {
      throw new Error(`Invalid camera frame "${frameRaw}".`);
    }
    console.log(
      JSON.stringify(
        await explainEpisodeCameraFrame({
          episodeId,
          cameraPlanId: argValue("--camera-plan"),
          outputId: argValue("--output"),
          frame,
        }),
        null,
        2,
      ),
    );
    return;
  }
  if (action === "diff") {
    const leftCameraPlanId = argValue("--left");
    const rightCameraPlanId = argValue("--right");
    if (!leftCameraPlanId || !rightCameraPlanId) {
      throw new Error("camera diff requires --left <plan> and --right <plan>.");
    }
    console.log(
      JSON.stringify(
        await diffEpisodeCameraPlans({
          episodeId,
          leftCameraPlanId,
          rightCameraPlanId,
        }),
        null,
        2,
      ),
    );
    return;
  }
  if (action === "subjects") {
    console.log(
      JSON.stringify({ episodeId, schemas: getRegisteredCinematicSubjectSchemas() }, null, 2),
    );
    return;
  }
  throw new Error(`Unknown camera diagnostic command "${action}".`);
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

    if (command === "camera") {
      await runCameraCommand();
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
