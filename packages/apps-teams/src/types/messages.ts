export type TeamsMessageKind = "text" | "system";
export type TeamsMessageStatus = "sending" | "sent" | "delivered" | "read";

export type TeamsMessageTarget =
  | { kind: "dm"; dmId: string }
  | { kind: "thread"; channelId: string; threadId: string };

export interface TeamsMention {
  userId: string;
  label?: string;
}

export interface TeamsMessage {
  id: string;
  target: TeamsMessageTarget;
  threadId: string;
  channelId?: string;
  dmId?: string;
  senderId: string;
  senderName: string;
  text: string;
  kind: TeamsMessageKind;
  status: TeamsMessageStatus;
  createdAtFrame: number;
  editedAtFrame?: number;
  replyToMessageId?: string;
  mentionedUserIds: string[];
  isFromMe: boolean;
}
