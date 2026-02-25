/**
 * Snapchat App State Types
 */

import type { SnapchatConversation } from "./conversation.js";
import type { ViewKind } from "@tokovo/core";

export type SnapchatScreen = "chat_list" | "chat" | "snap_view";

export interface SnapchatState {
    /** Required by the Tokovo LayoutEngine. */
    viewMode: ViewKind;
    /** Required when viewMode === "CHAT". */
    conversationId?: string;
    currentScreen?: SnapchatScreen;
    activeConversationId?: string;
    conversations?: Record<string, SnapchatConversation>;
    /** Currently viewing snap ID */
    activeSnapId?: string;
}

export function asSnapchatState(
    appState: Record<string, unknown>,
): SnapchatState | undefined {
    return appState?.app_snapchat as SnapchatState | undefined;
}
