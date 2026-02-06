/**
 * iMessage App State Types
 */

import type { IMessageConversation } from "./conversation.js";
import type { ViewKind } from "@tokovo/core";

export type IMessageScreen = "list" | "chat" | "info" | "media";

export type IMessageThemeMode = "light" | "dark";

export interface IMessageState {
  /** Required by the Tokovo LayoutEngine. */
  viewMode: ViewKind;
  /** Required when viewMode === "CHAT". */
  conversationId?: string;
  currentScreen?: IMessageScreen;
  activeConversationId?: string;
  themeMode?: IMessageThemeMode;
  statusBarTheme?:
  | "light"
  | "dark"
  | {
    backgroundColor?: string;
    iconColor?: string;
    timeColor?: string;
  };
  conversations?: Record<string, IMessageConversation>;
  /** Active search query */
  searchQuery?: string;
  /** Active screen effect (balloons, confetti, etc.) */
  activeScreenEffect?: "balloons" | "confetti" | "lasers" | "fireworks" | "celebration" | "echo" | "spotlight" | "love";
}

export function asIMessageState(
  appState: Record<string, unknown>,
): IMessageState | undefined {
  return (appState?.app_imessage || appState?.imessage) as
    | IMessageState
    | undefined;
}
