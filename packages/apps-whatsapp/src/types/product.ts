export interface WhatsAppStatusUpdate {
  id: string;
  authorId: string;
  authorName: string;
  avatar?: string;
  postedAt: number;
  viewed?: boolean;
  muted?: boolean;
  media:
    | { type: "text"; text: string; backgroundColor?: string }
    | { type: "image"; src: string; caption?: string }
    | {
        type: "video";
        src: string;
        thumbnail?: string;
        duration: number;
        caption?: string;
      };
}

export interface WhatsAppStatusViewerState {
  statusId: string;
  authorId: string;
  openedAt: number;
}

export interface WhatsAppChannelUpdate {
  id: string;
  text: string;
  postedAt: number;
  thumbnail?: string;
}

export interface WhatsAppChannel {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  followersLabel: string;
  category?: string;
  verified?: boolean;
  followed: boolean;
  muted?: boolean;
  unreadCount: number;
  latestUpdate?: WhatsAppChannelUpdate;
}

export type WhatsAppCallDirection = "incoming" | "outgoing" | "missed";
export type WhatsAppCallMode = "voice" | "video";

export interface WhatsAppCallLogEntry {
  id: string;
  conversationId?: string;
  name: string;
  avatar?: string;
  direction: WhatsAppCallDirection;
  mode: WhatsAppCallMode;
  startedAt: number;
  durationSeconds?: number;
  isGroup?: boolean;
}

export interface WhatsAppCommunity {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  announcementConversationId?: string;
  groupConversationIds: string[];
  memberCount?: number;
  unreadCount?: number;
}

export interface WhatsAppAccountProfile {
  name: string;
  phone?: string;
  about?: string;
  avatar?: string;
}

export interface WhatsAppSettings {
  linkedDevicesCount?: number;
  privacy?: {
    lastSeen?: "everyone" | "contacts" | "contacts_except" | "nobody";
    profilePhoto?: "everyone" | "contacts" | "contacts_except" | "nobody";
    readReceipts?: boolean;
  };
  chats?: {
    theme?: "system" | "light" | "dark";
    backupLabel?: string;
    defaultDisappearingMessages?: string;
  };
  notifications?: {
    messageTone?: string;
    groupTone?: string;
    mutedChats?: number;
  };
  storage?: {
    usedLabel?: string;
    autoDownloadLabel?: string;
  };
}
