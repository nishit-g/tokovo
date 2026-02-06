import { getGlobalWhatsAppHandlerRegistry } from "./registry";
import type { MutableHandlerRegistry } from "./registry";
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
} from "../schemas";

export function registerConversationHandlers(
  registry: MutableHandlerRegistry = getGlobalWhatsAppHandlerRegistry(),
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
    const screen = e.payload?.screen ?? e.screen;
    const appState = ctx.draft.appState?.["app_whatsapp"];
    if (appState && typeof screen === "string") {
      (appState as { currentScreen?: string }).currentScreen = screen;
    }
  });

  registry.registerHandler<ConversationOpenedEvent>("ConversationOpened", (ctx, e) => {
    const conversationId = e.payload?.conversationId ?? e.conversationId;
    const appState = ctx.draft.appState?.["app_whatsapp"];
    if (appState && conversationId) {
      (appState as { currentConversationId?: string }).currentConversationId =
        conversationId;
    }
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
