import type { FullscreenLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import { xSpacing } from "../config/tokens.js";
import { buildSemantic, createPx, rect } from "./shared.js";

export function computeXFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h, appViewport } = ctx;
  const contentTop = appViewport.contentInsets.top;
  const contentBottom = appViewport.contentInsets.bottom;
  const px = createPx(w);
  const headerH = contentTop + px(xSpacing.headerHeight);
  const bodyH = Math.max(0, h - headerH - contentBottom);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    compose_header: {
      id: "compose_header",
      rect: rect(0, 0, w, headerH),
      tags: ["compose", "header", "sticky"],
      metadata: { sticky: true },
    },
    reply_composer: {
      id: "reply_composer",
      rect: rect(0, headerH, w, bodyH),
      tags: ["compose"],
    },
    compose_editor: {
      id: "compose_editor",
      rect: rect(
        px(xSpacing.screenPadding),
        headerH + px(12),
        w - px(xSpacing.screenPadding) * 2,
        Math.max(0, bodyH - px(88)),
      ),
      tags: ["compose", "editor"],
    },
    compose_footer: {
      id: "compose_footer",
      rect: rect(
        px(xSpacing.screenPadding),
        h - contentBottom - px(56),
        w - px(xSpacing.screenPadding) * 2,
        px(44),
      ),
      tags: ["compose", "footer"],
    },
  };

  return {
    kind: "FULLSCREEN",
    cacheHint: "static",
    meta: {},
    semantic: buildSemantic(regions),
  };
}
