import type { PluginReducer, WorldState } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import { createTeamsHandlers } from "../handlers/index.js";
import { parseTeamsEvent } from "../schemas/index.js";
import type { TeamsState, TeamsTrackEvent } from "../types/index.js";
import { createTeamsInitialState } from "./initial-state.js";
import { syncViewMode } from "../handlers/shared.js";

const HANDLERS = createTeamsHandlers();

function getState(draft: WorldState): TeamsState {
  if (!draft.appState[TEAMS_APP_ID]) {
    draft.appState[TEAMS_APP_ID] = createTeamsInitialState();
  }
  const state = draft.appState[TEAMS_APP_ID] as TeamsState;
  syncViewMode(state);
  return state;
}

export const teamsReducer: PluginReducer<typeof TEAMS_APP_ID> = (
  draft,
  event,
): void => {
  const parsed = parseTeamsEvent(event);
  if (!parsed) return;

  const state = getState(draft);
  const handler = (HANDLERS as Record<string, (state: TeamsState, event: TeamsTrackEvent) => void>)[
    parsed.type
  ];
  handler(state, parsed);
  syncViewMode(state);
};
