import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { WorldState } from "../types";
import { DEFAULT_CAMERA_TRANSFORM } from "../types";
import {
  replay,
  replayIncremental,
  createInitialWorld,
  invalidateConfigCache,
  createEventIndex,
  createKeyframedEventIndex,
  createStateCache,
  cacheStateAtKeyframe,
  PluginError,
} from "../engine";
import { EventHandlerRegistry } from "../engine/event-handlers";
import { ReducerRegistry } from "../engine/registry";
import { MiddlewareRegistry } from "../engine/middleware";
import * as handlerModule from "../engine/handlers";
import { logger } from "../logger";

const baseWorld = (): WorldState => ({
  devices: { phone: { id: "phone" } },
  appState: {},
  camera: { baseView: "APP_VIEW", activeEffects: [{ endFrame: 0 }] as any },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState);

beforeEach(() => {
  EventHandlerRegistry.clear();
  ReducerRegistry.reset();
  MiddlewareRegistry.clear();
  logger.configure({ consoleOutput: false, minLevel: "debug", components: [] });
});

afterEach(() => {
  EventHandlerRegistry.clear();
  ReducerRegistry.reset();
  MiddlewareRegistry.clear();
});

describe("engine replay", () => {
  it("handles negative time, empty events, and missing initial state", () => {
    const world = baseWorld();
    const result = replay(world, [], -5);
    expect(result.audio).toBeDefined();

    const empty = replay(undefined as any, [{ at: 0, kind: "APP" } as any], 0);
    expect(empty.devices).toEqual({});
  });

  it("creates defaults when initial state is missing and no events are provided", () => {
    const result = replay(undefined as any, [], 0);
    expect(result.devices).toEqual({});
    expect(result.camera.baseView).toBe("APP_VIEW");
  });

  it("preserves camera baseView and appId when events are empty", () => {
    const world = {
      devices: {},
      appState: {},
      camera: { baseView: "TRANSITION", appId: "app_legacy" } as any,
      audio: undefined,
    } as WorldState;

    const result = replay(world, [], 0);
    expect(result.camera.baseView).toBe("TRANSITION");
    expect(result.camera.appId).toBe("app_legacy");
    expect(result.audio).toBeDefined();
  });

  it("defaults camera baseView when missing", () => {
    const world = {
      devices: {},
      appState: {},
      camera: {} as any,
      audio: undefined,
    } as WorldState;

    const result = replay(world, [], 0);
    expect(result.camera.baseView).toBe("APP_VIEW");
    expect(result.audio).toBeDefined();
  });

  it("preserves camera baseView and appId when events exist", () => {
    const world = {
      devices: { phone: { id: "phone" } },
      appState: {},
      camera: { baseView: "TRANSITION", appId: "app_legacy" } as any,
      audio: undefined,
    } as WorldState;

    const result = replay(world, [{ at: 0, kind: "UNKNOWN" } as any], 0);
    expect(result.camera.baseView).toBe("TRANSITION");
    expect(result.camera.appId).toBe("app_legacy");
    expect(result.audio).toBeDefined();
  });

  it("defaults baseView during replay when missing", () => {
    const world = {
      devices: { phone: { id: "phone" } },
      appState: {},
      camera: {} as any,
      audio: undefined,
    } as WorldState;

    const result = replay(world, [{ at: 0, kind: "UNKNOWN" } as any], 0);
    expect(result.camera.baseView).toBe("APP_VIEW");
  });

  it("processes handlers, reducers, and built-in events", () => {
    const world = baseWorld();

    EventHandlerRegistry.register({
      kind: "CUSTOM",
      handler: (draft) => {
        (draft.appState as any).custom = true;
      },
    });

    ReducerRegistry.registerAppReducer("app", (draft) => {
      (draft.appState as any).app = { handled: true };
    });
    ReducerRegistry.registerEventKinds("app", ["APP_EVENT"]);

    ReducerRegistry.registerDeviceReducer((devices) => ({
      ...devices,
      phone: { ...devices.phone, touched: true },
    }) as any);

    const cameraSpy = vi
      .spyOn(handlerModule, "processCameraEvent")
      .mockImplementation(() => undefined);

    const events = [
      { at: 0, kind: "CUSTOM" },
      { at: 1, kind: "APP", appId: "app" },
      { at: 2, kind: "APP" },
      { at: 3, kind: "APP_EVENT" },
      { at: 4, kind: "CameraZoom", type: "ZOOM" },
      { at: 4, kind: "AnchorFocus", type: "ANCHOR_FOCUS" },
      { at: 4, kind: "AnchorTrack", type: "ANCHOR_TRACK" },
      { at: 5, kind: "DEVICE", type: "LOCK", deviceId: "phone" },
      { at: 6, kind: "UNKNOWN" },
    ] as any[];

    const result = replay(world, events, 10, { mode: "preview" }, createEventIndex(events as any));

    expect((result.appState as any).custom).toBe(true);
    expect((result.appState as any).app).toEqual({ handled: true });
    expect((result.devices as any).phone.touched).toBe(true);
    expect(cameraSpy).toHaveBeenCalled();

    cameraSpy.mockRestore();
  });

  it("wraps non-error throws and uses kind when appId is missing", () => {
    ReducerRegistry.registerAppReducer("app", () => {
      throw "boom";
    });
    ReducerRegistry.registerEventKinds("app", ["CUSTOM"]);

    try {
      replay(baseWorld(), [{ at: 0, kind: "CUSTOM" } as any], 0, {
        mode: "render",
      });
      throw new Error("expected replay to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(PluginError);
      expect((err as PluginError).pluginId).toBe("CUSTOM");
    }

    const errors: any[] = [];
    replay(
      baseWorld(),
      [{ at: 0, kind: "CUSTOM" } as any],
      0,
      { mode: "preview", errors },
    );
    expect(errors[0].error).toBeInstanceOf(Error);
    expect(errors[0].error.message).toBe("boom");
  });

  it("wraps errors as PluginError in render mode", () => {
    ReducerRegistry.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const events = [{ at: 0, kind: "APP", appId: "app" } as any];
    expect(() => replay(baseWorld(), events, 0, { mode: "render" })).toThrow(PluginError);
  });

  it("captures errors in preview mode", () => {
    ReducerRegistry.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const errors: any[] = [];
    const result = replay(
      baseWorld(),
      [{ at: 0, kind: "APP", appId: "app" } as any],
      0,
      { mode: "preview", errors },
    );

    expect(errors).toHaveLength(1);
    expect(result.camera.deviceTransforms).toBeDefined();
  });

  it("creates initial worlds and invalidates config cache", () => {
    const initial = createInitialWorld({ appState: { ok: true } as any });
    expect(initial.appState).toBeDefined();
    invalidateConfigCache();
  });

  it("handles missing built-in handlers gracefully", async () => {
    const builtIn = await import("../engine/built-in-handlers");
    const hasSpy = vi
      .spyOn(builtIn, "hasBuiltInHandler")
      .mockReturnValue(true);
    const getSpy = vi
      .spyOn(builtIn, "getBuiltInHandler")
      .mockReturnValue(undefined);

    const result = replay(
      baseWorld(),
      [{ at: 0, kind: "DEVICE" } as any],
      0,
      { mode: "preview" },
    );
    expect(result).toBeDefined();

    hasSpy.mockRestore();
    getSpy.mockRestore();
  });

  it("falls back to default transform when active device is missing", () => {
    const world = {
      devices: { phone: { id: "phone" } },
      appState: {},
      camera: { baseView: "APP_VIEW", activeDeviceId: "ghost", activeEffects: [] },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;

    const result = replay(world, [{ at: 0, kind: "UNKNOWN" } as any], 0, { mode: "preview" });
    expect(result.camera.transform).toEqual(DEFAULT_CAMERA_TRANSFORM);
  });

  it("falls back to default transform when no devices exist", () => {
    const world = {
      devices: {},
      appState: {},
      camera: { baseView: "APP_VIEW", activeEffects: [] },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;

    const result = replay(world, [{ at: 0, kind: "UNKNOWN" } as any], 0, { mode: "preview" });
    expect(result.camera.transform).toEqual(DEFAULT_CAMERA_TRANSFORM);
  });
});

describe("engine replay incremental", () => {
  it("handles empty events", () => {
    const result = replayIncremental(baseWorld(), [], 0, { mode: "preview" });
    expect(result.camera).toBeDefined();
  });

  it("falls back to full replay when missing index or cache", () => {
    const events = [{ at: 0, kind: "APP" } as any];
    const full = replay(baseWorld(), events, 0, { mode: "preview" });
    const incremental = replayIncremental(baseWorld(), events, 0, { mode: "preview" });

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
      { mode: "preview" },
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

    const result = replayIncremental(
      baseWorld(),
      events,
      1,
      { mode: "preview" },
      index,
      cache,
    );

    expect(result.camera).toBeDefined();
  });

  it("handles negative frames by clamping to zero", () => {
    const events = [{ at: 0, kind: "APP" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    const result = replayIncremental(baseWorld(), events, -1, { mode: "preview" }, index, cache);
    expect(result.camera).toBeDefined();
  });

  it("wraps non-error throws during incremental replay", () => {
    ReducerRegistry.registerAppReducer("app", () => {
      throw "boom";
    });
    ReducerRegistry.registerEventKinds("app", ["CUSTOM"]);

    const events = [{ at: 0, kind: "CUSTOM" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const errors: any[] = [];

    const previewCache = createStateCache(2);
    replayIncremental(baseWorld(), events, 0, { mode: "preview", errors }, index, previewCache);
    expect(errors[0].error).toBeInstanceOf(Error);
    expect(errors[0].error.message).toBe("boom");

    try {
      const renderCache = createStateCache(2);
      replayIncremental(baseWorld(), events, 0, { mode: "render" }, index, renderCache);
      throw new Error("expected replayIncremental to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(PluginError);
      expect((err as PluginError).pluginId).toBe("CUSTOM");
    }
  });

  it("falls back to default camera transforms in incremental replay", () => {
    const events = [{ at: 0, kind: "UNKNOWN" } as any];
    const index = createKeyframedEventIndex(events, 2);

    const worldNoDevices = {
      devices: {},
      appState: {},
      camera: { baseView: "APP_VIEW", activeEffects: [] },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;
    const resultNoDevices = replayIncremental(
      worldNoDevices,
      events,
      0,
      { mode: "preview" },
      index,
      createStateCache(2),
    );
    expect(resultNoDevices.camera.transform).toEqual(DEFAULT_CAMERA_TRANSFORM);

    const worldGhost = {
      devices: { phone: { id: "phone" } },
      appState: {},
      camera: { baseView: "APP_VIEW", activeDeviceId: "ghost", activeEffects: [] },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;
    const resultGhost = replayIncremental(
      worldGhost,
      events,
      0,
      { mode: "preview" },
      index,
      createStateCache(2),
    );
    expect(resultGhost.camera.transform).toEqual(DEFAULT_CAMERA_TRANSFORM);
  });

  it("tracks skipped events on errors", () => {
    ReducerRegistry.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const events = [{ at: 0, kind: "APP", appId: "app" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    const ctx = { mode: "preview" as const, errors: [], stats: { totalEvents: 1, processedEvents: 0, skippedEvents: 0 } };

    replayIncremental(baseWorld(), events, 0, ctx, index, cache);
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.stats.skippedEvents).toBe(1);
  });

  it("throws plugin errors in render mode", () => {
    ReducerRegistry.registerAppReducer("app", () => {
      throw new Error("boom");
    });

    const events = [{ at: 0, kind: "APP", appId: "app" } as any];
    const index = createKeyframedEventIndex(events, 2);
    const cache = createStateCache(2);
    expect(() =>
      replayIncremental(baseWorld(), events, 0, { mode: "render" }, index, cache),
    ).toThrow(PluginError);
  });
});
