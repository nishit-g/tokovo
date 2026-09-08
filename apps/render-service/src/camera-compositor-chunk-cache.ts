import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import type { CameraTextureProjectionCapture } from "@tokovo/composition";

import { repoRoot } from "./constants";

const CAMERA_COMPOSITOR_CHUNK_CACHE_VERSION = 1;

export interface CameraCompositorChunkIdentity {
  compositorSignature: string;
  plateKeys: {
    underlay: string;
    stage: string;
    foreground: string;
  };
  captureSignature: string;
  sourceFrameRange: readonly [number, number];
  fps: number;
  width: number;
  height: number;
  videoBitrate: string;
  x264Preset: string;
  encodingSignature: string;
}

interface CameraCompositorChunkManifest {
  version: typeof CAMERA_COMPOSITOR_CHUNK_CACHE_VERSION;
  key: string;
  identity: CameraCompositorChunkIdentity;
  sha256: string;
  sizeBytes: number;
}

export interface CameraCompositorChunkCacheHit {
  status: "hit";
  key: string;
  chunkPath: string;
  sha256: string;
  sizeBytes: number;
}

export interface CameraCompositorChunkCacheMiss {
  status: "miss";
  key: string;
  reason: "not-found" | "manifest-invalid" | "size-mismatch" | "checksum-mismatch" | "read-failed";
  error?: string;
}

export type CameraCompositorChunkCacheLookup =
  | CameraCompositorChunkCacheHit
  | CameraCompositorChunkCacheMiss;

function defaultCacheRoot(): string {
  const renderCacheRoot = process.env.TOKOVO_RENDER_CACHE_ROOT ?? path.join(repoRoot, ".remotion");
  return path.join(renderCacheRoot, "camera-compositor-chunks");
}

function cachePaths(cacheRoot: string, key: string) {
  return {
    chunkPath: path.join(cacheRoot, `${key}.mp4`),
    manifestPath: path.join(cacheRoot, `${key}.json`),
  };
}

async function hashFile(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.once("error", reject);
    stream.once("end", resolve);
  });
  return hash.digest("hex");
}

/**
 * Hashes only frame-local, pixel-affecting camera data. The whole-plan
 * signature and plan ID are deliberately excluded so a recut invalidates the
 * changed one-second chunks instead of every chunk in the episode.
 */
export function createCameraCompositorCaptureSignature(
  captures: readonly CameraTextureProjectionCapture[],
): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        captures.map((capture) => ({
          frame: capture.frame,
          stage: capture.stage,
          outputs: capture.outputs.map((output) => ({
            outputId: output.outputId,
            sourceStageNodeId: output.sourceStageNodeId,
            zIndex: output.zIndex,
            viewport: output.viewport,
            viewMatrix: output.viewMatrix,
            opacity: output.opacity,
            clipRadiusPx: output.clipRadiusPx,
            shadow: output.shadow,
            projectionPasses: output.projectionPasses,
          })),
        })),
      ),
    )
    .digest("hex");
}

export function createCameraCompositorChunkCacheKey(
  identity: CameraCompositorChunkIdentity,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: CAMERA_COMPOSITOR_CHUNK_CACHE_VERSION,
        ...identity,
      }),
    )
    .digest("hex");
}

export async function lookupCameraCompositorChunk(
  identity: CameraCompositorChunkIdentity,
  cacheRoot = defaultCacheRoot(),
): Promise<CameraCompositorChunkCacheLookup> {
  const key = createCameraCompositorChunkCacheKey(identity);
  const { chunkPath, manifestPath } = cachePaths(cacheRoot, key);
  try {
    const [manifestText, stat] = await Promise.all([
      fs.readFile(manifestPath, "utf8"),
      fs.stat(chunkPath),
    ]);
    const manifest = JSON.parse(manifestText) as CameraCompositorChunkManifest;
    if (
      manifest.version !== CAMERA_COMPOSITOR_CHUNK_CACHE_VERSION ||
      manifest.key !== key ||
      !manifest.identity ||
      createCameraCompositorChunkCacheKey(manifest.identity) !== key
    ) {
      return { status: "miss", key, reason: "manifest-invalid" };
    }
    if (manifest.sizeBytes !== stat.size || stat.size <= 0) {
      return { status: "miss", key, reason: "size-mismatch" };
    }
    const sha256 = await hashFile(chunkPath);
    if (sha256 !== manifest.sha256) {
      return { status: "miss", key, reason: "checksum-mismatch" };
    }
    return { status: "hit", key, chunkPath, sha256, sizeBytes: stat.size };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { status: "miss", key, reason: "not-found" };
    }
    return {
      status: "miss",
      key,
      reason: "read-failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function storeCameraCompositorChunk(input: {
  identity: CameraCompositorChunkIdentity;
  sourcePath: string;
  cacheRoot?: string;
}): Promise<CameraCompositorChunkCacheHit> {
  const cacheRoot = input.cacheRoot ?? defaultCacheRoot();
  const key = createCameraCompositorChunkCacheKey(input.identity);
  const { chunkPath, manifestPath } = cachePaths(cacheRoot, key);
  await fs.mkdir(cacheRoot, { recursive: true });
  const [stat, sha256] = await Promise.all([fs.stat(input.sourcePath), hashFile(input.sourcePath)]);
  if (stat.size <= 0) {
    throw new Error("CAM_COMPOSITOR_CHUNK_CACHE_EMPTY: Refusing to cache an empty chunk.");
  }

  const nonce = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const temporaryChunkPath = `${chunkPath}.${nonce}.tmp`;
  const temporaryManifestPath = `${manifestPath}.${nonce}.tmp`;
  const manifest: CameraCompositorChunkManifest = {
    version: CAMERA_COMPOSITOR_CHUNK_CACHE_VERSION,
    key,
    identity: input.identity,
    sha256,
    sizeBytes: stat.size,
  };
  try {
    await fs.copyFile(input.sourcePath, temporaryChunkPath);
    await fs.writeFile(temporaryManifestPath, `${JSON.stringify(manifest)}\n`, "utf8");
    await fs.rename(temporaryChunkPath, chunkPath);
    await fs.rename(temporaryManifestPath, manifestPath);
  } finally {
    await Promise.all([
      fs.rm(temporaryChunkPath, { force: true }),
      fs.rm(temporaryManifestPath, { force: true }),
    ]);
  }
  return { status: "hit", key, chunkPath, sha256, sizeBytes: stat.size };
}
