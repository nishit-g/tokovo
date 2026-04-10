import type { TeamsEventType, TeamsState, TeamsTrackEvent } from "../types/index.js";
import { handleCallEnd, handleCallStart, handleCallUpdate } from "./calls.js";
import {
  handleMessageReceive,
  handleMessageSend,
  handleDraftSet,
  handleTypingEnd,
  handleTypingStart,
} from "./messaging.js";
import {
  handleOpenChannel,
  handleOpenChatList,
  handleOpenDm,
  handleOpenThread,
} from "./navigation.js";
import {
  handleNotificationDismiss,
  handleNotificationPush,
} from "./notifications.js";
import { handlePresenceSet } from "./presence.js";

type TeamsEventHandler<T extends TeamsEventType = TeamsEventType> = (
  state: TeamsState,
  event: Extract<TeamsTrackEvent, { type: T }>,
) => void;

type TeamsHandlerMap = {
  [K in TeamsEventType]: TeamsEventHandler<K>;
};

export function createTeamsHandlers(): Readonly<TeamsHandlerMap> {
  return {
    TEAMS_OPEN_CHAT_LIST: (state, event) => handleOpenChatList(state, event.payload),
    TEAMS_OPEN_DM: (state, event) => handleOpenDm(state, event.payload),
    TEAMS_OPEN_CHANNEL: (state, event) => handleOpenChannel(state, event.payload),
    TEAMS_OPEN_THREAD: (state, event) => handleOpenThread(state, event.payload),
    TEAMS_MESSAGE_SEND: (state, event) =>
      handleMessageSend(state, event.payload, event.at),
    TEAMS_MESSAGE_RECEIVE: (state, event) =>
      handleMessageReceive(state, event.payload, event.at),
    TEAMS_TYPING_START: (state, event) =>
      handleTypingStart(state, event.payload, event.at),
    TEAMS_TYPING_END: (state, event) => handleTypingEnd(state, event.payload),
    TEAMS_DRAFT_SET: (state, event) => handleDraftSet(state, event.payload, event.at),
    TEAMS_PRESENCE_SET: (state, event) => handlePresenceSet(state, event.payload),
    TEAMS_NOTIFICATION_PUSH: (state, event) =>
      handleNotificationPush(state, event.payload, event.at),
    TEAMS_NOTIFICATION_DISMISS: (state, event) =>
      handleNotificationDismiss(state, event.payload, event.at),
    TEAMS_CALL_START: (state, event) => handleCallStart(state, event.payload, event.at),
    TEAMS_CALL_UPDATE: (state, event) => handleCallUpdate(state, event.payload),
    TEAMS_CALL_END: (state, event) => handleCallEnd(state, event.payload, event.at),
  };
}
