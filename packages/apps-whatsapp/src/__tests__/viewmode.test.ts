import { describe, it, expect } from "vitest";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE } from "@tokovo/core";
import { whatsappReducer } from "../runtime/reducer.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";

function baseWorld(): WorldState {
  const appState = createWhatsAppInitialState();
  appState.conversations.c1 = { id: "c1", messages: [] };
  return {
    devices: {},
    appState: { app_whatsapp: appState },
    audio: DEFAULT_AUDIO_STATE,
  } as unknown as WorldState;
}

describe("WhatsApp viewMode invariants", () => {
  it("NavigateScreen to chats sets viewMode FEED and clears conversation", () => {
    const world = baseWorld();
    whatsappReducer(world, {
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "d1",
      at: 0,
      type: "NAVIGATE_SCREEN",
      payload: { screen: "chats" },
    } as any);

    const s = (world.appState as any).app_whatsapp;
    expect(s.currentScreen).toBe("chats");
    expect(s.viewMode).toBe("FEED");
    expect(s.conversationId).toBeUndefined();
  });

  it("ConversationOpened sets viewMode CHAT and sets conversationId", () => {
    const world = baseWorld();
    whatsappReducer(world, {
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "d1",
      at: 0,
      type: "CONVERSATION_OPENED",
      payload: { conversationId: "c1" },
    } as any);

    const s = (world.appState as any).app_whatsapp;
    expect(s.currentScreen).toBe("chat");
    expect(s.viewMode).toBe("CHAT");
    expect(s.conversationId).toBe("c1");
  });

  it("profile navigation preserves the explicit conversation context", () => {
    const world = baseWorld();
    whatsappReducer(world, {
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "d1",
      at: 0,
      type: "NAVIGATE_SCREEN",
      payload: { screen: "profile", conversationId: "c1" },
    } as any);

    const state = (world.appState as any).app_whatsapp;
    expect(state.currentScreen).toBe("profile");
    expect(state.viewMode).toBe("FEED");
    expect(state.conversationId).toBe("c1");
  });

  it("rejects profile navigation without conversation context", () => {
    expect(() =>
      whatsappReducer(baseWorld(), {
        kind: "APP",
        appId: "app_whatsapp",
        deviceId: "d1",
        at: 0,
        type: "NAVIGATE_SCREEN",
        payload: { screen: "profile" },
      } as any),
    ).toThrow("WhatsApp profile navigation requires a conversationId");
  });
});
