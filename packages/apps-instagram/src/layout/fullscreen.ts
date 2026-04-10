import type { FullscreenLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import type { InstagramState } from "../runtime/state.js";
import { buildSemantic, rect } from "./shared.js";

export function computeInstagramFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h, world } = ctx;
  const state = (world.appState?.app_instagram ?? {}) as Partial<InstagramState>;
  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };

  if (state.currentScreen === "story") {
    regions.story_viewer = {
      id: "story_viewer",
      rect: rect(0, 0, w, h),
      tags: ["story", "viewer"],
    };
    regions.story_progress = {
      id: "story_progress",
      rect: rect(16, 14, w - 32, 8),
      tags: ["story", "progress"],
    };
    regions.story_reply_bar = {
      id: "story_reply_bar",
      rect: rect(16, h - 78, w - 32, 44),
      tags: ["story", "reply"],
    };
  } else {
    regions.composer_surface = {
      id: "composer_surface",
      rect: rect(0, 0, w, h),
      tags: ["composer", "surface"],
    };
    regions.composer_media = {
      id: "composer_media",
      rect: rect(16, 92, w - 32, Math.min(w - 32, h * 0.42)),
      tags: ["composer", "media"],
    };
    regions.composer_caption_input = {
      id: "composer_caption_input",
      rect: rect(16, h - 162, w - 32, 92),
      tags: ["composer", "caption"],
    };
  }

  return {
    kind: "FULLSCREEN",
    meta: {},
    semantic: buildSemantic(regions),
  };
}
