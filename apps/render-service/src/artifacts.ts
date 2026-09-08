import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

import type { RenderProfileId } from "./profiles";
import type { getEpisodeCameraArtifact } from "video-runner/camera-diagnostics";
import type { CameraTemporalQualityReport } from "@tokovo/camera";
import { rendersRoot, repoRoot } from "./constants";

export type RenderArtifactPaths = {
  storagePrefix: string;
  rootDir: string;
  videoPath: string;
  posterPath: string;
  metadataPath: string;
  logsPath: string;
  cameraProgramPath: string;
  cameraDiagnosticsPath: string;
  projectionHashesPath: string;
  cameraTracePath: string;
  cameraFailurePacketPath: string;
  relativeVideoPath: string;
  relativePosterPath: string;
  relativeMetadataPath: string;
  relativeLogsPath: string;
  relativeCameraProgramPath: string;
  relativeCameraDiagnosticsPath: string;
  relativeProjectionHashesPath: string;
  relativeCameraTracePath: string;
};

export type RenderArtifactMetadata = {
  episodeId: string;
  jobId: string;
  profile: RenderProfileId;
  cameraPlanId?: string;
  compositionId: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  /** Inclusive episode-source frames represented by this artifact. */
  sourceFrameRange: readonly [number, number];
  /** Canonical authored episode revision. */
  sourceSignature: string;
  /** Hash of the Remotion renderer bundle used to execute the revision. */
  bundleSourceSignature: string;
  camera: Awaited<ReturnType<typeof getEpisodeCameraArtifact>>;
  projectionMode: "render";
  cameraQuality: CameraTemporalQualityReport | null;
  renderCache: {
    layerPlateEnabled: boolean;
    compositorChunkEnabled: boolean;
    layerPlates: {
      hits: number;
      misses: number;
      disabled: number;
    };
    compositorChunks: {
      enabled: boolean;
      chunkHits: number;
      chunkMisses: number;
    };
  } | null;
  artifact: {
    storageProvider: "local" | "r2";
    bucket?: string;
    keyPrefix?: string;
    videoPath: string;
    posterPath: string;
    metadataPath: string;
    logsPath: string;
    cameraProgramPath: string;
    cameraDiagnosticsPath: string;
    projectionHashesPath: string;
    cameraTracePath: string;
    videoUrl?: string | null;
    posterUrl?: string | null;
    metadataUrl?: string | null;
    logsUrl?: string | null;
    cameraProgramUrl?: string | null;
    cameraDiagnosticsUrl?: string | null;
    projectionHashesUrl?: string | null;
    cameraTraceUrl?: string | null;
    sizeBytes: number;
  };
  timingMs: {
    preflight: number;
    bundle: number;
    selectComposition: number;
    renderMedia: number;
    renderStill: number;
    cameraTexture?: {
      projectionData: number;
      underlayPlate: number;
      stagePlate: number;
      foregroundPlate: number;
      displacementMaps: number;
      compositorChunks: number;
      mux: number;
    };
    total: number;
  };
  machine: {
    node: string;
    platform: NodeJS.Platform;
    arch: NodeJS.Architecture;
  };
  createdAt: string;
};

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export async function createRenderArtifactPaths(input: {
  episodeId: string;
  jobId: string;
  profile: RenderProfileId;
}): Promise<RenderArtifactPaths> {
  const storagePrefix = path.posix.join(
    sanitizeSegment(input.episodeId),
    `${sanitizeSegment(input.jobId)}-${sanitizeSegment(input.profile)}`,
  );
  const rootDir = path.join(
    rendersRoot,
    sanitizeSegment(input.episodeId),
    `${sanitizeSegment(input.jobId)}-${sanitizeSegment(input.profile)}`,
  );
  await fsp.mkdir(rootDir, { recursive: true });
  const videoPath = path.join(rootDir, "video.mp4");
  const posterPath = path.join(rootDir, "poster.png");
  const metadataPath = path.join(rootDir, "metadata.json");
  const logsPath = path.join(rootDir, "logs.ndjson");
  const cameraProgramPath = path.join(rootDir, "camera-program.json");
  const cameraDiagnosticsPath = path.join(rootDir, "camera-diagnostics.json");
  const projectionHashesPath = path.join(rootDir, "projection-hashes.json");
  const cameraTracePath = path.join(rootDir, "camera-trace.ndjson");
  const cameraFailurePacketPath = path.join(rootDir, "camera-failure-packet.json");

  return {
    storagePrefix,
    rootDir,
    videoPath,
    posterPath,
    metadataPath,
    logsPath,
    cameraProgramPath,
    cameraDiagnosticsPath,
    projectionHashesPath,
    cameraTracePath,
    cameraFailurePacketPath,
    relativeVideoPath: path.relative(repoRoot, videoPath),
    relativePosterPath: path.relative(repoRoot, posterPath),
    relativeMetadataPath: path.relative(repoRoot, metadataPath),
    relativeLogsPath: path.relative(repoRoot, logsPath),
    relativeCameraProgramPath: path.relative(repoRoot, cameraProgramPath),
    relativeCameraDiagnosticsPath: path.relative(repoRoot, cameraDiagnosticsPath),
    relativeProjectionHashesPath: path.relative(repoRoot, projectionHashesPath),
    relativeCameraTracePath: path.relative(repoRoot, cameraTracePath),
  };
}

export async function writeRenderMetadata(
  filePath: string,
  metadata: RenderArtifactMetadata,
): Promise<void> {
  await fsp.writeFile(filePath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

export async function findLatestRenderArtifact(
  episodeId: string,
): Promise<RenderArtifactMetadata | null> {
  const episodeDir = path.join(rendersRoot, sanitizeSegment(episodeId));
  const entries = await fsp.readdir(episodeDir, { withFileTypes: true }).catch(() => []);
  const manifests = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const metadataPath = path.join(episodeDir, entry.name, "metadata.json");
        const raw = await fsp.readFile(metadataPath, "utf8").catch(() => null);
        if (!raw) return null;
        const metadata = parseRenderMetadata(raw);
        if (!metadata) return null;
        metadata.artifact.videoPath = resolveArtifactPath(
          metadata.artifact.videoPath,
          metadata.artifact.videoUrl,
        );
        metadata.artifact.posterPath = resolveArtifactPath(
          metadata.artifact.posterPath,
          metadata.artifact.posterUrl,
        );
        metadata.artifact.metadataPath = resolveArtifactPath(
          metadata.artifact.metadataPath,
          metadata.artifact.metadataUrl,
        );
        metadata.artifact.logsPath = resolveArtifactPath(
          metadata.artifact.logsPath,
          metadata.artifact.logsUrl,
        );
        if (metadata.artifact.cameraProgramPath) {
          metadata.artifact.cameraProgramPath = resolveArtifactPath(
            metadata.artifact.cameraProgramPath,
            metadata.artifact.cameraProgramUrl,
          );
        }
        if (metadata.artifact.cameraDiagnosticsPath) {
          metadata.artifact.cameraDiagnosticsPath = resolveArtifactPath(
            metadata.artifact.cameraDiagnosticsPath,
            metadata.artifact.cameraDiagnosticsUrl,
          );
        }
        if (metadata.artifact.projectionHashesPath) {
          metadata.artifact.projectionHashesPath = resolveArtifactPath(
            metadata.artifact.projectionHashesPath,
            metadata.artifact.projectionHashesUrl,
          );
        }
        if (metadata.artifact.cameraTracePath) {
          metadata.artifact.cameraTracePath = resolveArtifactPath(
            metadata.artifact.cameraTracePath,
            metadata.artifact.cameraTraceUrl,
          );
        }
        const stat = await fsp.stat(metadataPath);
        return { metadata, mtimeMs: stat.mtimeMs };
      }),
  );

  const candidates = manifests.filter(
    (entry): entry is { metadata: RenderArtifactMetadata; mtimeMs: number } => Boolean(entry),
  );
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.metadata ?? null;
}

function parseRenderMetadata(raw: string): RenderArtifactMetadata | null {
  try {
    return JSON.parse(raw) as RenderArtifactMetadata;
  } catch {
    return null;
  }
}

function resolveArtifactPath(filePath: string, preferredUrl?: string | null): string {
  if (preferredUrl) return preferredUrl;
  if (!filePath) return filePath;
  if (/^(?:https?:\/\/|r2:\/\/)/.test(filePath)) return filePath;
  if (path.isAbsolute(filePath)) {
    if (fs.existsSync(filePath)) return filePath;
    const outIndex = filePath.lastIndexOf(`${path.sep}out${path.sep}`);
    if (outIndex >= 0) {
      return path.join(repoRoot, filePath.slice(outIndex + 1));
    }
    return filePath;
  }

  const repoRelative = path.join(repoRoot, filePath);
  return repoRelative;
}
