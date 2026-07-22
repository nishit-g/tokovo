import { describe, it, expect } from "vitest";
import type { LayoutContext, ViewKind, WorldState } from "@tokovo/core";
import { createAppViewportFrame, createDefaultAudioState } from "@tokovo/core";
import { iMessageLayoutStrategies } from "../layout/index.js";
import { createIMessageInitialState } from "../runtime/initial-state.js";
import type { IMessageScreen } from "../types/state.js";

function computeLayoutFor(screen: IMessageScreen, viewKind: ViewKind) {
  const appState = {
    ...createIMessageInitialState(),
    currentScreen: screen,
    viewMode: viewKind,
  };
  const world = {
    appInstances: { "phone:app_imessage": appState },
    capabilityState: {},
    devices: {},
    audio: createDefaultAudioState(),
  } as WorldState;

  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "phone",
    activeAppId: "app_imessage",
    platform: "ios",
    viewKind,
    viewportWidth: 393,
    viewportHeight: 852,
    appViewport: createAppViewportFrame({
      width: 393,
      height: 852,
      interactiveInsets: { top: 47, bottom: 34 },
    }),
    layoutCache: undefined,
  };

  const strat = iMessageLayoutStrategies.find((s) => s.viewKind === viewKind);
  if (!strat) throw new Error(`Missing imessage layout strategy for ${viewKind}`);
  return strat.computeLayout(ctx) as any;
}

function expectHasSubjects(layout: any, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic.regions[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("iMessage semantic subjects (layout-driven)", () => {
  it("list includes expected subjects", () => {
    const layout = computeLayoutFor("list", "FEED");
    expectHasSubjects(layout, ["device", "app", "imessage_list_header", "imessage_list"]);
  });

  it("chat includes expected subjects", () => {
    const layout = computeLayoutFor("chat", "CHAT");
    expectHasSubjects(layout, ["device", "app", "imessage_thread", "imessage_composer"]);
  });

  it("info includes expected subjects", () => {
    const layout = computeLayoutFor("info", "FULLSCREEN");
    expectHasSubjects(layout, ["device", "app", "imessage_info"]);
  });

  it("media includes expected subjects", () => {
    const layout = computeLayoutFor("media", "FULLSCREEN");
    expectHasSubjects(layout, ["device", "app", "imessage_media"]);
  });
});
