import type {
  TeamsOpenChannelPayload,
  TeamsOpenChatListPayload,
  TeamsOpenDmPayload,
  TeamsOpenThreadPayload,
  TeamsState,
} from "../types/index.js";
import { setActiveChannel, setActiveDm, setActiveThread, setChatList } from "./shared.js";

export function handleOpenChatList(
  state: TeamsState,
  payload: TeamsOpenChatListPayload,
): void {
  setChatList(state, payload.filter);
}

export function handleOpenDm(state: TeamsState, payload: TeamsOpenDmPayload): void {
  setActiveDm(state, payload.dmId);
}

export function handleOpenChannel(
  state: TeamsState,
  payload: TeamsOpenChannelPayload,
): void {
  setActiveChannel(state, payload.channelId);
}

export function handleOpenThread(
  state: TeamsState,
  payload: TeamsOpenThreadPayload,
): void {
  setActiveThread(state, payload.channelId, payload.threadId);
}
