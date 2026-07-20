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
import type { WhatsAppState } from "../types/index.js";

export function registerConversationHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<PinConversationEvent>("PIN_CONVERSATION", (ctx) => {
    ctx.conversation.isPinned = true;
  });

  registry.registerHandler<UnpinConversationEvent>("UNPIN_CONVERSATION", (ctx) => {
    ctx.conversation.isPinned = false;
  });

  registry.registerHandler<MuteConversationEvent>("MUTE_CONVERSATION", (ctx, e) => {
    ctx.conversation.isMuted = true;
    ctx.conversation.mutedUntil = e.payload.until;
  });

  registry.registerHandler<UnmuteConversationEvent>("UNMUTE_CONVERSATION", (ctx) => {
    ctx.conversation.isMuted = false;
    ctx.conversation.mutedUntil = undefined;
  });

  registry.registerHandler<ArchiveConversationEvent>("ARCHIVE_CONVERSATION", (ctx) => {
    ctx.conversation.isArchived = true;
  });

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
    const appState = ctx.draft.appState?.["app_whatsapp"];
    if (appState) {
      const targetConversationId = e.payload.conversationId;
      if ((screen === "chat" || screen === "profile") && !targetConversationId) {
        throw new Error(
          `WhatsApp ${screen} navigation requires a conversationId`,
        );
      }
      (appState as { currentScreen?: string }).currentScreen = screen;
      // Keep LayoutEngine invariants in sync.
      (appState as { viewMode?: "CHAT" | "FEED" | "FULLSCREEN" | "TRANSITION" }).viewMode =
        screen === "chat" ? "CHAT" : "FEED";
      if (screen === "chat") {
        (appState as { conversationId?: string }).conversationId =
          targetConversationId;
      } else if (screen === "profile") {
        (appState as { conversationId?: string }).conversationId =
          targetConversationId;
      } else {
        (appState as { conversationId?: string }).conversationId = undefined;
      }
    }
  });

  registry.registerHandler<ConversationOpenedEvent>("CONVERSATION_OPENED", (ctx, e) => {
    const conversationId = e.payload.conversationId;
    const appState = ctx.draft.appState?.["app_whatsapp"];
    if (appState && conversationId) {
      (appState as { conversationId?: string }).conversationId = conversationId;
      (appState as { currentScreen?: string }).currentScreen = "chat";
      (appState as { viewMode?: "CHAT" | "FEED" | "FULLSCREEN" | "TRANSITION" }).viewMode =
        "CHAT";
    }
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
    if (appState) {
      const state = appState as WhatsAppState;
      state.threadViewport = ctx.conversation.unreadDividerMessageId
        ? {
            conversationId,
            anchorMessageId: ctx.conversation.unreadDividerMessageId,
            reason: "unread",
          }
        : null;
    }
    ctx.conversation.unreadCount = 0;
  });

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
