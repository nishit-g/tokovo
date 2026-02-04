import type { IMessageState } from "../types";

export function createIMessageInitialState(): IMessageState {
  return {
    currentScreen: "list",
    activeConversationId: undefined,
    statusBarTheme: "dark",
    conversations: {},
  };
}
