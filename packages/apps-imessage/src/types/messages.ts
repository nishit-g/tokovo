/**
 * iMessage message and attachment types.
 */

export type IMessageTransport = "imessage" | "sms";

export type IMessageTapbackType =
  | "heart"
  | "thumbsUp"
  | "thumbsDown"
  | "haha"
  | "exclamation"
  | "questionMark";

export type IMessageBubbleEffect = "slam" | "loud" | "gentle" | "ink";

/** Full-screen effects for iMessage */
export type IMessageScreenEffect =
  | "balloons"
  | "confetti"
  | "lasers"
  | "fireworks"
  | "celebration"
  | "echo"
  | "spotlight"
  | "love";

export type IMessageMessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read";

export interface MessageReference {
  messageId?: string;
  id?: string;
  index?: number | "last";
}

export interface IMessageTapback {
  type: IMessageTapbackType;
  fromMe?: boolean;
  from?: string;
}

export interface IMessageEffect {
  bubble?: IMessageBubbleEffect;
  screen?: IMessageScreenEffect;
}

/** Link preview for URLs */
export interface IMessageLinkPreview {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  domain?: string;
  favicon?: string;
}

/** Edit history record */
export interface IMessageEditRecord {
  text: string;
  editedAt: number;
}

export interface ImageAttachment {
  kind: "image";
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface VideoAttachment {
  kind: "video";
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
}

export interface VoiceAttachment {
  kind: "voice";
  url?: string;
  duration: number;
  waveform?: number[];
  played?: boolean;
}

export interface StickerAttachment {
  kind: "sticker";
  url: string;
  stickerPack?: string;
}

export interface GifAttachment {
  kind: "gif";
  url: string;
}

export interface ContactAttachment {
  kind: "contact";
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
}

export interface CalendarAttachment {
  kind: "calendar";
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isAllDay?: boolean;
}

export interface LocationAttachment {
  kind: "location";
  latitude: number;
  longitude: number;
  label?: string;
}

export interface PaymentAttachment {
  kind: "payment";
  amount: number;
  currency?: string;
  note?: string;
}

export interface LinkAttachment {
  kind: "link";
  preview: IMessageLinkPreview;
}

export type IMessageAttachment =
  | ImageAttachment
  | VideoAttachment
  | VoiceAttachment
  | StickerAttachment
  | GifAttachment
  | ContactAttachment
  | CalendarAttachment
  | LocationAttachment
  | PaymentAttachment
  | LinkAttachment;

export type IMessageMessageKind =
  | "text"
  | "media"
  | "voice"
  | "sticker"
  | "gif"
  | "contact"
  | "calendar"
  | "location"
  | "payment"
  | "link"
  | "system";

export interface IMessageMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  fromMe: boolean;
  kind: IMessageMessageKind;
  text?: string;
  attachments?: IMessageAttachment[];
  timestamp: number;
  tapbacks: IMessageTapback[];
  effect?: IMessageEffect;
  replyTo?: MessageReference;
  mentions?: string[];
  status?: IMessageMessageStatus;
  isSystem?: boolean;
  systemType?: string;
  systemText?: string;
  linkPreview?: IMessageLinkPreview;
  editHistory?: IMessageEditRecord[];
  isEdited?: boolean;
  isUnsent?: boolean;
}

