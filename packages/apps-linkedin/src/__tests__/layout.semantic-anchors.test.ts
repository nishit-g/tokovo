import { describe, it, expect } from "vitest";
import type { LayoutContext, ViewKind, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { linkedInLayoutStrategies } from "../layout/index.js";
import { createLinkedInInitialState, type LinkedInState } from "../runtime/state.js";

function computeLayoutFor(screen: LinkedInState["currentScreen"], viewKind: ViewKind) {
  const appState = { ...createLinkedInInitialState(), currentScreen: screen, viewMode: viewKind };
  if (screen === "thread") {
    (appState as any).activeThreadId = "t1";
    (appState as any).conversationId = "t1";
  }
  const world = {
    appState: { app_linkedin: appState },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;

  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "d1",
    activeAppId: "app_linkedin",
    viewKind,
    viewportWidth: 393,
    viewportHeight: 852,
    safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    layoutCache: undefined,
  };

  const strat = linkedInLayoutStrategies.find((s) => s.viewKind === viewKind);
  if (!strat) throw new Error(`Missing linkedin layout strategy for ${viewKind}`);
  return strat.computeLayout(ctx) as any;
}

function expectHasAnchors(layout: any, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic.regions[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("LinkedIn semantic anchors (layout-driven)", () => {
  it("feed includes expected anchors", () => {
    const layout = computeLayoutFor("feed", "FEED");
    expectHasAnchors(layout, [
      "device",
      "app",
      "li_nav_bar",
      "li_header",
      "li_feed",
      "li_post_card",
      "li_reaction_row",
      "li_compose_fab",
    ]);
  });

  it("notifications includes expected anchors", () => {
    const layout = computeLayoutFor("notifications", "FEED");
    expectHasAnchors(layout, ["device", "app", "li_nav_bar", "li_header", "li_notifications_list"]);
  });

  it("messages includes expected anchors", () => {
    const layout = computeLayoutFor("messages", "FEED");
    expectHasAnchors(layout, ["device", "app", "li_nav_bar", "li_header", "li_messages_list"]);
  });

  it("post detail includes expected anchors", () => {
    const layout = computeLayoutFor("post", "FEED");
    expectHasAnchors(layout, ["device", "app", "li_nav_bar", "li_header", "li_post_detail", "li_comment_composer"]);
  });

  it("thread includes expected anchors", () => {
    const layout = computeLayoutFor("thread", "CHAT");
    expectHasAnchors(layout, ["device", "app", "li_dm_thread", "li_dm_composer"]);
  });

  it("compose includes expected anchors", () => {
    const layout = computeLayoutFor("compose", "FULLSCREEN");
    expectHasAnchors(layout, ["device", "app", "li_compose_sheet"]);
  });
});

