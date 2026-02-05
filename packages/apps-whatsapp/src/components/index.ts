/**
 * WhatsApp Components Index
 *
 * Re-exports all WhatsApp UI components for easy importing.
 */

// Icons
export * from "./Icons";

// Components
export { Header, type HeaderProps } from "./Header";
export { MessageBubble, type MessageBubbleProps } from "./MessageBubble";

// Media Bubbles
export {
  ImageMessageBubble,
  VideoMessageBubble,
  GifMessageBubble,
  VoiceMessageBubble,
} from "./MediaBubbles";

// Date Separator
export { DateSeparator } from "./DateSeparator";

// Chats List Screen (now in screens folder)
export {
  ChatListScreen,
  type ChatListScreenProps,
} from "./screens/ChatListScreen";
export {
  StatusScreen,
  type StatusScreenProps,
} from "./screens/StatusScreen";
export {
  CommunitiesScreen,
  type CommunitiesScreenProps,
} from "./screens/CommunitiesScreen";
export {
  CallsScreen,
  type CallsScreenProps,
} from "./screens/CallsScreen";
export {
  ProfileScreen,
  type ProfileScreenProps,
} from "./screens/ProfileScreen";

// Bubble Tail (extracted from iOSStatusBar)
export { BubbleTail } from "./BubbleTail";

// Advanced Features (Phase 16)
export {
  ReactionsBar,
  ReactionPicker,
  type Reaction,
  COMMON_REACTIONS,
} from "./Reactions";
export {
  LinkPreview,
  MiniLinkPreview,
  type LinkPreviewData,
} from "./LinkPreview";
export { ReplyQuote, type ReplyToData } from "./ReplyQuote";
