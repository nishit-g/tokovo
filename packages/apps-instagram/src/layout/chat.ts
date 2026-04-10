import type { ChatLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import { instagramSpacing } from "../config/tokens.js";
import { buildSemantic, createPx, rect } from "./shared.js";

export function computeInstagramChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
  const safeTop = safeAreaInsets?.top ?? 0;
  const safeBottom = safeAreaInsets?.bottom ?? 0;
  const px = createPx(w);
  const headerH = safeTop + px(instagramSpacing.headerHeight);
  const composerH = px(instagramSpacing.composerHeight);
  const composerY = h - safeBottom - composerH;
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
      rect: rect(0, headerH, w, composerY - headerH),
      tags: ["dm", "thread"],
    },
    dm_message_latest: {
      id: "dm_message_latest",
      rect: rect(px(18), composerY - px(110), w - px(36), px(64)),
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
      rect: rect(px(16), composerY + px(14), w - px(110), px(42)),
      tags: ["composer", "input"],
    },
    reply_send_button: {
      id: "reply_send_button",
      rect: rect(w - px(80), composerY + px(14), px(56), px(42)),
      tags: ["composer", "send"],
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
