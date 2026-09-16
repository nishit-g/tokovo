import { xRouteShift, xLayoutCacheHint } from "../runtime/motion.js";
import { xComposerHeight } from "./measure.js";
import { xInputFields } from "../input-fields.js";
import type {
  ChatLayoutState,
  ChatMessageLayout,
  LayoutContext,
  SemanticRegion,
} from "@tokovo/core";
import { projectXThread } from "./project.js";
import { requireUser, selectActiveThread, selectThreadMessages } from "../runtime/selectors.js";
import { rect, region, resolveXLayoutEnvironment, semantic } from "./shared.js";

export function computeXChatLayout(ctx: LayoutContext): ChatLayoutState {
  const { viewportWidth: width, viewportHeight: height, appViewport } = ctx;
  const top = appViewport.interactiveInsets.top;
  const bottom = appViewport.interactiveInsets.bottom;
  const { state, experience } = resolveXLayoutEnvironment(ctx);
  const thread = selectActiveThread(ctx.world, ctx.activeDeviceId);
  if (ctx.activeConversationId && ctx.activeConversationId !== thread.id) {
    throw new Error(
      `X_CHAT_CONTEXT_MISMATCH: layout requested "${ctx.activeConversationId}" while route targets "${thread.id}"`,
    );
  }
  const messages = selectThreadMessages(ctx.world, ctx.activeDeviceId, thread.id);
  const composerHeight = xComposerHeight(
    ctx.inputValues?.[xInputFields.threadComposer(thread.id)] ??
      state.threadDrafts[thread.id] ??
      "",
    width,
    experience.text,
  );
  const headerY = top;
  const threadY = headerY + experience.metrics.headerHeight;
  const composerY = height - bottom - composerHeight;
  const threadHeight = Math.max(0, composerY - threadY);
  const projection = projectXThread({
    tokens: experience.text,
    frame: ctx.t,
    reducedMotion: experience.reducedMotion,
    state,
    threadId: thread.id,
    messages,
    width,
    viewportHeight: Math.max(
      0,
      threadHeight - 20 - (thread.typingUserIds.length ? experience.text.typingHeight : 0),
    ),
  });
  const regions: Record<string, SemanticRegion> = {};
  const groups: Record<string, string[]> = { message: [] };
  const messageLayouts: Record<string, ChatMessageLayout> = {};

  region(
    regions,
    "x.thread.header",
    rect(0, headerY, width, experience.metrics.headerHeight),
    ["thread", "header", "sticky"],
    { sticky: true },
  );
  region(regions, "x.thread.messages", rect(0, threadY, width, threadHeight), [
    "thread",
    "messages",
  ]);
  region(
    regions,
    "x.thread.composer",
    rect(0, composerY, width, composerHeight),
    ["thread", "composer", "sticky"],
    { sticky: true },
  );

  for (const item of projection.visibleItems) {
    const self = item.message.senderId === state.currentUserId;
    requireUser(state, item.message.senderId, `message "${item.id}" senderId`);
    const bubbleX = self ? width - 12 - item.bubbleWidth : 44;
    const bubbleY = threadY + 12 + item.y - projection.viewportStart;
    const bubbleRect = rect(bubbleX, bubbleY, item.bubbleWidth, item.height);
    messageLayouts[item.id] = {
      id: item.id,
      y: bubbleY,
      height: item.height,
      opacity: 1,
      translateY: 0,
      translateX: 0,
      rect: bubbleRect,
    };
    const id = `x.dm.${thread.id}.message.${item.id}`;
    region(regions, id, bubbleRect, ["dm", "message", self ? "outgoing" : "incoming"], {
      entityType: "message",
      entityId: item.id,
      entityRegion: "bubble",
      threadId: thread.id,
    });
    groups.message.push(id);
  }

  if (thread.typingUserIds.length > 0) {
    region(regions, "x.thread.typing", rect(44, composerY - 44, 54, 36), ["thread", "typing"]);
  }

  return {
    kind: "CHAT",
    cacheHint: xLayoutCacheHint(
      state,
      ctx.t,
      experience.motion.routeFrames,
      experience.reducedMotion,
    ),
    scrollY: state.scroll.threadFromBottomById[thread.id],
    contentHeight: projection.contentHeight,
    isAtBottom: (state.scroll.threadFromBottomById[thread.id] ?? 0) === 0,
    messageLayouts,
    meta: {
      lastMessageId: projection.visibleItems.at(-1)?.id,
      isGroupChat: thread.participantIds.length > 2,
    },
    semantic: semantic(regions, groups, {
      width,
      height,
      rtl: experience.direction === "rtl",
      shiftX: xRouteShift(
        state,
        ctx.t,
        width,
        experience.motion.routeFrames,
        experience.direction === "rtl",
      ),
    }),
  };
}
