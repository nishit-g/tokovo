import type { ViewKind } from "@tokovo/core";
import type { TeamsEntityMaps } from "./conversation.js";

export type TeamsScreen =
  | "chat_list"
  | "dm_thread"
  | "channel_feed"
  | "channel_thread"
  | "call_overlay";

export type TeamsPresence = "available" | "busy" | "away" | "offline";
export type TeamsListFilter = "all" | "unread" | "chat" | "channels" | "meetings" | "muted";
export type TeamsTab = "chat" | "teams" | "calendar" | "calls" | "more";

export interface TeamsUiState {
  surface: TeamsScreen;
  previousSurface?: TeamsScreen;
  activeListFilter: TeamsListFilter;
  activeTab: TeamsTab;
  notificationIds: string[];
}

export interface TeamsState extends TeamsEntityMaps {
  viewMode: ViewKind;
  screen: TeamsScreen;
  ui: TeamsUiState;
  activeDmId?: string;
  activeChannelId?: string;
  activeThreadId?: string;
  activeCallId?: string;
  presence: Record<string, TeamsPresence>;
}

export function asTeamsState(
  appState: Record<string, unknown>,
): TeamsState | undefined {
  const raw = appState?.app_teams;
  if (!raw || typeof raw !== "object") return undefined;
  if (!("screen" in raw) || !("viewMode" in raw)) return undefined;
  return raw as TeamsState;
}
