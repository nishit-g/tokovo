import { describe, expect, it, vi } from "vitest";
import type { WorldState } from "../types.js";
import navigationReducer from "../engine/handlers/navigation.js";

describe("navigation reducer", () => {
  const baseWorld = (): WorldState => ({
    devices: {
      phone: { id: "phone", isLocked: true, foregroundAppId: "app" },
    },
    appState: {},
    camera: { baseView: "APP_VIEW" },
    audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
  } as WorldState);

  it("handles device navigation events", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const world = baseWorld();

    navigationReducer(world, { kind: "DEVICE", type: "LOCK", deviceId: "phone" });
    expect(world.devices.phone.isLocked).toBe(true);
    expect(world.devices.phone.foregroundAppId).toBeUndefined();

    navigationReducer(world, { kind: "DEVICE", type: "UNLOCK", deviceId: "phone" });
    expect(world.devices.phone.isLocked).toBe(false);

    navigationReducer(world, {
      kind: "DEVICE",
      type: "OPEN_APP",
      deviceId: "phone",
      payload: { appId: "chat" },
    });
    expect(world.devices.phone.foregroundAppId).toBe("chat");
    expect((world.appState as any).chat.currentScreen).toBe("main");

    navigationReducer(world, { kind: "DEVICE", type: "CLOSE_APP", deviceId: "phone" });
    expect(world.devices.phone.foregroundAppId).toBeUndefined();

    navigationReducer(world, { kind: "DEVICE", type: "GO_HOME", deviceId: "phone" });
    expect(world.devices.phone.foregroundAppId).toBeUndefined();

    navigationReducer(world, { kind: "DEVICE", type: "UNKNOWN", deviceId: "phone" });

    navigationReducer(world, { kind: "DEVICE", type: "SHOW_NOTIFICATION", deviceId: "phone" });

    navigationReducer(world, { kind: "DEVICE", type: "LOCK", deviceId: "missing" });
    expect(warnSpy).toHaveBeenCalled();

    navigationReducer(world, { kind: "DEVICE", type: "LOCK" });
    expect(warnSpy).toHaveBeenCalled();

    const noAppStateWorld = baseWorld();
    (noAppStateWorld as any).appState = undefined;
    navigationReducer(noAppStateWorld, {
      kind: "DEVICE",
      type: "OPEN_APP",
      deviceId: "phone",
      payload: { appId: "chat" },
    });

    navigationReducer(world, {
      kind: "DEVICE",
      type: "OPEN_APP",
      deviceId: "phone",
    });
    expect(world.devices.phone.foregroundAppId).toBeUndefined();

    warnSpy.mockRestore();
  });

  it("handles app navigation events", () => {
    const world = baseWorld();

    navigationReducer(world, {
      kind: "APP",
      type: "NAVIGATE_SCREEN",
      appId: "chat",
      payload: { screen: "settings" },
    });
    expect((world.appState as any).chat.currentScreen).toBe("settings");

    navigationReducer(world, {
      kind: "APP",
      type: "NAVIGATE_SCREEN",
      appId: "chat",
    });
    expect((world.appState as any).chat.currentScreen).toBe("main");

    navigationReducer(world, {
      kind: "APP",
      type: "CONVERSATION_OPENED",
      appId: "chat",
      payload: { conversationId: "c1" },
    });
    expect((world.appState as any).chat.currentScreen).toBe("chat");
    expect((world.appState as any).chat.currentConversationId).toBe("c1");

    navigationReducer(world, {
      kind: "APP",
      type: "CONVERSATION_CLOSED",
      appId: "chat",
    });
    expect((world.appState as any).chat.currentScreen).toBe("chats");

    navigationReducer(world, {
      kind: "APP",
      type: "GO_BACK",
      appId: "chat",
    });
    expect((world.appState as any).chat.currentScreen).toBe("main");

    (world.appState as any).chat.currentScreen = "chat";
    navigationReducer(world, {
      kind: "APP",
      type: "GO_BACK",
      appId: "chat",
    });
    expect((world.appState as any).chat.currentScreen).toBe("chats");

    navigationReducer(world, { kind: "APP", type: "GO_BACK" });
  });

  it("ignores non-navigation events", () => {
    const world = baseWorld();
    navigationReducer(world, 123);
    navigationReducer(world, { kind: "APP", type: "OTHER", appId: "app" });
    navigationReducer(world, { kind: "APP", appId: "app" });
    expect(world.devices.phone.isLocked).toBe(true);
  });
});
