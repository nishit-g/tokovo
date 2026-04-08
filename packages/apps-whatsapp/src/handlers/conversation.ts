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
  registry.registerHandler<PinConversationEvent>("PinConversation", (ctx) => {
    ctx.conversation.isPinned = true;
  });

  registry.registerHandler<UnpinConversationEvent>("UnpinConversation", (ctx) => {
    ctx.conversation.isPinned = false;
  });

  registry.registerHandler<MuteConversationEvent>("MuteConversation", (ctx, e) => {
    ctx.conversation.isMuted = true;
    ctx.conversation.mutedUntil = e.payload?.until;
  });

  registry.registerHandler<UnmuteConversationEvent>("UnmuteConversation", (ctx) => {
    ctx.conversation.isMuted = false;
    ctx.conversation.mutedUntil = undefined;
  });

  registry.registerHandler<ArchiveConversationEvent>("ArchiveConversation", (ctx) => {
    ctx.conversation.isArchived = true;
  });

  registry.registerHandler<UnarchiveConversationEvent>(
    "UnarchiveConversation",
    (ctx) => {
      ctx.conversation.isArchived = false;
    },
  );

  registry.registerHandler<SetDraftEvent>("SetDraft", (ctx, e) => {
    ctx.conversation.draftText = e.payload?.text;
  });

  registry.registerHandler<NavigateScreenEvent>("NavigateScreen", (ctx, e) => {
    const rawScreen = e.payload?.screen ?? e.screen;
    const screen = rawScreen === "status" ? "updates" : rawScreen;
    const appState = ctx.draft.appState?.["app_whatsapp"];
    if (appState && typeof screen === "string") {
      (appState as { currentScreen?: string }).currentScreen = screen;
      // Keep LayoutEngine invariants in sync.
      (appState as { viewMode?: "CHAT" | "FEED" | "FULLSCREEN" | "TRANSITION" }).viewMode =
        screen === "chat" ? "CHAT" : "FEED";
      if (screen !== "chat") {
        (appState as { conversationId?: string }).conversationId = undefined;
        (appState as { currentConversationId?: string }).currentConversationId =
          undefined;
      }
    }
  });

  registry.registerHandler<ConversationOpenedEvent>("ConversationOpened", (ctx, e) => {
    const conversationId = e.payload?.conversationId ?? e.conversationId;
    const appState = ctx.draft.appState?.["app_whatsapp"];
    if (appState && conversationId) {
      (appState as { currentConversationId?: string }).currentConversationId =
        conversationId;
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
    ctx.conversation.unreadCount = 0;
  });

  registry.registerHandler<ReadMessagesEvent>("ReadMessages", (ctx, e) => {
    const count = e.payload?.count ?? ctx.conversation.unreadCount ?? 0;
    if (ctx.conversation.unreadCount !== undefined) {
      ctx.conversation.unreadCount = Math.max(
        0,
        ctx.conversation.unreadCount - count,
      );
    }
  });
}
