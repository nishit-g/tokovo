/**
 * iMessage App State Types
 */

import type { IMessageConversation } from "./conversation";

export type IMessageScreen = "list" | "chat" | "info" | "media";

export type IMessageThemeMode = "light" | "dark";

export interface IMessageState {
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
}

export function asIMessageState(
  appState: Record<string, unknown>,
): IMessageState | undefined {
  return (appState?.app_imessage || appState?.imessage) as
    | IMessageState
    | undefined;
}
