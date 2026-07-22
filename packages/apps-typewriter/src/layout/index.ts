import type {
  FullscreenLayoutState,
  LayoutContext,
  LayoutRect,
  PluginLayoutStrategy,
  SemanticRegion,
} from "@tokovo/core";

import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterState } from "../runtime/state.js";
import { resolveTypewriterTheme } from "../theme/resolve.js";
import { computeTypewriterGeometry } from "./geometry.js";

function region(id: string, rect: LayoutRect, tags: string[]): SemanticRegion {
  return { id, rect, tags };
}

export function computeTypewriterFullscreenLayout(
  ctx: LayoutContext,
): FullscreenLayoutState {
  const dimensions = {
    width: ctx.viewportWidth,
    height: ctx.viewportHeight,
  };
  const state = ctx.world.appState?.[TYPEWRITER_APP_ID] as
    | TypewriterState
    | undefined;
  const theme = resolveTypewriterTheme({
    config: state?.theme,
    video: dimensions,
  });
  const geometry = computeTypewriterGeometry(dimensions, theme);
  const cursor = {
    x: geometry.textArea.x + theme.text.charWidthPx * (state?.cursor?.col ?? 0),
    y:
      geometry.textArea.y + theme.text.lineHeightPx * (state?.cursor?.row ?? 0),
    width: Math.max(2, theme.text.charWidthPx * 0.9),
    height: Math.max(2, theme.text.lineHeightPx * 0.9),
  };
  const signature = {
    x: geometry.textArea.x,
    y:
      geometry.textArea.y +
      geometry.textArea.height -
      theme.text.lineHeightPx * 3.2,
    width: geometry.textArea.width,
    height: theme.text.lineHeightPx * 3.2,
  };
  const regions: Record<string, SemanticRegion> = {
    desk: region("desk", geometry.desk, ["app", "background"]),
    paper: region("paper", geometry.paper, ["paper", "document"]),
    page_1: region("page_1", geometry.paper, ["paper", "page"]),
    page_2: region(
      "page_2",
      { ...geometry.paper, x: geometry.paper.x + 4, y: geometry.paper.y + 10 },
      ["paper", "page", "stack"],
    ),
    page_3: region(
      "page_3",
      { ...geometry.paper, x: geometry.paper.x + 10, y: geometry.paper.y + 18 },
      ["paper", "page", "stack"],
    ),
    textArea: region("textArea", geometry.textArea, ["text", "document"]),
    cursor: region("cursor", cursor, ["text", "cursor", "dynamic"]),
    typewriter: region("typewriter", geometry.typewriter, [
      "machine",
      "foreground",
    ]),
    signature: region("signature", signature, ["text", "signature"]),
  };

  return {
    kind: "FULLSCREEN",
    semantic: {
      regions,
      groups: { document: ["paper", "textArea", "signature"] },
    },
    meta: {
      viewportWidth: dimensions.width,
      viewportHeight: dimensions.height,
    },
  };
}

export const typewriterLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FULLSCREEN", computeLayout: computeTypewriterFullscreenLayout },
];
