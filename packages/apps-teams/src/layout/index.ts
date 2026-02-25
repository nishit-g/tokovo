import type {
  ChatLayoutState,
  FeedLayoutState,
  FullscreenLayoutState,
  LayoutContext,
  LayoutRect,
  PluginLayoutStrategy,
  SemanticRegion,
} from "@tokovo/core";
import { TEAMS_DEFAULT_DEVICE_WIDTH } from "../constants.js";
import { TeamsLayoutConfig } from "../config/layout.js";

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function semantic(regions: Record<string, SemanticRegion>) {
  return { regions, groups: {} };
}

function feedLayout(ctx: LayoutContext): FeedLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const top = safeAreaInsets?.top ?? 0;
  const bottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / TEAMS_DEFAULT_DEVICE_WIDTH;
  const headerH = Math.round(60 * scale + top);
  const bodyH = Math.max(0, h - headerH - bottom);

  return {
    kind: "FEED",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: false,
    itemLayouts: {},
    meta: {},
    semantic: semantic({
      device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
      app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
      teams_header: { id: "teams_header", rect: rect(0, 0, w, headerH), tags: ["header", "sticky"] },
      teams_chat_list: { id: "teams_chat_list", rect: rect(0, headerH, w, bodyH), tags: ["list"] },
    }),
  };
}

function chatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const top = safeAreaInsets?.top ?? 0;
  const bottom = safeAreaInsets?.bottom ?? 0;
  const scale = w / TEAMS_DEFAULT_DEVICE_WIDTH;

  const headerH = Math.round(52 * scale + top);
  const composerH = Math.round(54 * scale + bottom);
  const panelW = Math.max(TeamsLayoutConfig.thread.panelMinWidth, Math.round(w * 0.34));
  const threadY = headerH;
  const threadH = Math.max(0, h - composerH - headerH);

  return {
    kind: "CHAT",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: true,
    messageLayouts: {},
    meta: {},
    semantic: semantic({
      device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
      app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
      teams_header: { id: "teams_header", rect: rect(0, 0, w, headerH), tags: ["header", "sticky"] },
      teams_thread: { id: "teams_thread", rect: rect(0, threadY, w - panelW, threadH), tags: ["thread"] },
      teams_thread_panel: { id: "teams_thread_panel", rect: rect(w - panelW, threadY, panelW, threadH), tags: ["thread_panel"] },
      teams_composer: { id: "teams_composer", rect: rect(0, h - composerH, w, composerH), tags: ["composer", "sticky"] },
    }),
  };
}

function fullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
  const { viewportWidth: w, viewportHeight: h } = ctx;
  return {
    kind: "FULLSCREEN",
    meta: {},
    semantic: semantic({
      device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
      app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
      teams_call_status: { id: "teams_call_status", rect: rect(0, 0, w, TeamsLayoutConfig.callOverlay.height), tags: ["call_overlay", "sticky"] },
    }),
  };
}

export const teamsLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: feedLayout },
  { viewKind: "CHAT", computeLayout: chatLayout },
  { viewKind: "FULLSCREEN", computeLayout: fullscreenLayout },
];
