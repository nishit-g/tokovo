export type WhatsAppMediaTransferState =
  | "remote"
  | "downloading"
  | "ready"
  | "failed";

export type WhatsAppMediaPlaybackState =
  | "idle"
  | "playing"
  | "paused"
  | "complete";

export interface WhatsAppMediaLifecycle {
  transferState: WhatsAppMediaTransferState;
  transferProgress: number;
  playbackState: WhatsAppMediaPlaybackState;
  playbackProgress: number;
  failureReason?: string;
}

export interface WhatsAppMediaViewerState {
  conversationId: string;
  messageId: string;
  openedAt: number;
}
