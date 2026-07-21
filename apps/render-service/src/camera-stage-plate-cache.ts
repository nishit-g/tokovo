import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { repoRoot } from "./constants";

const CAMERA_STAGE_PLATE_CACHE_VERSION = 1;
const DEFAULT_CACHE_ROOT = path.join(repoRoot, ".remotion", "camera-stage-plates");

export interface CameraStagePlateIdentity {
  episodeId: string;
  stagePainterSignature: string;
  storySignature: string;
  stageSignature: string;
  frameRange: readonly [number, number];
  fps: number;
  width: number;
  height: number;
}

interface CameraStagePlateManifest {
  version: typeof CAMERA_STAGE_PLATE_CACHE_VERSION;
  key: string;
  identity: CameraStagePlateIdentity;
  sha256: string;
  sizeBytes: number;
}

export interface CameraStagePlateCacheHit {
  status: "hit";
  key: string;
  platePath: string;
  sha256: string;
  sizeBytes: number;
}

export interface CameraStagePlateCacheMiss {
  status: "miss";
  key: string;
  reason: "not-found" | "manifest-invalid" | "size-mismatch" | "checksum-mismatch" | "read-failed";
  error?: string;
}

export type CameraStagePlateCacheLookup = CameraStagePlateCacheHit | CameraStagePlateCacheMiss;

function cachePaths(cacheRoot: string, key: string) {
  return {
    platePath: path.join(cacheRoot, `${key}.mov`),
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

export function createCameraStagePlateCacheKey(identity: CameraStagePlateIdentity): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: CAMERA_STAGE_PLATE_CACHE_VERSION,
        episodeId: identity.episodeId,
        stagePainterSignature: identity.stagePainterSignature,
        storySignature: identity.storySignature,
        stageSignature: identity.stageSignature,
        frameRange: identity.frameRange,
        fps: identity.fps,
        width: identity.width,
        height: identity.height,
        imageFormat: "png",
        codec: "prores-4444-yuva444p10le",
      }),
    )
    .digest("hex");
}

export async function lookupCameraStagePlate(
  identity: CameraStagePlateIdentity,
  cacheRoot = DEFAULT_CACHE_ROOT,
): Promise<CameraStagePlateCacheLookup> {
  const key = createCameraStagePlateCacheKey(identity);
  const { platePath, manifestPath } = cachePaths(cacheRoot, key);
  try {
    const [manifestText, stat] = await Promise.all([
      fs.readFile(manifestPath, "utf8"),
      fs.stat(platePath),
    ]);
    const manifest = JSON.parse(manifestText) as CameraStagePlateManifest;
    if (
      manifest.version !== CAMERA_STAGE_PLATE_CACHE_VERSION ||
      manifest.key !== key ||
      !manifest.identity ||
      createCameraStagePlateCacheKey(manifest.identity) !== key
    ) {
      return { status: "miss", key, reason: "manifest-invalid" };
    }
    if (manifest.sizeBytes !== stat.size || stat.size <= 0) {
      return { status: "miss", key, reason: "size-mismatch" };
    }
    const sha256 = await hashFile(platePath);
    if (sha256 !== manifest.sha256) {
      return { status: "miss", key, reason: "checksum-mismatch" };
    }
    return { status: "hit", key, platePath, sha256, sizeBytes: stat.size };
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

export async function storeCameraStagePlate(input: {
  identity: CameraStagePlateIdentity;
  sourcePath: string;
  cacheRoot?: string;
}): Promise<CameraStagePlateCacheHit> {
  const cacheRoot = input.cacheRoot ?? DEFAULT_CACHE_ROOT;
  const key = createCameraStagePlateCacheKey(input.identity);
  const { platePath, manifestPath } = cachePaths(cacheRoot, key);
  await fs.mkdir(cacheRoot, { recursive: true });
  const [stat, sha256] = await Promise.all([fs.stat(input.sourcePath), hashFile(input.sourcePath)]);
  if (stat.size <= 0) {
    throw new Error("CAM_STAGE_PLATE_CACHE_EMPTY: Refusing to cache an empty stage plate.");
  }

  const nonce = `${process.pid}-${Date.now()}`;
  const temporaryPlatePath = `${platePath}.${nonce}.tmp`;
  const temporaryManifestPath = `${manifestPath}.${nonce}.tmp`;
  const manifest: CameraStagePlateManifest = {
    version: CAMERA_STAGE_PLATE_CACHE_VERSION,
    key,
    identity: input.identity,
    sha256,
    sizeBytes: stat.size,
  };
  try {
    await fs.copyFile(input.sourcePath, temporaryPlatePath);
    await fs.writeFile(temporaryManifestPath, `${JSON.stringify(manifest)}\n`, "utf8");
    await fs.rename(temporaryPlatePath, platePath);
    await fs.rename(temporaryManifestPath, manifestPath);
  } finally {
    await Promise.all([
      fs.rm(temporaryPlatePath, { force: true }),
      fs.rm(temporaryManifestPath, { force: true }),
    ]);
  }
  return { status: "hit", key, platePath, sha256, sizeBytes: stat.size };
}
