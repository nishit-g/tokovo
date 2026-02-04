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
  duration: number;
  waveform?: number[];
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
  avatarUrl?: string;
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

export type IMessageAttachment =
  | ImageAttachment
  | VideoAttachment
  | VoiceAttachment
  | StickerAttachment
  | GifAttachment
  | ContactAttachment
  | LocationAttachment
  | PaymentAttachment;

export type IMessageMessageKind =
  | "text"
  | "media"
  | "voice"
  | "sticker"
  | "gif"
  | "contact"
  | "location"
  | "payment"
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
}
