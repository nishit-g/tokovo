import type { MutableHandlerRegistry } from "./registry.js";
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
    if (
      (screen === "chat" || screen === "profile") &&
      !targetConversationId
    ) {
      throw new Error(
        `WhatsApp ${screen} navigation requires a conversationId`,
      );
    }
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
      ctx.state.threadViewport = ctx.conversation.unreadDividerMessageId
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
