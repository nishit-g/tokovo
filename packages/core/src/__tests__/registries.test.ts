import { describe, expect, it, vi } from "vitest";
import React from "react";
import {
  createRegistry,
  setRegistryStrictMode,
  getRegistryStrictMode,
} from "../registries/factory";
import { AppRegistry } from "../registries/app";
import { BehaviorRegistry } from "../registries/behavior";
import { IconRegistry, getAppIcon } from "../registries/icon";
import { AppMetadataRegistry } from "../registries/metadata";
import { SoundRegistry } from "../registries/sound";
import { LayoutRegistry } from "../registries/layout";
import {
  WidgetRegistry,
  getDynamicIslandWidget,
  getNotificationWidgets,
} from "../registries/widget";
import {
  createRuntimeContext,
  getDefaultContext,
  resetDefaultContext,
} from "../registries/context";
import {
  getContainer,
  createScopedContainer,
  setGlobalContainer,
  resetGlobalContainer,
} from "../registries/container";
import {
  UnifiedPluginRegistry,
  createIsolatedPluginRegistry,
} from "../registries/unified";

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
    AppRegistry.register("app", DummyView);
    expect(AppRegistry.hasView("app")).toBe(true);
    expect(AppRegistry.getView("app")).toBe(DummyView);
    expect(AppRegistry.views.app).toBe(DummyView);
    AppRegistry.clear();
    expect(AppRegistry.size).toBe(0);
  });

  it("registers behaviors and intents", () => {
    BehaviorRegistry.register({
      appId: "app",
      eventMappings: {
        FOCUS: { type: "FOCUS", anchor: "app:anchor" as any },
      },
    });
    expect(BehaviorRegistry.has("app")).toBe(true);
    expect(BehaviorRegistry.getIntent("app", "FOCUS")?.type).toBe("FOCUS");
    expect(BehaviorRegistry.size).toBe(1);
    BehaviorRegistry.clear();
  });
});

describe("icon and metadata registries", () => {
  it("returns default icons and metadata", () => {
    expect(IconRegistry.get("missing")).toBe("📱");
    expect(IconRegistry.getMetadata("missing").default).toBe("📱");
    expect(AppMetadataRegistry.get("missing").displayName).toBe("missing");
  });

  it("registers icons and metadata", () => {
    IconRegistry.register("app", { default: "A", dark: "D" });
    expect(IconRegistry.get("app")).toBe("A");
    expect(IconRegistry.get("app", "dark")).toBe("D");
    expect(IconRegistry.get("app", "light")).toBe("A");
    expect(getAppIcon("app")).toBe("A");
    expect(IconRegistry.getMetadata("app").default).toBe("A");
    expect(IconRegistry.size).toBe(1);
    IconRegistry.clear();

    AppMetadataRegistry.register("app", {
      displayName: "App",
      themeColor: "#000",
      icon: "A",
    });
    expect(AppMetadataRegistry.get("app").displayName).toBe("App");
    expect(AppMetadataRegistry.size).toBe(1);
    AppMetadataRegistry.clear();
  });
});

describe("sound and layout registries", () => {
  it("registers sounds and namespaces", () => {
    SoundRegistry.register("ding", "ding.mp3");
    SoundRegistry.registerMany({ tap: "tap.mp3" });
    SoundRegistry.registerNamespaced("app", { ping: "ping.mp3" });
    expect(SoundRegistry.getNamespaced("app", "ping")).toBe("ping.mp3");
    SoundRegistry.unregisterNamespaced("app");
    expect(SoundRegistry.getNamespaced("app", "ping")).toBeUndefined();
    SoundRegistry.clear();
  });

  it("registers layouts and unregisters by app", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    LayoutRegistry.register({
      appId: "app",
      viewKind: "HOME",
      computeLayout: () => ({ kind: "layout" } as any),
    });
    LayoutRegistry.register({
      appId: "app",
      viewKind: "CHAT",
      computeLayout: () => ({ kind: "layout" } as any),
    });
    LayoutRegistry.register({
      appId: "app",
      viewKind: "CHAT",
      computeLayout: () => ({ kind: "layout" } as any),
    });

    expect(LayoutRegistry.has("app", "HOME")).toBe(true);
    expect(LayoutRegistry.get("app", "HOME")?.viewKind).toBe("HOME");
    expect(LayoutRegistry.getByViewKind("CHAT")?.viewKind).toBe("CHAT");
    expect(LayoutRegistry.getByViewKind("MISSING")).toBeUndefined();
    expect(LayoutRegistry.getAllForViewKind("HOME")).toHaveLength(1);
    expect(LayoutRegistry.getForApp("app")).toHaveLength(2);
    expect(LayoutRegistry.getRegisteredApps()).toContain("app");

    LayoutRegistry.unregisterApp("app");
    expect(LayoutRegistry.size).toBe(0);
    warn.mockRestore();
  });
});

describe("widget registry", () => {
  it("resolves widgets by priority", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
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
    WidgetRegistry.register("app", [widget, notificationWidget]);

    const resolved = WidgetRegistry.resolve("dynamicIsland", "ios", ["app"]);
    expect(resolved?.appId).toBe("app");

    expect(getDynamicIslandWidget("ios", ["app"])?.component).toBe(DummyView);
    expect(getNotificationWidgets("ios", ["app"])).toEqual([
      { appId: "app", component: DummyView },
    ]);

    WidgetRegistry.register("app", [widget]);
    expect(warn).toHaveBeenCalled();
    expect(WidgetRegistry.getForApp("app")).toHaveLength(1);
    expect(WidgetRegistry.hasWidgets("app")).toBe(true);
    expect(WidgetRegistry.hasWidgets("missing")).toBe(false);
    expect(WidgetRegistry.getRegisteredApps()).toContain("app");
    expect(WidgetRegistry.size).toBe(1);

    WidgetRegistry.clear();
    warn.mockRestore();
  });

  it("handles missing widgets and priority ordering", () => {
    WidgetRegistry.clear();

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

    WidgetRegistry.register("app1", [lowPriority, highPriority, androidOnly]);
    const resolved = WidgetRegistry.resolve("dynamicIsland", "ios", ["app1"]);
    expect(resolved?.widget.priority).toBe(20);

    WidgetRegistry.register("app2", [highPriority, lowPriority]);
    const resolvedNoOverride = WidgetRegistry.resolve("dynamicIsland", "ios", ["app2"]);
    expect(resolvedNoOverride?.widget.priority).toBe(20);

    expect(WidgetRegistry.resolve("dynamicIsland", "ios", ["missing"])).toBeNull();
    expect(getDynamicIslandWidget("ios", ["missing"])).toBeNull();
    expect(getNotificationWidgets("ios", ["missing"])).toEqual([]);
    expect(WidgetRegistry.getForApp("missing")).toEqual([]);

    WidgetRegistry.clear();
  });
});

describe("runtime and container registries", () => {
  it("creates runtime contexts", () => {
    const ctx = createRuntimeContext();
    ctx.apps.register("app", DummyView);
    expect(ctx.apps.has("app")).toBe(true);
    expect(ctx.apps.get("app")).toBe(DummyView);
    expect(Array.from(ctx.apps.keys())).toContain("app");
    expect(Array.from(ctx.apps.values())).toContain(DummyView);
    expect(Array.from(ctx.apps.entries())[0][0]).toBe("app");
    expect(ctx.apps.delete("app")).toBe(true);
    expect(ctx.apps.get("app")).toBeUndefined();
    ctx.reset();
    expect(ctx.apps.size).toBe(0);

    const defaultCtx = getDefaultContext();
    defaultCtx.apps.register("app", DummyView);
    resetDefaultContext();
  });

  it("manages global container registry", () => {
    const container = getContainer();
    container.registries.sound.register("tone", "tone.mp3");
    expect(container.registries.sound.has("tone")).toBe(true);

    const scoped = createScopedContainer();
    expect(scoped.registries.sound.has("tone")).toBe(false);

    setGlobalContainer(scoped);
    resetGlobalContainer();
  });
});

describe("unified plugin registry", () => {
  it("tracks plugins and resets registries", () => {
    UnifiedPluginRegistry.markRegistered("app");
    expect(UnifiedPluginRegistry.isRegistered("app")).toBe(true);
    expect(UnifiedPluginRegistry.getRegisteredCount()).toBe(1);
    UnifiedPluginRegistry.markUnregistered("app");
    expect(UnifiedPluginRegistry.isRegistered("app")).toBe(false);
    UnifiedPluginRegistry.markRegistered("app");

    const stats = UnifiedPluginRegistry.getRegistryStats();
    expect(stats.plugins).toBeGreaterThan(0);

    UnifiedPluginRegistry.resetAll();
    expect(UnifiedPluginRegistry.getRegisteredCount()).toBe(0);
  });

  it("creates isolated plugin registry context", () => {
    const { registry, context, reducers } = createIsolatedPluginRegistry();
    registry.markRegistered("app");
    expect(registry.getRegisteredPlugins()).toContain("app");
    expect(context.apps.size).toBe(0);
    expect(reducers.hasAppReducer).toBeDefined();
    expect(registry.createIsolatedContext().apps.size).toBe(0);
  });
});
