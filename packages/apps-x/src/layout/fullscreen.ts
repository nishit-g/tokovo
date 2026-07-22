import type { FullscreenLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import { rect, region, resolveXLayoutEnvironment, semantic } from "./shared.js";

export function computeXFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: width, viewportHeight: height, appViewport } = ctx;
  const top = appViewport.interactiveInsets.top;
  const bottom = appViewport.interactiveInsets.bottom;
  const { state } = resolveXLayoutEnvironment(ctx);
  if (state.route.screen !== "compose") {
    throw new Error(`X_FULLSCREEN_SCREEN_UNSUPPORTED: "${state.route.screen}"`);
  }
  const headerHeight = 58;
  const actionsHeight = 54;
  const audienceHeight = 43;
  const actionsY = height - bottom - actionsHeight;
  const audienceY = actionsY - audienceHeight;
  const editorY = top + headerHeight + 10;
  const regions: Record<string, SemanticRegion> = {};
  region(regions, "x.compose.header", rect(0, top, width, headerHeight), ["compose", "header", "sticky"], { sticky: true });
  region(regions, "x.composer.editor", rect(16, editorY, width - 32, Math.max(0, audienceY - editorY)), ["compose", "editor"]);
  region(regions, "x.composer.audience", rect(16, audienceY, width - 32, audienceHeight), ["compose", "audience"]);
  region(regions, "x.composer.actions", rect(0, actionsY, width, actionsHeight), ["compose", "actions", "sticky"], { sticky: true });
  return {
    kind: "FULLSCREEN",
    cacheHint: "static",
    meta: { draftLength: Array.from(state.composer.draft).length, composerStatus: state.composer.status },
    semantic: semantic(regions),
  };
}
