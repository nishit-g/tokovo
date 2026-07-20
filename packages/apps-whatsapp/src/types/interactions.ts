export type WhatsAppMessageGesture = "long_press" | "swipe_reply";
export type WhatsAppGesturePhase = "active" | "completed";

export interface WhatsAppGestureState {
  conversationId: string;
  messageId: string;
  gesture: WhatsAppMessageGesture;
  phase: WhatsAppGesturePhase;
  progress: number;
}

export interface WhatsAppReplyComposerState {
  conversationId: string;
  messageId: string;
}
