import type { WorldState, TimelineEvent } from "../types";
import type { KeyframedEventIndex } from "./event-utils";
import { produce } from "immer";

export interface StateCache {
  keyframeStates: Map<number, WorldState>;
  keyframeInterval: number;
  lastComputedFrame: number;
  lastState: WorldState | null;
}

export function createStateCache(keyframeInterval = 300): StateCache {
  return {
    keyframeStates: new Map(),
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

  const sortedFrames = Array.from(cache.keyframeStates.keys()).sort(
    (a, b) => b - a,
  );
  for (const frame of sortedFrames) {
    if (frame < t) {
      const state = cache.keyframeStates.get(frame);
      if (state) {
        return { state, fromFrame: frame };
      }
    }
  }

  return null;
}

export function cacheStateAtKeyframe(
  cache: StateCache,
  frame: number,
  state: WorldState,
): void {
  if (frame % cache.keyframeInterval === 0) {
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
  if (cache.lastComputedFrame > frame) {
    cache.lastComputedFrame = -1;
    cache.lastState = null;
  }
}

export function clearStateCache(cache: StateCache): void {
  cache.keyframeStates.clear();
  cache.lastComputedFrame = -1;
  cache.lastState = null;
}
