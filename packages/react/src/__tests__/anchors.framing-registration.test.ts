import { describe, it, expect } from "vitest";
import { createTokovoRegistries, PluginManagerClass } from "../index.js";
import type { TokovoPluginContract, WorldState } from "@tokovo/core";

describe("Plugin anchors framing registration", () => {
  it("registers framing keys even when providers only include default", () => {
    const registries = createTokovoRegistries();
    const pluginManager = new PluginManagerClass(registries.plugins);

    const plugin: TokovoPluginContract<"app_test"> = {
      id: "app_test",
      version: "1.0.0",
      displayName: "Test",
      reducer: (draft: WorldState) => {
        draft.appState ??= {};
        draft.appState.app_test ??= { viewMode: "FEED" };
      },
      views: {
        AppRoot: () => null,
      },
      anchors: {
        providers: {
          default: () => null,
        },
        framing: {
          foo: { anchorPoint: { x: 0.25, y: 0.75 }, paddingPx: 12, targetFill: 0.9 },
        },
      },
    };

    pluginManager.register(plugin);

    const framing = registries.plugins.anchors.getFraming("app_test", "foo");
    expect(framing.anchorPoint.x).toBe(0.25);
    expect(framing.anchorPoint.y).toBe(0.75);
    expect(framing.paddingPx).toBe(12);
    expect(framing.targetFill).toBe(0.9);
  });
});

