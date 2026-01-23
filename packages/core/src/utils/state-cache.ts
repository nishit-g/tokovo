import type { WorldState } from "../types";

export interface StateCache {
  keyframeStates: Map<number, WorldState>;
  sortedFrames: number[];
  keyframeInterval: number;
  lastComputedFrame: number;
  lastState: WorldState | null;
}

export function createStateCache(keyframeInterval = 300): StateCache {
  return {
    keyframeStates: new Map(),
    sortedFrames: [],
    keyframeInterval,
    lastComputedFrame: -1,
    lastState: null,
  };
}

export function getCachedStateForFrame(
  cache: StateCache,
  t: number,
): { state: WorldState; fromFrame: number } | null {
  if (cache.lastComputedFrame === t && cache.lastState) {
    return { state: cache.lastState, fromFrame: t };
  }

  const nearestKeyframe =
    Math.floor(t / cache.keyframeInterval) * cache.keyframeInterval;
  const cached = cache.keyframeStates.get(nearestKeyframe);

  if (cached) {
    return { state: cached, fromFrame: nearestKeyframe };
  }

  for (let i = cache.sortedFrames.length - 1; i >= 0; i--) {
    const frame = cache.sortedFrames[i];
    if (frame < t) {
      const state = cache.keyframeStates.get(frame);
      if (state) {
        return { state, fromFrame: frame };
      }
    }
  }

  return null;
}

function insertSorted(arr: number[], value: number): void {
  let low = 0;
  let high = arr.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (arr[mid] < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  if (arr[low] !== value) {
    arr.splice(low, 0, value);
  }
}

export function cacheStateAtKeyframe(
  cache: StateCache,
  frame: number,
  state: WorldState,
): void {
  if (frame % cache.keyframeInterval === 0) {
    if (!cache.keyframeStates.has(frame)) {
      insertSorted(cache.sortedFrames, frame);
    }
    cache.keyframeStates.set(frame, state);
  }
  cache.lastComputedFrame = frame;
  cache.lastState = state;
}

export function invalidateCacheAfter(cache: StateCache, frame: number): void {
  for (const cachedFrame of cache.keyframeStates.keys()) {
    if (cachedFrame > frame) {
      cache.keyframeStates.delete(cachedFrame);
    }
  }
  cache.sortedFrames = cache.sortedFrames.filter((f) => f <= frame);
  if (cache.lastComputedFrame > frame) {
    cache.lastComputedFrame = -1;
    cache.lastState = null;
  }
}

export function clearStateCache(cache: StateCache): void {
  cache.keyframeStates.clear();
  cache.sortedFrames = [];
  cache.lastComputedFrame = -1;
  cache.lastState = null;
}
