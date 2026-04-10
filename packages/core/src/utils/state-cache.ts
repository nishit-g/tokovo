import type { WorldState, TimelineEvent } from "../types.js";

export interface StateCache {
  keyframeStates: Map<number, WorldState>;
  sortedFrames: number[];
  keyframeInterval: number;
  lastComputedFrame: number;
  lastState: WorldState | null;
  episodeId?: string;
  eventSignature?: string;
}

export interface StateCacheIdentity {
  episodeId?: string;
  eventSignature?: string;
}

export function createStateCache(
  keyframeInterval = 300,
  identity: StateCacheIdentity = {},
): StateCache {
  return {
    keyframeStates: new Map(),
    sortedFrames: [],
    keyframeInterval,
    lastComputedFrame: -1,
    lastState: null,
    episodeId: identity.episodeId,
    eventSignature: identity.eventSignature,
  };
}

export function computeEventSignature(events: TimelineEvent[]): string {
  let hash = 0;
  for (const event of events) {
    hash = hashNumber(hash, event.at);
    hash = hashString(hash, String(event.kind));
    const type = (event as { type?: string }).type;
    if (type) {
      hash = hashString(hash, type);
    }
  }
  return `${events.length}:${(hash >>> 0).toString(16)}`;
}

function hashNumber(seed: number, value: number): number {
  const n = value | 0;
  return ((seed << 5) - seed + n) | 0;
}

function hashString(seed: number, value: string): number {
  let hash = seed | 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return hash;
}

export function setStateCacheIdentity(
  cache: StateCache,
  identity: StateCacheIdentity,
): void {
  cache.episodeId = identity.episodeId;
  cache.eventSignature = identity.eventSignature;
}

export function ensureStateCacheIdentity(
  cache: StateCache,
  identity: StateCacheIdentity,
): void {
  if (
    cache.episodeId !== identity.episodeId ||
    cache.eventSignature !== identity.eventSignature
  ) {
    clearStateCache(cache);
    setStateCacheIdentity(cache, identity);
  }
}

export function getCachedStateForFrame(
  cache: StateCache,
  t: number,
): { state: WorldState; fromFrame: number } | null {
  if (cache.lastComputedFrame === t && cache.lastState) {
    return { state: cache.lastState, fromFrame: t };
  }

  if (
    cache.lastState &&
    cache.lastComputedFrame >= 0 &&
    cache.lastComputedFrame < t
  ) {
    return {
      state: cache.lastState,
      fromFrame: cache.lastComputedFrame,
    };
  }

  const nearestKeyframe =
    Math.floor(t / cache.keyframeInterval) * cache.keyframeInterval;
  const cached = cache.keyframeStates.get(nearestKeyframe);

  if (cached) {
    return { state: cached, fromFrame: nearestKeyframe };
  }

  let low = 0;
  let high = cache.sortedFrames.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (cache.sortedFrames[mid] < t) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  for (let i = low - 1; i >= 0; i--) {
    const frame = cache.sortedFrames[i];
    const state = cache.keyframeStates.get(frame);
    if (state) {
      return { state, fromFrame: frame };
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
