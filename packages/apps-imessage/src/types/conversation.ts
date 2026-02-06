/**
 * iMessage conversation and participant types.
 */

import type { IMessageMessage, IMessageTransport } from "./messages.js";

export interface IMessageParticipant {
  id: string;
  name: string;
  avatar?: string;
  isMe?: boolean;
}

export interface IMessageConversation {
  id: string;
  title?: string;
  transport: IMessageTransport;
  participants: IMessageParticipant[];
  messages: IMessageMessage[];
  messagesById?: Record<string, IMessageMessage>;
  typing: Record<string, boolean>;
  unreadCount: number;
  pinned?: boolean;
  mutedUntil?: number;
  draft?: string;
  lastMessageAt?: number;
  avatar?: string;
  isGroup?: boolean;
}
