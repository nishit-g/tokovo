import { describe, expect, it } from "vitest";
import type { TokovoPluginContract, WorldState } from "@tokovo/core";
import {
  createTokovoRegistries,
  PluginManagerClass,
} from "../index.js";
import { createPluginBuilder } from "../plugin/builder.js";

function createPlugin(): TokovoPluginContract<"app_test"> {
  return {
    id: "app_test",
    version: "1.0.0",
    displayName: "Test Plugin",
    themeColor: "#123456",
    icon: "T",
    reducer: (draft: WorldState) => {
      draft.appState ??= {};
      draft.appState.app_test ??= { viewMode: "FEED" };
    },
    views: {
      AppRoot: () => null,
    },
  };
}

describe("plugin registration", () => {
  it("registers declared metadata instead of hardcoded defaults", () => {
    const registries = createTokovoRegistries();
    const pluginManager = new PluginManagerClass(registries.plugins);

    pluginManager.register(createPlugin());

    const metadata = registries.plugins.metadata.get("app_test");
    expect(metadata.themeColor).toBe("#123456");
    expect(metadata.icon).toBe("T");
  });

  it("builder cleanup unregisters the plugin itself", () => {
    const registries = createTokovoRegistries();
    const pluginManager = new PluginManagerClass(registries.plugins);

    const unregister = createPluginBuilder({
      id: "app_test",
      displayName: "Test Plugin",
      themeColor: "#123456",
      icon: "T",
    })
      .withReducer((draft: WorldState) => {
        draft.appState ??= {};
        draft.appState.app_test ??= { viewMode: "FEED" };
      })
      .withViews({ AppRoot: () => null })
      .register(pluginManager, registries.engine);

    expect(pluginManager.get("app_test")).toBeDefined();
    unregister();
    expect(pluginManager.get("app_test")).toBeUndefined();
  });
});
