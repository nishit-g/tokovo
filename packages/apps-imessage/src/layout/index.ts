import type {
  ChatLayoutState,
  FeedLayoutState,
  FullscreenLayoutState,
  LayoutContext,
  LayoutRect,
  PluginLayoutStrategy,
  SemanticRegion,
} from "@tokovo/core";

import type { IMessageState } from "../types";
import { iMessageSpacing } from "../config/tokens";

const DESIGN_WIDTH = 393;

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function buildSemantic(
  regions: Record<string, SemanticRegion>,
  groups: Record<string, string[]> = {},
) {
  return { regions, groups };
}

function computeIMessageFeedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets, world } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const state = (world.appState?.app_imessage ?? {}) as Partial<IMessageState>;
  const screen = state.currentScreen ?? "list";

  const headerH = safeTop + px(iMessageSpacing.headerHeight);
  const listY = headerH;
  const listH = Math.max(0, h - safeBottom - listY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };

  if (screen === "list") {
    regions.imessage_list_header = {
      id: "imessage_list_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.imessage_list = {
      id: "imessage_list",
      rect: rect(0, listY, w, listH),
      tags: ["list"],
    };
  } else {
    // Defensive: if state/viewMode mismatched, still emit list anchors.
    regions.imessage_list_header = {
      id: "imessage_list_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    };
    regions.imessage_list = {
      id: "imessage_list",
      rect: rect(0, listY, w, listH),
      tags: ["list"],
    };
  }

  return {
    kind: "FEED",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeIMessageChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const headerH = safeTop + px(iMessageSpacing.headerHeight);
  const composerH = px(iMessageSpacing.inputHeight) + safeBottom;
  const composerY = Math.max(0, h - composerH);
  const threadY = headerH;
  const threadH = Math.max(0, composerY - threadY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    imessage_thread: {
      id: "imessage_thread",
      rect: rect(0, threadY, w, threadH),
      tags: ["thread"],
    },
    imessage_composer: {
      id: "imessage_composer",
      rect: rect(0, composerY, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    },
  };

  return {
    kind: "CHAT",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: true,
    messageLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}

function computeIMessageFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets, world } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / DESIGN_WIDTH;
  const px = (v: number) => v * scale;

  const state = (world.appState?.app_imessage ?? {}) as Partial<IMessageState>;
  const screen = state.currentScreen ?? "info";

  const topY = safeTop + px(iMessageSpacing.headerHeight);
  const contentH = Math.max(0, h - topY - safeBottom);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
  };

  if (screen === "media") {
    regions.imessage_media = {
      id: "imessage_media",
      rect: rect(0, topY, w, contentH),
      tags: ["media"],
    };
  } else {
    regions.imessage_info = {
      id: "imessage_info",
      rect: rect(0, topY, w, contentH),
      tags: ["info"],
    };
  }

  return {
    kind: "FULLSCREEN",
    meta: {},
    semantic: buildSemantic(regions),
  };
}

export const iMessageLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeIMessageFeedLayout },
  { viewKind: "CHAT", computeLayout: computeIMessageChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeIMessageFullscreenLayout },
];
