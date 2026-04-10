import { TEAMS_CALL_STATUS, TEAMS_SCREENS } from "../constants.js";
import type {
  TeamsCallEndPayload,
  TeamsCallStartPayload,
  TeamsCallUpdatePayload,
  TeamsState,
} from "../types/index.js";
import { setSurface } from "./shared.js";

export function handleCallStart(
  state: TeamsState,
  payload: TeamsCallStartPayload,
  at: number,
): void {
  state.calls[payload.callId] = {
    id: payload.callId,
    participantIds: payload.participantIds,
    status: payload.status ?? TEAMS_CALL_STATUS.ACTIVE,
    mode: payload.mode,
    scope: payload.scope,
    dmId: payload.dmId,
    channelId: payload.channelId,
    threadId: payload.threadId,
    title: payload.title,
    startedAtFrame: at,
  };
  state.activeCallId = payload.callId;
  state.ui.previousSurface = state.screen;
  setSurface(state, TEAMS_SCREENS.CALL_OVERLAY);
}

export function handleCallUpdate(
  state: TeamsState,
  payload: TeamsCallUpdatePayload,
): void {
  const call = state.calls[payload.callId];
  if (!call) return;
  if (payload.participantIds) call.participantIds = payload.participantIds;
  if (payload.status) call.status = payload.status;
  if (payload.dominantSpeakerId) call.dominantSpeakerId = payload.dominantSpeakerId;
  if (payload.title) call.title = payload.title;
}

export function handleCallEnd(
  state: TeamsState,
  payload: TeamsCallEndPayload,
  at: number,
): void {
  const call = state.calls[payload.callId];
  if (!call) return;
  call.status = TEAMS_CALL_STATUS.ENDED;
  call.endedAtFrame = at;
  if (state.activeCallId === payload.callId) {
    state.activeCallId = undefined;
    const restore = state.ui.previousSurface ?? TEAMS_SCREENS.CHAT_LIST;
    state.ui.previousSurface = undefined;
    setSurface(state, restore);
  }
}
