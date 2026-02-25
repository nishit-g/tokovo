export type TeamsMessageKind = "text" | "system";

export interface TeamsMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  kind: TeamsMessageKind;
  createdAtFrame: number;
  editedAtFrame?: number;
  mentionedUserIds?: string[];
}
