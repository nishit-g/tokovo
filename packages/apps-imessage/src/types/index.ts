export type {
  IMessageTransport,
  IMessageTapbackType,
  IMessageBubbleEffect,
  IMessageMessageStatus,
  MessageReference,
  IMessageTapback,
  IMessageEffect,
  IMessageAttachment,
  IMessageMessageKind,
  IMessageMessage,
} from "./messages";

export type { IMessageParticipant, IMessageConversation } from "./conversation";

export type { IMessageState, IMessageScreen, IMessageThemeMode } from "./state";
export { asIMessageState } from "./state";

export type {
  IMessageEventType,
  IMessageEventMap,
  IMessageEventPayload,
  IMessageTrackEvent,
} from "./events";
export { isIMessageEvent } from "./events";

import "./module-augmentation";
