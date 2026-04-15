import { describe, expect, it } from "vitest";
import { EngineConfig } from "../engine/config.js";
import {
  SnapshotCache,
  runWithSnapshot,
} from "../engine/snapshot-cache.js";
import type { WorldState } from "../types.js";
import {
  createLogger,
  LogCollector,
  logAudioCrossfade,
  logAudioDucking,
  logAudioPlay,
  logAudioPolicyDrop,
  logAudioSoundPathFallback,
  logAudioStop,
  logEngineError,
  logEngineEvent,
  logEnginePerf,
  logEngineWarn,
  setLogger,
} from "../logger/index.js";

const baseWorld = {
  devices: {},
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState;

describe("engine runtime utilities", () => {
  it("reads engine config from globals", () => {
    (globalThis as any).__TOKOVO_LOG_EVENTS = true;
    (globalThis as any).__TOKOVO_LOG_PERF = true;
    (globalThis as any).__TOKOVO_LOG_AUDIO = true;

    expect(EngineConfig.logEvents).toBe(true);
    expect(EngineConfig.logPerformance).toBe(true);
    expect(EngineConfig.logAudio).toBe(true);

    delete (globalThis as any).__TOKOVO_LOG_EVENTS;
    delete (globalThis as any).__TOKOVO_LOG_PERF;
    delete (globalThis as any).__TOKOVO_LOG_AUDIO;
  });

  it("logs via the core runtime logger helpers without throwing", () => {
    const collector = new LogCollector();
    const logger = createLogger({ consoleOutput: false });
    logger.addSink(collector);
    setLogger(logger);

    logEngineEvent("APP", "TEST", 1);
    logEnginePerf("step", 2);
    logEngineWarn("warn");
    logEngineError("error");
    logEngineError("error", undefined, { at: 1, kind: "APP", type: "TEST" });

    logAudioPolicyDrop({
      soundId: "a",
      bus: "sfx",
      frame: 0,
      reason: "spam_gate",
      alternateSound: "a_soft",
      replacedBy: "b",
    });
    logAudioSoundPathFallback("sound", "fallback");
    logAudioPlay("sound", "sfx", 1);
    logAudioStop("sound", 2);
    logAudioCrossfade("a", "b", 10, 1);
    logAudioDucking("music", 0.5, "ui", 1);

    expect(collector.peek().length).toBeGreaterThan(0);
  });

  it("manages snapshot cache lifecycle", () => {
    const cache = new SnapshotCache({ interval: 2, maxSnapshots: 2 });
    expect(cache.getStats()).toEqual({ count: 0, oldestFrame: -1, newestFrame: -1 });
    expect(cache.shouldSnapshot(1)).toBe(false);
    expect(cache.shouldSnapshot(2)).toBe(true);

    cache.save(2, baseWorld);
    cache.save(4, baseWorld);
    cache.save(6, baseWorld);
    expect(cache.getStats().count).toBe(2);

    expect(cache.getExact(4)?.frame).toBe(4);
    expect(cache.getExact(999)).toBeNull();
    expect(cache.getClosest(5)?.frame).toBe(4);

    cache.setEnabled(false);
    expect(cache.getClosest(5)).toBeNull();

    cache.setEnabled(true);
    cache.setInterval(0);
    expect(cache.shouldSnapshot(1)).toBe(true);

    const disabled = new SnapshotCache({ enabled: false });
    disabled.save(0, baseWorld);
    expect(disabled.getStats().count).toBe(0);

    const skipInterval = new SnapshotCache({ interval: 5 });
    skipInterval.save(3, baseWorld);
    expect(skipInterval.getExact(3)).toBeNull();
  });

  it("runs with snapshots when cache is provided", () => {
    const cache = new SnapshotCache({ interval: 1 });
    cache.save(0, baseWorld);

    const result = runWithSnapshot(
      1,
      baseWorld,
      (_start, state) => ({ ...state, appState: { ran: true } } as WorldState),
      cache,
    );

    expect((result.appState as any).ran).toBe(true);
  });

  it("runs without snapshots when cache is empty", () => {
    const cache = new SnapshotCache({ interval: 10 });
    const result = runWithSnapshot(
      1,
      baseWorld,
      (_start, state) => ({ ...state, appState: { empty: true } } as WorldState),
      cache,
    );
    expect((result.appState as any).empty).toBe(true);
  });
});
