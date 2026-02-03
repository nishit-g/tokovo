import { describe, expect, it, afterEach } from "vitest";
import type { WorldState } from "../types";
import { PluginManager } from "../plugin/plugin";
import { PluginRouter } from "../plugin/router";
import { ReducerRegistry } from "../engine/registry";
import { SoundRegistry } from "../registries/sound";
import { registerAnchorProvider, clearAnchors } from "../anchors/registry";

const pluginId = "app_router";

afterEach(() => {
  PluginManager.unregister(pluginId);
  ReducerRegistry.reset();
  SoundRegistry.clear();
  clearAnchors();
  PluginRouter.clearCache();
});

describe("plugin router", () => {
  it("provides accessors with cached instances", () => {
    PluginManager.register({
      id: pluginId,
      displayName: "Router",
      version: "1.0.0",
      reducer: () => undefined,
      eventKinds: ["ROUTER_EVENT"],
      views: { AppRoot: () => null },
      createInitialState: () => ({ ready: true }),
      layoutConstants: { designWidth: 400 } as any,
    });

    SoundRegistry.registerNamespaced(pluginId, { ping: "ping.mp3" });

    registerAnchorProvider({
      appId: pluginId,
      framing: {},
      getAnchors: (_world, _layout, _deviceId) => ({
        anchors: { [`${pluginId}:anchor`]: { x: 1, y: 2, width: 3, height: 4 } },
        deviceId: "phone",
        appId: pluginId,
      }),
    });

    const accessor = PluginRouter.get(pluginId);
    expect(accessor?.id).toBe(pluginId);
    expect(accessor?.getReducer()).toBeDefined();
    expect(accessor?.getEventKinds()).toContain("ROUTER_EVENT");
    expect(accessor?.getSound("ping")).toBe("ping.mp3");

    const world = {
      devices: { phone: {} },
      appState: {},
      camera: { baseView: "APP_VIEW" },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;

    expect(accessor?.getAnchor(`${pluginId}:anchor`, world, "phone")?.width).toBe(3);
    expect(accessor?.getLayoutConstants()?.designWidth).toBe(400);
    expect(accessor?.getInitialState()).toEqual({ ready: true });

    const accessorAgain = PluginRouter.get(pluginId);
    expect(accessorAgain).toBe(accessor);

    expect(PluginRouter.has(pluginId)).toBe(true);
    expect(PluginRouter.getAll().length).toBeGreaterThan(0);

    expect(PluginRouter.get("missing")).toBeUndefined();
  });
});
