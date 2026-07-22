import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { WorldState } from "../types.js";
import {
  replayIncremental,
  createInitialWorld,
  createEventIndex,
  createKeyframedEventIndex,
  createStateCache,
  cacheStateAtKeyframe,
  PluginError,
} from "../engine.js";
import { createEngineRegistries, type EngineRegistries } from "../engine/registries.js";
import { getLogger } from "../logger/index.js";
import { createConfig } from "../config/index.js";

const baseWorld = (): WorldState =>
  ({
    devices: { phone: { id: "phone" } },
    appInstances: { "phone:app": {} },
    capabilityState: {},
    audio: {
      activeSounds: {},
      buses: {},
      policyState: { recentSounds: {}, nextId: 0 },
      autoSoundRules: [],
    },
  }) as WorldState;

let registries: EngineRegistries;
const previewCtx = () => ({
  mode: "preview" as const,
  registries,
  config: createConfig(),
});
const renderCtx = () => ({
  mode: "render" as const,
  registries,
  config: createConfig(),
});

beforeEach(() => {
  registries = createEngineRegistries();
  getLogger().configure({
    consoleOutput: false,
    minLevel: "debug",
    components: [],
  });
});

afterEach(() => {
  registries.eventHandlers.clear();
  registries.reducers.reset();
  registries.middleware.clear();
  registries.lifecycle.destroyAll();
});

describe("engine replay", () => {
  it("clamps negative time and rejects a missing initial world", () => {
    const world = baseWorld();
    const result = replayIncremental(world, [], -5, previewCtx());
    expect(result.audio).toBeDefined();

    expect(() =>
      replayIncremental(undefined as any, [], 0, previewCtx()),
    ).toThrowError("WORLD_STATE_REQUIRED");
  });

  it("processes handlers, reducers, and built-in events", () => {
    const world = baseWorld();

    registries.eventHandlers.register({
      kind: "CUSTOM",
      handler: (draft) => {
        draft.capabilityState.custom = true;
      },
    });

    registries.reducers.registerAppReducer("app", (draft, event) => {
      if (event.kind !== "APP") throw new Error("expected APP event");
      draft.appInstances[`${event.deviceId}:app`] = { handled: true };
    });
    registries.reducers.registerEventKinds("app", ["APP_EVENT"]);

    registries.reducers.registerDeviceReducer(
      (devices) =>
        ({
          ...devices,
          phone: { ...devices.phone, touched: true },
        }) as any,
    );

    const events = [
      { at: 0, kind: "CUSTOM" },
      { at: 1, kind: "APP", appId: "app", deviceId: "phone" },
      { at: 2, kind: "APP" },
      { at: 3, kind: "APP_EVENT", deviceId: "phone" },
      { at: 5, kind: "DEVICE", type: "LOCK", deviceId: "phone" },
      { at: 6, kind: "UNKNOWN" },
    ] as any[];

    const result = replayIncremental(
      world,
      events,
      10,
      previewCtx(),
      createEventIndex(events as any),
    );

    expect(result.capabilityState.custom).toBe(true);
    expect(result.appInstances["phone:app"]).toEqual({ handled: true });
    expect((result.devices as any).phone.touched).toBe(true);
  });

  it("wraps non-error throws and uses kind when appId is missing", () => {
    registries.reducers.registerAppReducer("app", () => {
      throw "boom";
    });
    registries.reducers.registerEventKinds("app", ["CUSTOM"]);

    const renderIndex = createKeyframedEventIndex(
      [{ at: 0, kind: "CUSTOM", deviceId: "phone" } as any],
      1,
    );
    const renderCache = createStateCache(1);
    expect(() =>
      replayIncremental(
        baseWorld(),
        [{ at: 0, kind: "CUSTOM", deviceId: "phone" } as any],
        0,
        renderCtx(),
        renderIndex,
        renderCache,
      ),
    ).toThrow(PluginError);

    const errors: any[] = [];
    replayIncremental(baseWorld(), [{ at: 0, kind: "CUSTOM", deviceId: "phone" } as any], 0, {
      ...previewCtx(),
      errors,
    });
    expect(errors[0].error).toBeInstanceOf(Error);
    expect(errors[0].error.message).toBe("boom");
  });

  it("wraps errors as PluginError in render mode", () => {
    registries.reducers.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const events = [{ at: 0, kind: "APP", appId: "app", deviceId: "phone" } as any];
    const index = createKeyframedEventIndex(events as any, 1);
    const cache = createStateCache(1);
    expect(() => replayIncremental(baseWorld(), events, 0, renderCtx(), index, cache)).toThrow(
      PluginError,
    );
  });

  it("captures errors in preview mode", () => {
    registries.reducers.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const errors: any[] = [];
    const result = replayIncremental(
      baseWorld(),
      [{ at: 0, kind: "APP", appId: "app", deviceId: "phone" } as any],
      0,
      { ...previewCtx(), errors },
    );

    expect(errors).toHaveLength(1);
    expect(result.devices).toBeDefined();
  });

  it("creates initial worlds", () => {
    const initial = createInitialWorld({
      appInstances: { "phone:app": { ok: true } },
    });
    expect(initial.appInstances["phone:app"]).toEqual({ ok: true });
  });

  it("handles missing built-in handlers gracefully", async () => {
    const builtIn = await import("../engine/built-in-handlers");
    const hasSpy = vi.spyOn(builtIn, "hasBuiltInHandler").mockReturnValue(true);
    const getSpy = vi.spyOn(builtIn, "getBuiltInHandler").mockReturnValue(undefined);

    const result = replayIncremental(
      baseWorld(),
      [{ at: 0, kind: "DEVICE" } as any],
      0,
      previewCtx(),
    );
    expect(result).toBeDefined();

    hasSpy.mockRestore();
    getSpy.mockRestore();
  });
});

describe("engine replay incremental", () => {
  it("handles empty events", () => {
    const result = replayIncremental(baseWorld(), [], 0, previewCtx());
    expect(result.audio).toBeDefined();
  });

  it("uses the uncached preview path when missing index or cache", () => {
    const events = [{ at: 0, kind: "APP" } as any];
    const full = replayIncremental(baseWorld(), events, 0, previewCtx());
    const incremental = replayIncremental(baseWorld(), events, 0, previewCtx());

    expect(incremental).toEqual(full);
  });

  it("uses cached state when available", () => {
    const cache = createStateCache(2);
    const cachedState = baseWorld();
    cache.lastComputedFrame = 2;
    cache.lastState = cachedState;

    const result = replayIncremental(
      baseWorld(),
      [{ at: 2, kind: "APP", appId: "app" } as any],
      2,
      previewCtx(),
      createKeyframedEventIndex([{ at: 2, kind: "APP", appId: "app" } as any], 2),
      cache,
    );

    expect(result).toBe(cachedState);
  });

  it("reuses keyframes and handles empty ranges", () => {
    const events = [{ at: 0, kind: "APP" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    const cachedState = baseWorld();
    cacheStateAtKeyframe(cache, 0, cachedState);

    const result = replayIncremental(baseWorld(), events, 1, previewCtx(), index, cache);

    expect(result.appInstances).toBeDefined();
  });

  it("handles negative frames by clamping to zero", () => {
    const events = [{ at: 0, kind: "APP" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    const result = replayIncremental(baseWorld(), events, -1, previewCtx(), index, cache);
    expect(result.audio).toBeDefined();
  });

  it("wraps non-error throws during incremental replay", () => {
    registries.reducers.registerAppReducer("app", () => {
      throw "boom";
    });
    registries.reducers.registerEventKinds("app", ["CUSTOM"]);

    const events = [{ at: 0, kind: "CUSTOM", deviceId: "phone" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const errors: any[] = [];

    const previewCache = createStateCache(2);
    replayIncremental(baseWorld(), events, 0, { ...previewCtx(), errors }, index, previewCache);
    expect(errors[0].error).toBeInstanceOf(Error);
    expect(errors[0].error.message).toBe("boom");

    try {
      const renderCache = createStateCache(2);
      replayIncremental(baseWorld(), events, 0, renderCtx(), index, renderCache);
      throw new Error("expected replayIncremental to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(PluginError);
      expect((err as PluginError).pluginId).toBe("CUSTOM");
    }
  });

  it("tracks skipped events on errors", () => {
    registries.reducers.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const events = [{ at: 0, kind: "APP", appId: "app" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    const ctx = {
      ...previewCtx(),
      errors: [],
      stats: { totalEvents: 1, processedEvents: 0, skippedEvents: 0 },
    };

    replayIncremental(baseWorld(), events, 0, ctx, index, cache);
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.stats.skippedEvents).toBe(1);
  });

  it("throws plugin errors in render mode", () => {
    registries.reducers.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const events = [{ at: 0, kind: "APP", appId: "app" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    expect(() => replayIncremental(baseWorld(), events, 0, renderCtx(), index, cache)).toThrow(
      PluginError,
    );
  });
});
