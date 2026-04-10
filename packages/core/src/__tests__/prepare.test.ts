import { describe, expect, it, vi } from "vitest";
import type { TokovoPluginContract } from "../types/plugin-contract.js";
import type { CompiledEpisode } from "../types/compiled-episode.js";
import { prepareTestUtils } from "../testing.js";
import { createEngineRegistries } from "../engine/registries.js";
import { createConfig } from "../config/index.js";

const baseInput = {
  episodeId: "ep1",
  fps: 30,
  durationInFrames: 120,
  devices: [
    {
      deviceId: "phone",
      appId: "app",
    },
  ],
};

describe("prepare episode", () => {
  it("throws when compiler is not set", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    expect(() => mod.prepareEpisode(baseInput as any)).toThrow(
      /@tokovo\/compiler not available/i,
    );
  });

  it("builds compiled episodes, sorts events, and collects assets", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");

    mod.setCompiler(() => ({
      timeline: {
        ops: [
          { at: 5, kind: "AUDIO", type: "PLAY_SOUND" },
          { at: 1, kind: "DEVICE", deviceId: "phone", type: "LOCK" },
          { at: 1, kind: "APP", appId: "app", type: "EVENT" },
        ],
      },
    }));

    const plugin: TokovoPluginContract = {
      id: "app",
      displayName: "App",
      version: "1.0.0",
      views: { AppRoot: () => null },
      assets: {
        sounds: { ding: "/sounds/ding.mp3" },
        icons: { app: "/icons/app.png" },
        images: { hero: "/images/hero.png" },
      },
      createInitialState: () => ({ ready: true }),
    } as TokovoPluginContract;

    const compiled = mod.prepareEpisode(baseInput as any, [plugin], { strict: false });
    expect(compiled.id).toBe("ep1");
    expect(compiled.events[0].at).toBe(1);
    expect(compiled.events[0].kind).toBe("DEVICE");
    expect(compiled.assets.sounds["app.ding"]).toBe("/sounds/ding.mp3");
    expect(compiled.assets.icons["app.app"]).toBe("/icons/app.png");
    expect(compiled.assets.images["app.hero"]).toBe("/images/hero.png");
    expect(compiled.debug).toBeDefined();

    expect(compiled.initialWorld.camera.activeDeviceId).toBe("phone");
    const deviceAppState = (compiled.initialWorld.appState as any).phone;
    expect(deviceAppState.app).toEqual({ ready: true });
  });

  it("skips debug info when includeDebug is false", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({ timeline: { ops: [] } }));

    const compiled = mod.prepareEpisode(baseInput as any, [], {
      includeDebug: false,
    });
    expect(compiled.debug).toBeUndefined();
  });

  it("derives initial worlds and sorts unknown event kinds", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");

    const registry = { plugins: [], byId: new Map() } as any;
    const world = mod.deriveInitialWorld(
      {
        id: "scene",
        devices: [
          {
            id: "phone",
            appId: "app",
          },
          {
            id: "tablet",
          },
          {
            id: "watch",
            appId: "app2",
          },
        ],
      } as any,
      registry,
    );

    expect(world.devices.tablet.foregroundAppId).toBeUndefined();
    expect(world.appState.app).toBeUndefined();

    const emptyWorld = mod.deriveInitialWorld({ id: "empty" } as any, registry);
    expect(emptyWorld.devices).toEqual({});

    const sorted = prepareTestUtils.sortEvents([
      { at: 0, kind: "UNKNOWN" },
      { at: 0, kind: "DEVICE" },
    ] as any);
    expect(sorted[0].kind).toBe("DEVICE");

    const sortedReverse = prepareTestUtils.sortEvents([
      { at: 0, kind: "DEVICE" },
      { at: 0, kind: "UNKNOWN" },
    ] as any);
    expect(sortedReverse[0].kind).toBe("DEVICE");
  });

  it("validates assets via helper defaults", async () => {
    vi.resetModules();

    const assetsWithMissing = {
      sounds: { ding: undefined },
      icons: { app: undefined },
      images: { hero: undefined },
    } as any;

    const result = prepareTestUtils.validateAssets(assetsWithMissing, {
      mode: "preview",
      strict: false,
    });
    expect(result.missing.map((m) => m.type)).toEqual(
      expect.arrayContaining(["sound", "icon", "image"]),
    );

    const resultFallback = prepareTestUtils.validateAssets({} as any, {
      mode: "preview",
      strict: false,
    });
    expect(resultFallback.missing).toHaveLength(0);
  });

  it("validates assets and surfaces warnings/errors", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({ timeline: { ops: [] } }));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const previewPlugin: TokovoPluginContract = {
      id: "app_preview",
      displayName: "Preview",
      version: "1.0.0",
      views: { AppRoot: () => null },
      assets: { sounds: { ding: "relative.mp3" }, icons: { app: "" }, images: { hero: "" } },
    } as TokovoPluginContract;

    mod.prepareEpisode(baseInput as any, [previewPlugin], { mode: "preview" });
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();

    const renderPlugin: TokovoPluginContract = {
      id: "app_render",
      displayName: "Render",
      version: "1.0.0",
      views: { AppRoot: () => null },
      assets: { sounds: { ding: "" } },
    } as TokovoPluginContract;

    expect(() =>
      mod.prepareEpisode(baseInput as any, [renderPlugin], {
        mode: "render",
        strict: true,
      }),
    ).toThrow(/Missing assets/);
  });

  it("runs episodes via replay", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({ timeline: { ops: [] } }));

    const compiled = mod.prepareEpisode(baseInput as any) as CompiledEpisode;
    const state = mod.runEpisode(compiled, 0, {
      mode: "preview",
      registries: createEngineRegistries(),
      config: createConfig(),
    });
    expect(state).toEqual(compiled.initialWorld);
  });

  it("defaults duration and fps when omitted", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({ timeline: { ops: [] } }));

    const minimalInput = {
      episodeId: "ep2",
      devices: [],
    };

    const compiled = mod.prepareEpisode(minimalInput as any, [], { strict: false });
    expect(compiled.durationInFrames).toBe(600);
    expect(compiled.fps).toBe(30);
  });

  it("throws on validation errors when strict", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({
      timeline: {
        ops: [{ at: undefined, kind: "DEVICE" }],
      },
    }));

    expect(() => mod.prepareEpisode(baseInput as any, [], { strict: true })).toThrow(
      /Episode validation failed/i,
    );
  });

  it("throws when events are unsorted in strict mode", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({
      timeline: {
        ops: [
          { at: 5, kind: "DEVICE" },
          { at: 1, kind: "DEVICE" },
        ],
      },
    }));

    expect(() => mod.prepareEpisode(baseInput as any, [], { strict: true })).toThrow(
      /Events not sorted/i,
    );
  });

  it("allows validation errors when not strict", async () => {
    vi.resetModules();
    const mod = await import("../prepare/prepare");
    mod.setCompiler(() => ({
      timeline: {
        ops: [{ at: undefined, kind: undefined }],
      },
    }));

    const compiled = mod.prepareEpisode(baseInput as any, [], { strict: false });
    expect(compiled.events).toHaveLength(1);
  });
});
