export type {
  IMessageTransport,
  IMessageTapbackType,
  IMessageBubbleEffect,
  IMessageScreenEffect,
  IMessageMessageStatus,
  MessageReference,
  IMessageTapback,
  IMessageEffect,
  IMessageLinkPreview,
  IMessageEditRecord,
  IMessageAttachment,
  CalendarAttachment,
  LinkAttachment,
  VoiceAttachment,
  ContactAttachment,
  IMessageMessageKind,
  IMessageMessage,
} from "./messages.js";

export type { IMessageParticipant, IMessageConversation } from "./conversation.js";

export type { IMessageState, IMessageScreen, IMessageThemeMode } from "./state.js";
export { asIMessageState } from "./state.js";

export type {
  IMessageEventType,
  IMessageEventMap,
  IMessageEventPayload,
  IMessageTrackEvent,
} from "./events.js";
export { isIMessageEvent } from "./events.js";

import "./module-augmentation.js";
