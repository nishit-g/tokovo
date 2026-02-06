import { describe, it, expect } from "vitest";
import type { LayoutContext, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { computeFeedLayout } from "../layout";
import { createWhatsAppInitialState } from "../runtime/initial-state";

function computeForScreen(currentScreen: string) {
  const appState = { ...createWhatsAppInitialState(), currentScreen, viewMode: "FEED" as const };
  const world = {
    appState: { app_whatsapp: appState },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;

  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "d1",
    activeAppId: "app_whatsapp",
    viewKind: "FEED",
    viewportWidth: 393,
    viewportHeight: 852,
    safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    layoutCache: undefined,
  };

  return computeFeedLayout(ctx) as any;
}

function expectHas(layout: any, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic.regions[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("WhatsApp semantic anchors (FEED)", () => {
  it("chats includes expected anchors", () => {
    const layout = computeForScreen("chats");
    expectHas(layout, ["device", "app", "tab_bar", "chat_list_header", "chat_list"]);
  });

  it("status includes expected anchors", () => {
    const layout = computeForScreen("status");
    expectHas(layout, ["device", "app", "tab_bar", "status_header", "status_list"]);
  });

  it("calls includes expected anchors", () => {
    const layout = computeForScreen("calls");
    expectHas(layout, ["device", "app", "tab_bar", "calls_header", "calls_list"]);
  });

  it("communities includes expected anchors", () => {
    const layout = computeForScreen("communities");
    expectHas(layout, ["device", "app", "tab_bar", "communities_header", "communities_list"]);
  });
});

