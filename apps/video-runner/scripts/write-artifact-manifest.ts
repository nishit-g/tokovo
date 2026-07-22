import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  getFormat,
  type EpisodeDefinition,
  type FormatId,
} from "@tokovo/episodes";
import { z } from "zod";
import { createVideoRunnerEpisodeRegistry } from "../src/episode-registry";
import { getEpisodeCameraArtifact } from "../src/camera-diagnostics";

const renderArtifactManifestSchema = z.object({
  id: z.string(),
  episodeId: z.string(),
  sourceHash: z.string(),
  videoPath: z.string(),
  cameraPlanId: z.string().optional(),
  cameraProjectionMode: z.literal("preview").optional(),
  camera: z.unknown(),
  thumbnailPath: z.string().optional(),
  durationMs: z.number().int().nonnegative(),
  createdAt: z.string(),
});

interface CliArgs {
  episodeId: string;
  outFile: string;
  cameraPlanId?: string;
  cameraProjectionMode?: "preview";
}

function parseArgs(): CliArgs {
  const [, , episodeId, outFile, cameraPlanId, cameraProjectionMode] =
    process.argv;
  if (!episodeId || !outFile) {
    throw new Error(
      "Usage: write-artifact-manifest.ts <episodeId> <outFile> [cameraPlanId] [preview]",
    );
  }
  if (cameraProjectionMode && cameraProjectionMode !== "preview") {
    throw new Error(
      `Unsupported camera projection mode: ${cameraProjectionMode}`,
    );
  }
  return {
    episodeId,
    outFile: path.resolve(outFile),
    cameraPlanId: cameraPlanId || undefined,
    cameraProjectionMode: cameraProjectionMode || undefined,
  };
}

function getDurationMs(episode: EpisodeDefinition): number {
  const format =
    typeof episode.config.format === "string"
      ? getFormat(episode.config.format as FormatId)
      : episode.config.format;

  return Math.round((episode.config.durationInFrames / format.fps) * 1000);
}

function computeSourceHash(episode: EpisodeDefinition): string {
  const ir = episode.build();
  return createHash("sha256")
    .update(JSON.stringify({ meta: episode.meta, config: episode.config, ir }))
    .digest("hex");
}

function deriveArtifactId(
  episode: EpisodeDefinition,
  outFile: string,
  sourceHash: string,
): string {
  return `artifact_${createHash("sha256")
    .update(`${episode.meta.id}:${outFile}:${sourceHash}`)
    .digest("hex")
    .slice(0, 16)}`;
}

async function main() {
  const { episodeId, outFile, cameraPlanId, cameraProjectionMode } =
    parseArgs();
  if (!fs.existsSync(outFile)) {
    throw new Error(`Rendered file does not exist: ${outFile}`);
  }

  const registry = createVideoRunnerEpisodeRegistry();
  const episode = registry.get(episodeId);
  if (!episode) {
    throw new Error(`Unknown episode: ${episodeId}`);
  }

  const sourceHash = computeSourceHash(episode);
  const camera = await getEpisodeCameraArtifact({ episodeId, cameraPlanId });
  const manifest = renderArtifactManifestSchema.parse({
    id: deriveArtifactId(episode, outFile, sourceHash),
    episodeId: episode.meta.id,
    sourceHash,
    videoPath: outFile,
    cameraPlanId,
    cameraProjectionMode,
    camera,
    durationMs: getDurationMs(episode),
    createdAt: new Date().toISOString(),
  });

  const manifestPath = `${outFile}.artifact.json`;
  await fs.promises.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[artifact] manifest=${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
