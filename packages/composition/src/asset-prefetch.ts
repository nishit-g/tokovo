import type { EpisodeAssetRef } from "@tokovo/core";
import { resolveStaticAssetSrc } from "@tokovo/core";
import { useEffect, useMemo, useRef } from "react";
import { prefetch, staticFile } from "remotion";

const PREFETCH_LOOKAHEAD_SECONDS = 6;
const PREFETCH_RETENTION_SECONDS = 10;
const MAX_PREFETCHED_ASSETS = 48;

function normalizePreviewAssetUrl(src: string): string | null {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return null;
  return resolveStaticAssetSrc(src, staticFile);
}

function isPrefetchableAsset(ref: EpisodeAssetRef): boolean {
  return (
    ref.strategy !== "none" &&
    (ref.kind === "image" ||
      ref.kind === "video" ||
      ref.kind === "audio" ||
      ref.kind === "gif")
  );
}

function getPrefetchBucket(
  ref: EpisodeAssetRef,
  frame: number,
  lookaheadFrames: number,
  retentionFrames: number,
): number {
  if (ref.strategy === "eager") return 0;
  const fromFrame = ref.fromFrame ?? 0;
  if (ref.toFrame !== undefined) {
    if (
      fromFrame <= frame + lookaheadFrames &&
      ref.toFrame >= frame - retentionFrames
    ) {
      return fromFrame <= frame ? 1 : 2;
    }
    return 3;
  }
  if (fromFrame > frame + lookaheadFrames) return 3;
  if (fromFrame >= frame - retentionFrames) {
    return fromFrame <= frame ? 1 : 2;
  }
  return 3;
}

function getFrameDistance(ref: EpisodeAssetRef, frame: number): number {
  const fromFrame = ref.fromFrame ?? 0;
  if (ref.toFrame !== undefined && frame > ref.toFrame) {
    return frame - ref.toFrame;
  }
  if (frame < fromFrame) return fromFrame - frame;
  return Math.max(0, frame - fromFrame);
}

export function selectAssetsForPrefetch(
  assetRefs: readonly EpisodeAssetRef[],
  frame: number,
  fps: number,
): EpisodeAssetRef[] {
  const lookaheadFrames = Math.max(fps * PREFETCH_LOOKAHEAD_SECONDS, fps * 2);
  const retentionFrames = Math.max(fps * PREFETCH_RETENTION_SECONDS, fps * 4);
  return assetRefs
    .filter(isPrefetchableAsset)
    .map((ref) => ({
      ref,
      bucket: getPrefetchBucket(
        ref,
        frame,
        lookaheadFrames,
        retentionFrames,
      ),
    }))
    .filter((entry) => entry.bucket < 3)
    .sort((left, right) => {
      if (left.bucket !== right.bucket) return left.bucket - right.bucket;
      if (left.ref.priority !== right.ref.priority) {
        return right.ref.priority - left.ref.priority;
      }
      const distanceDelta =
        getFrameDistance(left.ref, frame) -
        getFrameDistance(right.ref, frame);
      if (distanceDelta !== 0) return distanceDelta;
      if (left.ref.fromFrame !== right.ref.fromFrame) {
        return (left.ref.fromFrame ?? 0) - (right.ref.fromFrame ?? 0);
      }
      return left.ref.src.localeCompare(right.ref.src);
    })
    .slice(0, MAX_PREFETCHED_ASSETS)
    .map((entry) => entry.ref);
}

export function useEpisodeAssetPrefetch(input: {
  assetRefs: readonly EpisodeAssetRef[];
  frame: number;
  fps: number;
  disabled?: boolean;
}): void {
  const handlesRef = useRef<Map<string, ReturnType<typeof prefetch>>>(new Map());
  const desiredRefs = useMemo(
    () =>
      input.disabled
        ? []
        : selectAssetsForPrefetch(input.assetRefs, input.frame, input.fps),
    [input.assetRefs, input.disabled, input.fps, input.frame],
  );

  useEffect(() => {
    if (input.disabled) return;
    const handles = handlesRef.current;
    const desiredIds = new Set<string>();
    for (const ref of desiredRefs) {
      desiredIds.add(ref.id);
      if (handles.has(ref.id)) continue;
      const normalizedUrl = normalizePreviewAssetUrl(ref.src);
      if (!normalizedUrl) continue;
      handles.set(
        ref.id,
        prefetch(normalizedUrl, {
          method: "blob-url",
          logLevel: "error",
        }),
      );
    }
    for (const [id, handle] of handles) {
      if (desiredIds.has(id)) continue;
      handle.free();
      handles.delete(id);
    }
  }, [desiredRefs, input.disabled]);

  useEffect(
    () => () => {
      for (const handle of handlesRef.current.values()) handle.free();
      handlesRef.current.clear();
    },
    [],
  );
}
