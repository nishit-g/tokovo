/**
 * WhatsApp Components Index
 * 
 * Re-exports all WhatsApp UI components for easy importing.
 */

// Icons
export * from "./icons";

// Components
export { Header, type HeaderProps } from "./Header";
export { MessageBubble, type MessageBubbleProps } from "./MessageBubble";

// Media Bubbles
export { ImageMessageBubble, VideoMessageBubble, GifMessageBubble } from "./MediaBubbles";

// Chats List Screen
export { ChatsListScreen, type ChatPreview } from "./ChatsListScreen";

// iOS Status Bar
export { iOSStatusBar, BubbleTail } from "./iOSStatusBar";

// Advanced Features (Phase 16)
export { ReactionsBar, ReactionPicker, type Reaction, COMMON_REACTIONS } from "./Reactions";
export { LinkPreview, MiniLinkPreview, type LinkPreviewData } from "./LinkPreview";
export { ReplyQuote, type ReplyToData } from "./ReplyQuote";
