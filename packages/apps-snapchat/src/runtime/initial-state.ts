import type { SnapchatState } from "../types/index.js";

export function createSnapchatInitialState(): SnapchatState {
    return {
        viewMode: "FEED",
        conversationId: undefined,
        currentScreen: "chat_list",
        activeConversationId: undefined,
        conversations: {},
    };
}
