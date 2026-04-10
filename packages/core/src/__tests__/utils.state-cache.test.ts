import { describe, expect, it } from "vitest";
import type { WorldState } from "../types.js";
import {
  createStateCache,
  cacheStateAtKeyframe,
  getCachedStateForFrame,
  invalidateCacheAfter,
  clearStateCache,
  ensureStateCacheIdentity,
} from "../utils/state-cache.js";

const baseState = {
  devices: {},
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState;

describe("state cache", () => {
  it("caches keyframes and retrieves by frame", () => {
    const cache = createStateCache(2);

    cacheStateAtKeyframe(cache, 2, baseState);
    cacheStateAtKeyframe(cache, 3, { ...baseState });

    expect(cache.sortedFrames).toEqual([2]);

    const exact = getCachedStateForFrame(cache, 3);
    expect(exact?.fromFrame).toBe(3);

    const nearest = getCachedStateForFrame(cache, 5);
    expect(nearest?.fromFrame).toBe(3);
  });

  it("invalidates and clears cached frames", () => {
    const cache = createStateCache(2);
    cacheStateAtKeyframe(cache, 2, baseState);
    cacheStateAtKeyframe(cache, 4, baseState);

    invalidateCacheAfter(cache, 2);
    expect(cache.sortedFrames).toEqual([2]);

    const missing = getCachedStateForFrame(cache, 1);
    expect(missing).toBeNull();

    clearStateCache(cache);
    expect(cache.sortedFrames).toEqual([]);
  });

  it("inserts keyframes out of order", () => {
    const cache = createStateCache(1);
    cacheStateAtKeyframe(cache, 5, baseState);
    cacheStateAtKeyframe(cache, 3, baseState);
    expect(cache.sortedFrames).toEqual([3, 5]);
  });

  it("clears cache when identity changes", () => {
    const cache = createStateCache(1, { episodeId: "a", eventSignature: "x" });
    cacheStateAtKeyframe(cache, 1, baseState);
    expect(cache.sortedFrames).toEqual([1]);

    ensureStateCacheIdentity(cache, { episodeId: "b", eventSignature: "y" });
    expect(cache.sortedFrames).toEqual([]);
    expect(cache.episodeId).toBe("b");
  });
});
