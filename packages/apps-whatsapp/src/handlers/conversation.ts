import { registerHandler } from "./registry";
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

registerHandler<PinConversationEvent>("PinConversation", (ctx) => {
  ctx.conversation.isPinned = true;
});

registerHandler<UnpinConversationEvent>("UnpinConversation", (ctx) => {
  ctx.conversation.isPinned = false;
});

registerHandler<MuteConversationEvent>("MuteConversation", (ctx, e) => {
  ctx.conversation.isMuted = true;
  ctx.conversation.mutedUntil = e.payload?.until;
});

registerHandler<UnmuteConversationEvent>("UnmuteConversation", (ctx) => {
  ctx.conversation.isMuted = false;
  ctx.conversation.mutedUntil = undefined;
});

registerHandler<ArchiveConversationEvent>("ArchiveConversation", (ctx) => {
  ctx.conversation.isArchived = true;
});

registerHandler<UnarchiveConversationEvent>("UnarchiveConversation", (ctx) => {
  ctx.conversation.isArchived = false;
});

registerHandler<SetDraftEvent>("SetDraft", (ctx, e) => {
  ctx.conversation.draftText = e.payload?.text;
});

registerHandler<NavigateScreenEvent>("NavigateScreen", (ctx, e) => {
  const screen = e.payload?.screen ?? e.screen;
  const appState = ctx.draft.appState?.["app_whatsapp"];
  if (appState && typeof screen === "string") {
    (appState as { currentScreen?: string }).currentScreen = screen;
  }
});

registerHandler<ConversationOpenedEvent>("ConversationOpened", (ctx, e) => {
  const conversationId = e.payload?.conversationId ?? e.conversationId;
  const appState = ctx.draft.appState?.["app_whatsapp"];
  if (appState && conversationId) {
    (appState as { currentConversationId?: string }).currentConversationId =
      conversationId;
  }
});

registerHandler<ReadMessagesEvent>("ReadMessages", (ctx, e) => {
  const count = e.payload?.count ?? ctx.conversation.unreadCount ?? 0;
  if (ctx.conversation.unreadCount !== undefined) {
    ctx.conversation.unreadCount = Math.max(
      0,
      ctx.conversation.unreadCount - count,
    );
  }
});
