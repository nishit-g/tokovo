import type { ChatLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import { xSpacing } from "../config/tokens.js";
import { buildSemantic, createPx, rect } from "./shared.js";

export function computeXChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const px = createPx(w);

  const headerH = safeTop + px(xSpacing.headerHeight);
  const composerH = px(112);
  const composerY = Math.max(0, h - safeBottom - composerH);
  const threadY = headerH;
  const threadH = Math.max(0, composerY - threadY);

  const regions: Record<string, SemanticRegion> = {
    device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
    app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
    thread_header: {
      id: "thread_header",
      rect: rect(0, 0, w, headerH),
      tags: ["header", "sticky"],
      metadata: { sticky: true },
    },
    dm_thread: {
      id: "dm_thread",
      rect: rect(0, threadY, w, threadH),
      tags: ["dm", "thread"],
    },
    dm_message_latest: {
      id: "dm_message_latest",
      rect: rect(px(xSpacing.screenPadding), threadY + Math.max(0, threadH - px(116)), w - px(xSpacing.screenPadding) * 2, px(72)),
      tags: ["dm", "message", "latest"],
    },
    reply_composer: {
      id: "reply_composer",
      rect: rect(0, composerY, w, composerH),
      tags: ["composer", "sticky"],
      metadata: { sticky: true },
    },
    reply_input: {
      id: "reply_input",
      rect: rect(px(xSpacing.screenPadding), composerY + px(16), w - px(xSpacing.screenPadding) * 2 - px(68), px(44)),
      tags: ["composer", "input"],
    },
    reply_send_button: {
      id: "reply_send_button",
      rect: rect(w - px(xSpacing.screenPadding) - px(56), composerY + px(16), px(56), px(44)),
      tags: ["composer", "send"],
    },
  };

  return {
    kind: "CHAT",
    cacheHint: "static",
    scrollY: 0,
    contentHeight: h,
    isAtBottom: true,
    messageLayouts: {},
    meta: {},
    semantic: buildSemantic(regions),
  };
}
