import type { MutableHandlerRegistry } from "./registry.js";
import type { WhatsAppState } from "../types/index.js";
import { selectScreenScroll } from "../runtime/selectors.js";

function dismissTransientSurfaces(state: WhatsAppState): void {
  state.activeGesture = null;
  state.mediaViewer = null;
  state.closingMediaViewer = undefined;
  state.statusViewer = null;
}

function beginNavigation(
  state: WhatsAppState,
  screen: NonNullable<WhatsAppState["currentScreen"]>,
  conversationId: string | undefined,
  at: number,
): void {
  const previous = state.currentScreen ?? "chats";
  if (previous === screen && state.conversationId === conversationId) return;
  if (state.conversationId) {
    state.savedThreadViewports ??= {};
    state.savedReplyDrafts ??= {};
    if (state.threadViewport?.conversationId === state.conversationId)
      state.savedThreadViewports[state.conversationId] = state.threadViewport;
    if (state.replyComposer?.conversationId === state.conversationId)
      state.savedReplyDrafts[state.conversationId] = state.replyComposer;
  }
  if (conversationId) {
    state.threadViewport = state.savedThreadViewports?.[conversationId] ?? null;
    state.replyComposer = state.savedReplyDrafts?.[conversationId] ?? null;
  }
  const depth = (value: string) =>
    value === "profile" ? 2 : value === "chat" ? 1 : 0;
  state.navigation = {
    at,
    fromScreen: previous,
    fromConversationId: state.conversationId,
    direction:
      depth(screen) > depth(previous)
        ? "push"
        : depth(screen) < depth(previous)
          ? "pop"
          : "tab",
  };
}
import type {
  PinConversationEvent,
  UnpinConversationEvent,
  MuteConversationEvent,
  UnmuteConversationEvent,
  ArchiveConversationEvent,
  UnarchiveConversationEvent,
  SetDraftEvent,
  NavigateScreenEvent,
  ConversationOpenedEvent,
  ReadMessagesEvent,
} from "../schemas/index.js";

export function registerConversationHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<PinConversationEvent>("PIN_CONVERSATION", (ctx) => {
    ctx.conversation.isPinned = true;
  });

  registry.registerHandler<UnpinConversationEvent>(
    "UNPIN_CONVERSATION",
    (ctx) => {
      ctx.conversation.isPinned = false;
    },
  );

  registry.registerHandler<MuteConversationEvent>(
    "MUTE_CONVERSATION",
    (ctx, e) => {
      ctx.conversation.isMuted = true;
      ctx.conversation.mutedUntil = e.payload.until;
    },
  );

  registry.registerHandler<UnmuteConversationEvent>(
    "UNMUTE_CONVERSATION",
    (ctx) => {
      ctx.conversation.isMuted = false;
      ctx.conversation.mutedUntil = undefined;
    },
  );

  registry.registerHandler<ArchiveConversationEvent>(
    "ARCHIVE_CONVERSATION",
    (ctx) => {
      ctx.conversation.isArchived = true;
    },
  );

  registry.registerHandler<UnarchiveConversationEvent>(
    "UNARCHIVE_CONVERSATION",
    (ctx) => {
      ctx.conversation.isArchived = false;
    },
  );

  registry.registerHandler<SetDraftEvent>("SET_DRAFT", (ctx, e) => {
    ctx.conversation.draftText = e.payload.text;
  });

  registry.registerHandler<NavigateScreenEvent>("NAVIGATE_SCREEN", (ctx, e) => {
    const screen = e.payload.screen;
    const targetConversationId = e.payload.conversationId;
    if (e.payload.scroll) {
      if (screen === "chat")
        throw new Error(
          "WhatsApp chat scrolling uses semantic message targets",
        );
      const from = selectScreenScroll(ctx.state, e.at, screen);
      ctx.state.screenScroll ??= {};
      ctx.state.screenScroll[screen] = {
        at: e.at,
        from,
        to: e.payload.scroll.offset,
        durationFrames: e.payload.scroll.durationFrames,
      };
    }
    if ((screen === "chat" || screen === "profile") && !targetConversationId) {
      throw new Error(
        `WhatsApp ${screen} navigation requires a conversationId`,
      );
    }
    beginNavigation(ctx.state, screen, targetConversationId, e.at);
    dismissTransientSurfaces(ctx.state);
    ctx.state.currentScreen = screen;
    ctx.state.viewMode = screen === "chat" ? "CHAT" : "FEED";
    ctx.state.conversationId =
      screen === "chat" || screen === "profile"
        ? targetConversationId
        : undefined;
  });

  registry.registerHandler<ConversationOpenedEvent>(
    "CONVERSATION_OPENED",
    (ctx, e) => {
      const conversationId = e.payload.conversationId;
      beginNavigation(ctx.state, "chat", conversationId, e.at);
      dismissTransientSurfaces(ctx.state);
      ctx.state.conversationId = conversationId;
      ctx.state.currentScreen = "chat";
      ctx.state.viewMode = "CHAT";
      if (
        !ctx.conversation.unreadDividerMessageId &&
        (ctx.conversation.unreadCount ?? 0) > 0
      ) {
        let remainingUnread = ctx.conversation.unreadCount ?? 0;
        for (let i = ctx.conversation.messages.length - 1; i >= 0; i--) {
          const message = ctx.conversation.messages[i];
          if (message.type === "system" || message.from === "me") continue;
          remainingUnread -= 1;
          if (remainingUnread <= 0) {
            ctx.conversation.unreadDividerMessageId = message.id;
            break;
          }
        }
      }
      ctx.state.threadViewport =
        ctx.state.threadViewport?.conversationId === conversationId
          ? ctx.state.threadViewport
          : (ctx.conversation.unreadCount ?? 0) > 0 &&
              ctx.conversation.unreadDividerMessageId
            ? {
                conversationId,
                focusMessageId: ctx.conversation.unreadDividerMessageId,
                reason: "unread",
              }
            : null;
      ctx.conversation.unreadCount = 0;
    },
  );

  registry.registerHandler<ReadMessagesEvent>("READ", (ctx, e) => {
    const count = e.payload.count ?? ctx.conversation.unreadCount ?? 0;
    if (ctx.conversation.unreadCount !== undefined) {
      ctx.conversation.unreadCount = Math.max(
        0,
        ctx.conversation.unreadCount - count,
      );
    }
  });
}
