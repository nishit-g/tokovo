import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { WorldState } from "../types";
import {
  PluginManager,
  definePlugin,
  registerPlugins,
} from "../plugin/plugin";
import { ReducerRegistry } from "../engine/registry";
import { AppRegistry } from "../registries/app";
import { AppMetadataRegistry } from "../registries/metadata";
import { SoundRegistry } from "../registries/sound";
import { LayoutRegistry } from "../registries/layout";
import { AutoSoundRegistry } from "../audio/auto-sound";
import { NotificationAdapterRegistry } from "../notifications/adapter";
import { resolveAnchor, clearAnchors } from "../anchors/registry";
import * as validation from "../utils/validation";

const baseWorld = {
  devices: {
    phone: { screenDimensions: { width: 100, height: 200 } },
  },
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState;

beforeEach(() => {
  for (const id of PluginManager.getAppIds()) {
    PluginManager.unregister(id);
  }
  ReducerRegistry.reset();
  AppRegistry.clear();
  AppMetadataRegistry.clear();
  SoundRegistry.clear();
  LayoutRegistry.clear();
  AutoSoundRegistry.clear();
  clearAnchors();
});

afterEach(() => {
  for (const id of PluginManager.getAppIds()) {
    PluginManager.unregister(id);
  }
  ReducerRegistry.reset();
  AppRegistry.clear();
  AppMetadataRegistry.clear();
  SoundRegistry.clear();
  LayoutRegistry.clear();
  AutoSoundRegistry.clear();
  clearAnchors();
});

describe("plugin manager", () => {
  it("registers plugins and wires registries", async () => {
    const pluginId = "app_chat";

    const unregister = PluginManager.register({
      id: pluginId,
      displayName: "Chat",
      version: "1.0.0",
      reducer: (draft) => {
        (draft.appState as any).handled = true;
      },
      eventKinds: ["CHAT_EVENT"],
      views: { AppRoot: () => null },
      createInitialState: () => ({ ready: true }),
      assets: { sounds: { ding: "/sounds/ding.mp3" }, icons: { app: "/icons/app.png" } },
      anchors: {
        providers: {
          avatar: () => ({ x: 0.1, y: 0.2, width: 0.3, height: 0.4 }),
        },
      },
      layouts: [
        { viewKind: "CHAT", computeLayout: () => ({ kind: "layout" } as any) },
      ],
      audioRules: [
        {
          match: { kind: "APP", type: "MESSAGE_RECEIVED", appId: pluginId },
          action: "PLAY_ONE_SHOT",
          sound: "ding",
        },
      ],
      notificationAdapter: {
        format: () => ({ title: "T", body: "B", color: "#fff" }),
      },
    });

    expect(PluginManager.has(pluginId)).toBe(true);
    expect(PluginManager.getView(pluginId)).toBeDefined();
    expect(PluginManager.getSound(pluginId, "ding")).toBe("/sounds/ding.mp3");
    expect(PluginManager.getMetadata(pluginId)?.name).toBe("Chat");
    expect(PluginManager.getMetadata(pluginId)?.icon).toBe("/icons/app.png");
    expect(PluginManager.getInitialStateCreator(pluginId)?.()).toEqual({ ready: true });
    expect(PluginManager.createInitialAppState()).toEqual({ [pluginId]: { ready: true } });

    expect(ReducerRegistry.hasAppReducer(pluginId)).toBe(true);
    expect(ReducerRegistry.getEventKindsForApp(pluginId)).toContain("CHAT_EVENT");

    const anchor = resolveAnchor(`${pluginId}:avatar`, baseWorld, "phone");
    expect(anchor?.x).toBe(10);
    expect(anchor?.height).toBe(80);

    const worldNoDims = {
      devices: { phone: {} },
      appState: {},
      camera: { baseView: "APP_VIEW" },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;
    const defaultAnchor = resolveAnchor(`${pluginId}:avatar`, worldNoDims, "phone");
    expect(defaultAnchor?.x).toBeCloseTo(43, 4);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(LayoutRegistry.has(pluginId, "CHAT")).toBe(true);

    const formatted = NotificationAdapterRegistry.format({
      id: "n1",
      ir: { id: "n1", appId: pluginId, title: "t", body: "b" },
      appId: pluginId,
      title: "t",
      body: "b",
      state: "pending",
      createdAtFrame: 0,
    } as any);
    expect(formatted.title).toBe("T");

    unregister();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(PluginManager.has(pluginId)).toBe(false);
    expect(PluginManager.getAll()).toEqual([]);
  });

  it("continues when validation fails", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    PluginManager.register({
      id: "app_bad",
      displayName: "Bad",
      version: "1.0.0",
      views: {},
    } as any);

    expect(PluginManager.has("app_bad")).toBe(true);
    warnSpy.mockRestore();
  });

  it("continues when validation throws non-errors", () => {
    const spy = vi
      .spyOn(validation, "validatePlugin")
      .mockImplementation(() => {
        throw "not-an-error";
      });

    PluginManager.register({
      id: "app_string_error",
      displayName: "String Error",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    expect(PluginManager.has("app_string_error")).toBe(true);
    spy.mockRestore();
  });

  it("fills audio rule appIds when missing", () => {
    const pluginId = "app_rules";
    PluginManager.register({
      id: pluginId,
      displayName: "Rules",
      version: "1.0.0",
      views: { AppRoot: () => null },
      audioRules: [
        {
          match: { kind: "APP", type: "PING" },
          action: "PLAY_ONE_SHOT",
          sound: "ding",
        },
      ],
    });

    const rules = AutoSoundRegistry.getRulesForKind("APP");
    expect(rules[0]?.match.appId).toBe(pluginId);

    PluginManager.unregister(pluginId);
  });

  it("overwrites existing plugin registrations", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    PluginManager.register({
      id: "app_overwrite",
      displayName: "First",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    PluginManager.register({
      id: "app_overwrite",
      displayName: "Second",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    expect(PluginManager.getMetadata("app_overwrite")?.name).toBe("Second");
    PluginManager.unregister("app_overwrite");
    expect(PluginManager.getMetadata("missing")).toBeUndefined();
    warnSpy.mockRestore();
  });

  it("returns null when anchor provider yields no bounds", () => {
    const pluginId = "app_null_anchor";

    PluginManager.register({
      id: pluginId,
      displayName: "Null Anchor",
      version: "1.0.0",
      views: { AppRoot: () => null },
      anchors: {
        providers: {
          avatar: () => null,
        },
      },
    });

    const anchor = resolveAnchor(`${pluginId}:avatar`, baseWorld, "phone");
    expect(anchor).toBeNull();

    PluginManager.unregister(pluginId);
  });

  it("rolls back on registration errors", () => {
    const spy = vi
      .spyOn(ReducerRegistry, "registerAppReducer")
      .mockImplementation(() => {
        throw "boom";
      });

    expect(() =>
      PluginManager.register({
        id: "app_throw",
        displayName: "Throw",
        version: "1.0.0",
        reducer: () => undefined,
        views: { AppRoot: () => null },
      }),
    ).toThrow("boom");

    expect(PluginManager.has("app_throw")).toBe(false);
    spy.mockRestore();
  });

  it("logs rollback cleanup errors during registration", () => {
    const unregisterSpy = vi
      .spyOn(ReducerRegistry, "unregisterAppReducer")
      .mockImplementation(() => {
        throw new Error("cleanup failed");
      });
    const registerSpy = vi
      .spyOn(AppRegistry, "register")
      .mockImplementation(() => {
        throw new Error("boom");
      });

    expect(() =>
      PluginManager.register({
        id: "app_rollback",
        displayName: "Rollback",
        version: "1.0.0",
        reducer: () => undefined,
        views: { AppRoot: () => null },
      }),
    ).toThrow("boom");

    expect(PluginManager.has("app_rollback")).toBe(false);

    registerSpy.mockRestore();
    unregisterSpy.mockRestore();
  });

  it("handles cleanup errors on unregister", () => {
    PluginManager.register({
      id: "app_cleanup",
      displayName: "Cleanup",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    const spy = vi
      .spyOn(AppRegistry, "unregister")
      .mockImplementation(() => {
        throw "cleanup failed";
      });

    expect(() => PluginManager.unregister("app_cleanup")).not.toThrow();
    expect(PluginManager.has("app_cleanup")).toBe(false);

    spy.mockRestore();
  });

  it("handles cleanup errors on unregister with Error instances", () => {
    PluginManager.register({
      id: "app_cleanup_error",
      displayName: "Cleanup Error",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    const spy = vi
      .spyOn(AppRegistry, "unregister")
      .mockImplementation(() => {
        throw new Error("cleanup failed");
      });

    expect(() => PluginManager.unregister("app_cleanup_error")).not.toThrow();
    expect(PluginManager.has("app_cleanup_error")).toBe(false);

    spy.mockRestore();
  });

  it("exports helpers for defining and registering plugins", () => {
    const plugin = definePlugin({
      id: "app_define",
      displayName: "Define",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    registerPlugins([plugin]);
    expect(PluginManager.getAppIds()).toContain("app_define");
  });
});
