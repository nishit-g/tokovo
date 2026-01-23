import type { WorldState } from "../types";

export interface StateSnapshot {
  frame: number;
  state: WorldState;
  timestamp: number;
}

export interface SnapshotCacheConfig {
  interval: number;
  maxSnapshots: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: SnapshotCacheConfig = {
  interval: 30,
  maxSnapshots: 100,
  enabled: true,
};

export class SnapshotCache {
  private snapshots: Map<number, StateSnapshot> = new Map();
  private config: SnapshotCacheConfig;
  private frameToSnapshotKey: Map<number, number> = new Map();

  constructor(config: Partial<SnapshotCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  shouldSnapshot(frame: number): boolean {
    return this.config.enabled && frame % this.config.interval === 0;
  }

  save(frame: number, state: WorldState): void {
    if (!this.config.enabled) return;
    if (frame % this.config.interval !== 0) return;

    if (this.snapshots.size >= this.config.maxSnapshots) {
      const oldestKey = this.snapshots.keys().next().value;
      if (oldestKey !== undefined) {
        this.snapshots.delete(oldestKey);
      }
    }

    const snapshot: StateSnapshot = {
      frame,
      state: structuredClone(state),
      timestamp: Date.now(),
    };

    this.snapshots.set(frame, snapshot);
    this.frameToSnapshotKey.set(frame, frame);
  }

  getClosest(targetFrame: number): StateSnapshot | null {
    if (!this.config.enabled) return null;
    if (this.snapshots.size === 0) return null;

    const snapshotFrame =
      Math.floor(targetFrame / this.config.interval) * this.config.interval;

    let closest: StateSnapshot | null = null;
    let closestFrame = -1;

    for (const [frame, snapshot] of this.snapshots) {
      if (frame <= targetFrame && frame > closestFrame) {
        closest = snapshot;
        closestFrame = frame;
      }
    }

    return closest;
  }

  getExact(frame: number): StateSnapshot | null {
    return this.snapshots.get(frame) || null;
  }

  clear(): void {
    this.snapshots.clear();
    this.frameToSnapshotKey.clear();
  }

  getStats(): { count: number; oldestFrame: number; newestFrame: number } {
    if (this.snapshots.size === 0) {
      return { count: 0, oldestFrame: -1, newestFrame: -1 };
    }

    const frames = Array.from(this.snapshots.keys()).sort((a, b) => a - b);
    return {
      count: frames.length,
      oldestFrame: frames[0],
      newestFrame: frames[frames.length - 1],
    };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  setInterval(interval: number): void {
    this.config.interval = Math.max(1, interval);
  }
}

let globalSnapshotCache: SnapshotCache | null = null;

export function getSnapshotCache(
  config?: Partial<SnapshotCacheConfig>,
): SnapshotCache {
  if (!globalSnapshotCache) {
    globalSnapshotCache = new SnapshotCache(config);
  }
  return globalSnapshotCache;
}

export function resetSnapshotCache(): void {
  if (globalSnapshotCache) {
    globalSnapshotCache.clear();
  }
  globalSnapshotCache = null;
}

export function runWithSnapshot(
  targetFrame: number,
  initialWorld: WorldState,
  applyEventsFromFrame: (startFrame: number, state: WorldState) => WorldState,
  cache: SnapshotCache = getSnapshotCache(),
): WorldState {
  const snapshot = cache.getClosest(targetFrame);

  let startFrame: number;
  let startState: WorldState;

  if (snapshot && snapshot.frame <= targetFrame) {
    startFrame = snapshot.frame;
    startState = structuredClone(snapshot.state);
  } else {
    startFrame = 0;
    startState = structuredClone(initialWorld);
  }

  const resultState = applyEventsFromFrame(startFrame, startState);

  if (cache.shouldSnapshot(targetFrame)) {
    cache.save(targetFrame, resultState);
  }

  return resultState;
}
