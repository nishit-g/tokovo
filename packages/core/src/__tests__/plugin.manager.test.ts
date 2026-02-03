import { describe, expect, it, vi, beforeEach } from "vitest";
import type { WorldState } from "../types";
import {
  PluginManagerClass,
  definePlugin,
  registerPlugins,
} from "../plugin/plugin";
import { createPluginRegistries } from "../plugin/registries";
import * as validation from "../utils/validation";

const baseWorld = {
  devices: {
    phone: { screenDimensions: { width: 100, height: 200 } },
  },
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState;

let registries: ReturnType<typeof createPluginRegistries>;
let pluginManager: PluginManagerClass;

beforeEach(() => {
  registries = createPluginRegistries();
  pluginManager = new PluginManagerClass(registries);
});

describe("plugin manager", () => {
  it("registers plugins and wires registries", async () => {
    const pluginId = "app_chat";

    const unregister = pluginManager.register({
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

    expect(pluginManager.has(pluginId)).toBe(true);
    expect(pluginManager.getView(pluginId)).toBeDefined();
    expect(pluginManager.getSound(pluginId, "ding")).toBe("/sounds/ding.mp3");
    expect(pluginManager.getMetadata(pluginId)?.name).toBe("Chat");
    expect(pluginManager.getMetadata(pluginId)?.icon).toBe("/icons/app.png");
    expect(pluginManager.getInitialStateCreator(pluginId)?.()).toEqual({ ready: true });
    expect(pluginManager.createInitialAppState()).toEqual({ [pluginId]: { ready: true } });

    expect(registries.reducers.hasAppReducer(pluginId)).toBe(true);
    expect(registries.reducers.getEventKindsForApp(pluginId)).toContain(
      "CHAT_EVENT",
    );

    const anchor = registries.anchors.resolveAnchor(
      `${pluginId}:avatar`,
      baseWorld,
      "phone",
    );
    expect(anchor?.x).toBe(10);
    expect(anchor?.height).toBe(80);

    const worldNoDims = {
      devices: { phone: {} },
      appState: {},
      camera: { baseView: "APP_VIEW" },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;
    const defaultAnchor = registries.anchors.resolveAnchor(
      `${pluginId}:avatar`,
      worldNoDims,
      "phone",
    );
    expect(defaultAnchor?.x).toBeCloseTo(43, 4);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(registries.layouts.has(pluginId, "CHAT")).toBe(true);

    const formatted = registries.notifications.format({
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
    expect(pluginManager.has(pluginId)).toBe(false);
    expect(pluginManager.getAll()).toEqual([]);
  });

  it("continues when validation fails", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    pluginManager.register({
      id: "app_bad",
      displayName: "Bad",
      version: "1.0.0",
      views: {},
    } as any);

    expect(pluginManager.has("app_bad")).toBe(true);
    warnSpy.mockRestore();
  });

  it("continues when validation throws non-errors", () => {
    const spy = vi
      .spyOn(validation, "validatePlugin")
      .mockImplementation(() => {
        throw "not-an-error";
      });

    pluginManager.register({
      id: "app_string_error",
      displayName: "String Error",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    expect(pluginManager.has("app_string_error")).toBe(true);
    spy.mockRestore();
  });

  it("fills audio rule appIds when missing", () => {
    const pluginId = "app_rules";
    pluginManager.register({
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

    const rules = registries.autoSounds.getRulesForKind("APP");
    expect(rules[0]?.match.appId).toBe(pluginId);

    pluginManager.unregister(pluginId);
  });

  it("overwrites existing plugin registrations", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    pluginManager.register({
      id: "app_overwrite",
      displayName: "First",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    pluginManager.register({
      id: "app_overwrite",
      displayName: "Second",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    expect(pluginManager.getMetadata("app_overwrite")?.name).toBe("Second");
    pluginManager.unregister("app_overwrite");
    expect(pluginManager.getMetadata("missing")).toBeUndefined();
    warnSpy.mockRestore();
  });

  it("returns null when anchor provider yields no bounds", () => {
    const pluginId = "app_null_anchor";

    pluginManager.register({
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

    const anchor = registries.anchors.resolveAnchor(
      `${pluginId}:avatar`,
      baseWorld,
      "phone",
    );
    expect(anchor).toBeNull();

    pluginManager.unregister(pluginId);
  });

  it("rolls back on registration errors", () => {
    const spy = vi
      .spyOn(registries.reducers, "registerAppReducer")
      .mockImplementation(() => {
        throw "boom";
      });

    expect(() =>
      pluginManager.register({
        id: "app_throw",
        displayName: "Throw",
        version: "1.0.0",
        reducer: () => undefined,
        views: { AppRoot: () => null },
      }),
    ).toThrow("boom");

    expect(pluginManager.has("app_throw")).toBe(false);
    spy.mockRestore();
  });

  it("logs rollback cleanup errors during registration", () => {
    const unregisterSpy = vi
      .spyOn(registries.reducers, "unregisterAppReducer")
      .mockImplementation(() => {
        throw new Error("cleanup failed");
      });
    const registerSpy = vi
      .spyOn(registries.apps, "register")
      .mockImplementation(() => {
        throw new Error("boom");
      });

    expect(() =>
      pluginManager.register({
        id: "app_rollback",
        displayName: "Rollback",
        version: "1.0.0",
        reducer: () => undefined,
        views: { AppRoot: () => null },
      }),
    ).toThrow("boom");

    expect(pluginManager.has("app_rollback")).toBe(false);

    registerSpy.mockRestore();
    unregisterSpy.mockRestore();
  });

  it("handles cleanup errors on unregister", () => {
    pluginManager.register({
      id: "app_cleanup",
      displayName: "Cleanup",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    const spy = vi
      .spyOn(registries.apps, "unregister")
      .mockImplementation(() => {
        throw "cleanup failed";
      });

    expect(() => pluginManager.unregister("app_cleanup")).not.toThrow();
    expect(pluginManager.has("app_cleanup")).toBe(false);

    spy.mockRestore();
  });

  it("handles cleanup errors on unregister with Error instances", () => {
    pluginManager.register({
      id: "app_cleanup_error",
      displayName: "Cleanup Error",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    const spy = vi
      .spyOn(registries.apps, "unregister")
      .mockImplementation(() => {
        throw new Error("cleanup failed");
      });

    expect(() => pluginManager.unregister("app_cleanup_error")).not.toThrow();
    expect(pluginManager.has("app_cleanup_error")).toBe(false);

    spy.mockRestore();
  });

  it("exports helpers for defining and registering plugins", () => {
    const plugin = definePlugin({
      id: "app_define",
      displayName: "Define",
      version: "1.0.0",
      views: { AppRoot: () => null },
    });

    registerPlugins(pluginManager, [plugin]);
    expect(pluginManager.getAppIds()).toContain("app_define");
  });
});
