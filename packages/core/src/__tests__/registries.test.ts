import { describe, expect, it, vi } from "vitest";
import React from "react";
import {
  createRegistry,
  setRegistryStrictMode,
  getRegistryStrictMode,
} from "../registries/factory";
import { createAppRegistry } from "../registries/app";
import { createBehaviorRegistry } from "../registries/behavior";
import { createIconRegistry, getAppIcon } from "../registries/icon";
import { createAppMetadataRegistry } from "../registries/metadata";
import { createSoundRegistry } from "../registries/sound";
import { createLayoutRegistry } from "../registries/layout";
import {
  createWidgetRegistry,
  getDynamicIslandWidget,
  getNotificationWidgets,
} from "../registries/widget";
import { createInitialWorld, replay } from "../engine";
import { createEngineRegistries } from "../engine/registries";
import {
  createPluginRegistries,
  PluginManagerClass,
} from "../plugin";

const DummyView = () => React.createElement("div");

describe("registry factory", () => {
  it("registers and enforces strict mode", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const registry = createRegistry<string, number>("Test");
    registry.register("a", 1);
    registry.register("a", 2);
    expect(registry.get("a")).toBe(2);
    expect(registry.values()).toEqual([2]);

    setRegistryStrictMode(true);
    expect(getRegistryStrictMode()).toBe(true);

    const strictRegistry = createRegistry<string, number>("Strict");
    strictRegistry.register("a", 1);
    expect(() => strictRegistry.register("a", 2)).toThrow();

    setRegistryStrictMode(false);
    warn.mockRestore();
  });
});

describe("app and behavior registries", () => {
  it("registers app views", () => {
    const appRegistry = createAppRegistry();
    appRegistry.register("app", DummyView);
    expect(appRegistry.hasView("app")).toBe(true);
    expect(appRegistry.getView("app")).toBe(DummyView);
    expect(appRegistry.views.app).toBe(DummyView);
    appRegistry.clear();
    expect(appRegistry.size).toBe(0);
  });

  it("registers behaviors and intents", () => {
    const behaviorRegistry = createBehaviorRegistry();
    behaviorRegistry.register({
      appId: "app",
      eventMappings: {
        FOCUS: { type: "FOCUS", anchor: "app:anchor" as any },
      },
    });
    expect(behaviorRegistry.has("app")).toBe(true);
    expect(behaviorRegistry.getIntent("app", "FOCUS")?.type).toBe("FOCUS");
    expect(behaviorRegistry.size).toBe(1);
    behaviorRegistry.clear();
  });
});

describe("icon and metadata registries", () => {
  it("returns default icons and metadata", () => {
    const iconRegistry = createIconRegistry();
    const metadataRegistry = createAppMetadataRegistry();
    expect(iconRegistry.get("missing")).toBe("📱");
    expect(iconRegistry.getMetadata("missing").default).toBe("📱");
    expect(metadataRegistry.get("missing").displayName).toBe("missing");
  });

  it("registers icons and metadata", () => {
    const iconRegistry = createIconRegistry();
    const metadataRegistry = createAppMetadataRegistry();
    iconRegistry.register("app", { default: "A", dark: "D" });
    expect(iconRegistry.get("app")).toBe("A");
    expect(iconRegistry.get("app", "dark")).toBe("D");
    expect(iconRegistry.get("app", "light")).toBe("A");
    expect(getAppIcon(iconRegistry, "app")).toBe("A");
    expect(iconRegistry.getMetadata("app").default).toBe("A");
    expect(iconRegistry.size).toBe(1);
    iconRegistry.clear();

    metadataRegistry.register("app", {
      displayName: "App",
      themeColor: "#000",
      icon: "A",
    });
    expect(metadataRegistry.get("app").displayName).toBe("App");
    expect(metadataRegistry.size).toBe(1);
    metadataRegistry.clear();
  });
});

describe("sound and layout registries", () => {
  it("registers sounds and namespaces", () => {
    const soundRegistry = createSoundRegistry();
    soundRegistry.register("ding", "ding.mp3");
    soundRegistry.registerMany({ tap: "tap.mp3" });
    soundRegistry.registerNamespaced("app", { ping: "ping.mp3" });
    expect(soundRegistry.getNamespaced("app", "ping")).toBe("ping.mp3");
    soundRegistry.unregisterNamespaced("app");
    expect(soundRegistry.getNamespaced("app", "ping")).toBeUndefined();
    soundRegistry.clear();
  });

  it("registers layouts and unregisters by app", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const layoutRegistry = createLayoutRegistry();
    layoutRegistry.register({
      appId: "app",
      viewKind: "HOME",
      computeLayout: () => ({ kind: "layout" } as any),
    });
    layoutRegistry.register({
      appId: "app",
      viewKind: "CHAT",
      computeLayout: () => ({ kind: "layout" } as any),
    });
    layoutRegistry.register({
      appId: "app",
      viewKind: "CHAT",
      computeLayout: () => ({ kind: "layout" } as any),
    });

    expect(layoutRegistry.has("app", "HOME")).toBe(true);
    expect(layoutRegistry.get("app", "HOME")?.viewKind).toBe("HOME");
    expect(layoutRegistry.getByViewKind("CHAT")?.viewKind).toBe("CHAT");
    expect(layoutRegistry.getByViewKind("MISSING")).toBeUndefined();
    expect(layoutRegistry.getAllForViewKind("HOME")).toHaveLength(1);
    expect(layoutRegistry.getForApp("app")).toHaveLength(2);
    expect(layoutRegistry.getRegisteredApps()).toContain("app");

    layoutRegistry.unregisterApp("app");
    expect(layoutRegistry.size).toBe(0);
    warn.mockRestore();
  });
});

describe("widget registry", () => {
  it("resolves widgets by priority", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const widgetRegistry = createWidgetRegistry();
    const widget = {
      mode: "dynamicIsland" as const,
      platforms: ["ios"],
      priority: 10,
      component: DummyView,
    };
    const notificationWidget = {
      mode: "notification" as const,
      platforms: ["ios"],
      priority: 1,
      component: DummyView,
    };
    widgetRegistry.register("app", [widget, notificationWidget]);

    const resolved = widgetRegistry.resolve("dynamicIsland", "ios", ["app"]);
    expect(resolved?.appId).toBe("app");

    expect(getDynamicIslandWidget(widgetRegistry, "ios", ["app"])?.component).toBe(DummyView);
    expect(getNotificationWidgets(widgetRegistry, "ios", ["app"])).toEqual([
      { appId: "app", component: DummyView },
    ]);

    widgetRegistry.register("app", [widget]);
    expect(warn).toHaveBeenCalled();
    expect(widgetRegistry.getForApp("app")).toHaveLength(1);
    expect(widgetRegistry.hasWidgets("app")).toBe(true);
    expect(widgetRegistry.hasWidgets("missing")).toBe(false);
    expect(widgetRegistry.getRegisteredApps()).toContain("app");
    expect(widgetRegistry.size).toBe(1);

    widgetRegistry.clear();
    warn.mockRestore();
  });

  it("handles missing widgets and priority ordering", () => {
    const widgetRegistry = createWidgetRegistry();

    const lowPriority = {
      mode: "dynamicIsland" as const,
      platforms: ["ios"],
      priority: 10,
      component: DummyView,
    };
    const highPriority = {
      mode: "dynamicIsland" as const,
      platforms: ["ios"],
      priority: 20,
      component: DummyView,
    };
    const androidOnly = {
      mode: "dynamicIsland" as const,
      platforms: ["android"],
      priority: 30,
      component: DummyView,
    };

    widgetRegistry.register("app1", [lowPriority, highPriority, androidOnly]);
    const resolved = widgetRegistry.resolve("dynamicIsland", "ios", ["app1"]);
    expect(resolved?.widget.priority).toBe(20);

    widgetRegistry.register("app2", [highPriority, lowPriority]);
    const resolvedNoOverride = widgetRegistry.resolve("dynamicIsland", "ios", ["app2"]);
    expect(resolvedNoOverride?.widget.priority).toBe(20);

    expect(widgetRegistry.resolve("dynamicIsland", "ios", ["missing"])).toBeNull();
    expect(getDynamicIslandWidget(widgetRegistry, "ios", ["missing"])).toBeNull();
    expect(getNotificationWidgets(widgetRegistry, "ios", ["missing"])).toEqual([]);
    expect(widgetRegistry.getForApp("missing")).toEqual([]);

    widgetRegistry.clear();
  });
});

describe("engine registries", () => {
  it("uses scoped event handlers instead of globals", () => {
    const registries = createEngineRegistries();
    registries.eventHandlers.register({
      kind: "CUSTOM",
      handler: (draft) => {
        if (!draft.appState) draft.appState = {};
        draft.appState.custom = 1;
      },
    });

    const initial = createInitialWorld();
    const events = [{ at: 0, kind: "CUSTOM" as const }];

    const result = replay(initial, events, 0, {
      mode: "render",
      registries,
    });

    expect(result.appState?.custom).toBe(1);
  });
});

describe("plugin registries", () => {
  it("registers into provided registries, not globals", () => {
    const registries = createPluginRegistries();
    const manager = new PluginManagerClass(registries);

    manager.register({
      id: "app_test",
      version: "0.0.1",
      displayName: "Test",
      reducer: () => undefined,
      views: { AppRoot: DummyView },
    });

    expect(registries.apps.hasView("app_test")).toBe(true);
    expect(registries.reducers.hasAppReducer("app_test")).toBe(true);
    expect(registries.metadata.get("app_test").displayName).toBe("Test");
  });
});
