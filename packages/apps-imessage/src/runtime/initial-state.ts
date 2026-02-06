import type { IMessageState } from "../types/index.js";

export function createIMessageInitialState(): IMessageState {
  return {
    viewMode: "FEED",
    conversationId: undefined,
    currentScreen: "list",
    activeConversationId: undefined,
    statusBarTheme: "dark",
    conversations: {},
  };
}
