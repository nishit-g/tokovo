import type { ChatLayoutState, LayoutContext, SemanticRegion } from "@tokovo/core";
import { instagramSpacing } from "../config/tokens.js";
import { buildSemantic, rect } from "./shared.js";

export function computeInstagramChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: w, viewportHeight: h, appViewport } = ctx;
  const contentTop = appViewport.interactiveInsets.top;
  const contentBottom = appViewport.interactiveInsets.bottom;
  const headerH = contentTop + instagramSpacing.headerHeight;
  const composerH = instagramSpacing.composerHeight;
  const composerY = h - contentBottom - composerH;
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
      rect: rect(18, composerY - 110, w - 36, 64),
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
      rect: rect(16, composerY + 14, w - 110, 42),
      tags: ["composer", "input"],
    },
    reply_send_button: {
      id: "reply_send_button",
      rect: rect(w - 80, composerY + 14, 56, 42),
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
