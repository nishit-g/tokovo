import type { ViewKind } from "@tokovo/core";
import type { TeamsCall, TeamsEntityMaps } from "./conversation.js";

export type TeamsScreen =
  | "chat_list"
  | "dm_thread"
  | "channel_feed"
  | "channel_thread"
  | "call_overlay";

export type TeamsPresence = "available" | "busy" | "away" | "offline";

export interface TeamsState extends TeamsEntityMaps {
  viewMode: ViewKind;
  screen: TeamsScreen;
  activeDmId?: string;
  activeChannelId?: string;
  activeThreadId?: string;
  activeCallId?: string;
  calls: Record<string, TeamsCall>;
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
