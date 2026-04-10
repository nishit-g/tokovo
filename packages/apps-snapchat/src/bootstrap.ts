import type { PluginBootstrapContract } from "@tokovo/core";
import type { SnapchatConversation, SnapchatMessage, SnapchatScreen, SnapchatState } from "./types/index.js";

export interface SnapchatSnapshotConversation
  extends Omit<SnapchatConversation, "messages" | "typing" | "lastMessageAt" | "lastSnapAt"> {
  messages?: SnapchatMessage[];
  typing?: Record<string, boolean>;
}

export interface SnapchatSnapshot {
  conversations?: SnapchatSnapshotConversation[];
}

export interface SnapchatInitialView {
  screen: SnapchatScreen;
  conversationId?: string;
  snapId?: string;
}

function hydrateConversation(
  conversation: SnapchatSnapshotConversation,
): SnapchatConversation {
  const messages = [...(conversation.messages ?? [])].sort(
    (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
  );
  const snapMessages = messages.filter((message) => message.kind === "snap");
  return {
    ...conversation,
    participants: [...conversation.participants],
    messages,
    typing: { ...(conversation.typing ?? {}) },
    unreadCount: conversation.unreadCount ?? 0,
    isGroup: conversation.isGroup ?? false,
    pinned: conversation.pinned ?? false,
    muted: conversation.muted ?? false,
    lastMessageAt: messages[messages.length - 1]?.timestamp,
    lastSnapAt: snapMessages[snapMessages.length - 1]?.timestamp,
  };
}

export const snapchatBootstrap: PluginBootstrapContract<"app_snapchat"> = {
  hydrate(context): SnapchatState {
    const snapshot = context.snapshot?.snapshot as SnapchatSnapshot | undefined;
    const initialView = context.initialView?.view as SnapchatInitialView | undefined;
    const state: SnapchatState = {
      ...(context.baseState as SnapchatState),
      conversations: Object.fromEntries(
        (snapshot?.conversations ?? []).map((conversation) => [
          conversation.id,
          hydrateConversation(conversation),
        ]),
      ),
      drafts: {},
      lastNavFrame: 0,
    };

    if (initialView) {
      state.currentScreen = initialView.screen;
      state.activeConversationId = initialView.conversationId;
      state.activeSnapId = initialView.snapId;
      state.viewMode =
        initialView.screen === "chat"
          ? "CHAT"
          : initialView.screen === "snap_view"
            ? "FULLSCREEN"
            : "FEED";
      state.conversationId =
        initialView.screen === "chat" ? initialView.conversationId : undefined;
    }

    return state;
  },
};
