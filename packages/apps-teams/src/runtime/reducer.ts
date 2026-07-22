import {
  requireAppStateForDevice,
  type PluginReducer,
  type WorldState,
} from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import { createTeamsHandlers } from "../handlers/index.js";
import { parseTeamsEvent } from "../schemas/index.js";
import type { TeamsState, TeamsTrackEvent } from "../types/index.js";
import { syncViewMode } from "../handlers/shared.js";

const HANDLERS = createTeamsHandlers();

function getState(draft: WorldState, deviceId: string): TeamsState {
  const state = requireAppStateForDevice<TeamsState>(
    draft,
    TEAMS_APP_ID,
    deviceId,
  );
  syncViewMode(state);
  return state;
}

export const teamsReducer: PluginReducer<typeof TEAMS_APP_ID> = (
  draft,
  event,
): void => {
  const parsed = parseTeamsEvent(event);
  if (!parsed) return;

  const state = getState(draft, event.deviceId);
  const handler = (HANDLERS as Record<string, (state: TeamsState, event: TeamsTrackEvent) => void>)[
    parsed.type
  ];
  handler(state, parsed);
  syncViewMode(state);
};
