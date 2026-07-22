import { describe, it, expect } from "vitest";
import type { LayoutContext, ViewKind, WorldState } from "@tokovo/core";
import { createAppViewportFrame, createDefaultAudioState } from "@tokovo/core";
import { xLayoutStrategies } from "../layout/index.js";
import { createXInitialState, type XScreen } from "../runtime/state.js";

function computeLayoutFor(screen: XScreen, viewKind: ViewKind) {
  const appState = {
    ...createXInitialState(),
    currentScreen: screen,
    viewMode: viewKind,
  };
  const world = {
    appInstances: { "phone:app_x": appState },
    capabilityState: {},
    devices: {},
    audio: createDefaultAudioState(),
  } as WorldState;

  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "phone",
    activeAppId: "app_x",
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

  const strat = xLayoutStrategies.find((s) => s.viewKind === viewKind);
  if (!strat) throw new Error(`Missing x layout strategy for ${viewKind}`);
  return strat.computeLayout(ctx) as any;
}

function expectHasSubjects(layout: any, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic.regions[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("X semantic subjects (layout-driven)", () => {
  it("timeline includes expected subjects", () => {
    const layout = computeLayoutFor("timeline", "FEED");
    expectHasSubjects(layout, [
      "device",
      "app",
      "nav_bar",
      "timeline_header",
      "timeline_tabs",
      "timeline_feed",
      "tweet_card",
      "timeline_primary_row",
      "timeline_primary_avatar",
      "timeline_primary_content",
      "timeline_primary_media",
      "metrics_row",
      "timeline_primary_actions",
      "compose_fab",
    ]);
  });

  it("notifications includes expected subjects", () => {
    const layout = computeLayoutFor("notifications", "FEED");
    expectHasSubjects(layout, [
      "device",
      "app",
      "nav_bar",
      "timeline_header",
      "notifications_list",
      "notifications_row_0",
      "notifications_row_0_avatar",
      "notifications_row_0_content",
    ]);
  });

  it("messages includes expected subjects", () => {
    const layout = computeLayoutFor("messages", "FEED");
    expectHasSubjects(layout, [
      "device",
      "app",
      "nav_bar",
      "timeline_header",
      "dm_thread",
      "dm_row_0",
      "dm_row_0_avatar",
      "dm_row_0_content",
    ]);
  });

  it("thread includes expected subjects", () => {
    const layout = computeLayoutFor("thread", "CHAT");
    expectHasSubjects(layout, [
      "device",
      "app",
      "thread_header",
      "dm_thread",
      "dm_message_latest",
      "reply_composer",
      "reply_input",
      "reply_send_button",
    ]);
  });

  it("compose includes expected subjects", () => {
    const layout = computeLayoutFor("compose", "FULLSCREEN");
    expectHasSubjects(layout, [
      "device",
      "app",
      "compose_header",
      "reply_composer",
      "compose_editor",
      "compose_footer",
    ]);
  });

  it("tweet detail includes focused detail subjects", () => {
    const layout = computeLayoutFor("tweet", "FEED");
    expectHasSubjects(layout, [
      "device",
      "app",
      "timeline_header",
      "tweet_card",
      "tweet_detail_header",
      "tweet_detail_body",
      "tweet_detail_media",
      "tweet_detail_quote",
      "metrics_row",
      "reply_composer",
    ]);
  });
});
