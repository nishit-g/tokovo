import { describe, expect, it } from "vitest";
import type { LayoutContext, ViewKind, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { instagramLayoutStrategies } from "../layout/index.js";
import { createInstagramInitialState, type InstagramState } from "../runtime/state.js";

function computeLayoutFor(screen: InstagramState["currentScreen"], viewKind: ViewKind) {
  const appState = { ...createInstagramInitialState(), currentScreen: screen, viewMode: viewKind };
  const world = {
    appState: { app_instagram: appState },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "phone",
    activeAppId: "app_instagram",
    viewKind,
    viewportWidth: 393,
    viewportHeight: 852,
    safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    layoutCache: undefined,
  };
  const strategy = instagramLayoutStrategies.find((item) => item.viewKind === viewKind);
  if (!strategy) throw new Error(`missing strategy ${viewKind}`);
  return strategy.computeLayout(ctx) as { semantic?: { regions?: Record<string, unknown> } };
}

function expectRegions(layout: { semantic?: { regions?: Record<string, unknown> } }, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic?.regions?.[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("instagram semantic anchors", () => {
  it("home feed exposes feed anchors", () => {
    expectRegions(computeLayoutFor("home", "FEED"), [
      "home_header",
      "stories_tray",
      "feed_list",
      "feed_post_0",
      "feed_post_0_media",
      "feed_post_0_actions",
      "bottom_nav",
    ]);
  });

  it("story viewer exposes immersive anchors", () => {
    expectRegions(computeLayoutFor("story", "FULLSCREEN"), [
      "story_viewer",
      "story_progress",
      "story_reply_bar",
    ]);
  });

  it("thread exposes composer anchors", () => {
    expectRegions(computeLayoutFor("thread", "CHAT"), [
      "thread_header",
      "dm_thread",
      "reply_input",
      "reply_send_button",
    ]);
  });
});
