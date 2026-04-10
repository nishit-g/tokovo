import type { TeamsPresenceSetPayload, TeamsState } from "../types/index.js";
import { ensureUser } from "./shared.js";

export function handlePresenceSet(
  state: TeamsState,
  payload: TeamsPresenceSetPayload,
): void {
  ensureUser(state, { id: payload.userId, displayName: payload.userId });
  state.presence[payload.userId] = payload.presence;
}
