import { describe, expect, it } from "vitest";
import type { WorldState } from "../types";
import { PluginManagerClass } from "../plugin/plugin";
import { createPluginRouter } from "../plugin/router";
import { createPluginRegistries } from "../plugin/registries";

const pluginId = "app_router";

describe("plugin router", () => {
  it("provides accessors with cached instances", () => {
    const registries = createPluginRegistries();
    const pluginManager = new PluginManagerClass(registries);
    const pluginRouter = createPluginRouter(pluginManager, registries);

    pluginManager.register({
      id: pluginId,
      displayName: "Router",
      version: "1.0.0",
      reducer: () => undefined,
      eventKinds: ["ROUTER_EVENT"],
      views: { AppRoot: () => null },
      createInitialState: () => ({ ready: true }),
      layoutConstants: { designWidth: 400 } as any,
    });

    registries.sounds.registerNamespaced(pluginId, { ping: "ping.mp3" });

    registries.anchors.register({
      appId: pluginId,
      framing: {},
      getAnchors: (_world, _layout, _deviceId) => ({
        anchors: { [`${pluginId}:anchor`]: { x: 1, y: 2, width: 3, height: 4 } },
        deviceId: "phone",
        appId: pluginId,
      }),
    });

    const accessor = pluginRouter.get(pluginId);
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

    const accessorAgain = pluginRouter.get(pluginId);
    expect(accessorAgain).toBe(accessor);

    expect(pluginRouter.has(pluginId)).toBe(true);
    expect(pluginRouter.getAll().length).toBeGreaterThan(0);

    expect(pluginRouter.get("missing")).toBeUndefined();
  });
});
