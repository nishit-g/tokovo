import { describe, it, expect } from "vitest";
import type { LayoutContext, ViewKind, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { iMessageLayoutStrategies } from "../layout/index.js";
import { createIMessageInitialState } from "../runtime/initial-state.js";
import type { IMessageScreen } from "../types/state.js";

function computeLayoutFor(screen: IMessageScreen, viewKind: ViewKind) {
  const appState = { ...createIMessageInitialState(), currentScreen: screen, viewMode: viewKind };
  const world = {
    appState: { app_imessage: appState },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;

  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "d1",
    activeAppId: "app_imessage",
    viewKind,
    viewportWidth: 393,
    viewportHeight: 852,
    safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    layoutCache: undefined,
  };

  const strat = iMessageLayoutStrategies.find((s) => s.viewKind === viewKind);
  if (!strat) throw new Error(`Missing imessage layout strategy for ${viewKind}`);
  return strat.computeLayout(ctx) as any;
}

function expectHasAnchors(layout: any, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic.regions[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("iMessage semantic anchors (layout-driven)", () => {
  it("list includes expected anchors", () => {
    const layout = computeLayoutFor("list", "FEED");
    expectHasAnchors(layout, ["device", "app", "imessage_list_header", "imessage_list"]);
  });

  it("chat includes expected anchors", () => {
    const layout = computeLayoutFor("chat", "CHAT");
    expectHasAnchors(layout, ["device", "app", "imessage_thread", "imessage_composer"]);
  });

  it("info includes expected anchors", () => {
    const layout = computeLayoutFor("info", "FULLSCREEN");
    expectHasAnchors(layout, ["device", "app", "imessage_info"]);
  });

  it("media includes expected anchors", () => {
    const layout = computeLayoutFor("media", "FULLSCREEN");
    expectHasAnchors(layout, ["device", "app", "imessage_media"]);
  });
});

