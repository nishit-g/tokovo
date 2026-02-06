/**
 * WhatsApp Components Index
 *
 * Re-exports all WhatsApp UI components for easy importing.
 */

// Icons
export * from "./Icons.js";

// Components
export { Header, type HeaderProps } from "./Header.js";
export { MessageBubble, type MessageBubbleProps } from "./MessageBubble.js";

// Media Bubbles
export {
  ImageMessageBubble,
  VideoMessageBubble,
  GifMessageBubble,
  VoiceMessageBubble,
} from "./MediaBubbles.js";

// Date Separator
export { DateSeparator } from "./DateSeparator.js";

// Chats List Screen (now in screens folder)
export {
  ChatListScreen,
  type ChatListScreenProps,
} from "./screens/ChatListScreen.js";
export {
  StatusScreen,
  type StatusScreenProps,
} from "./screens/StatusScreen.js";
export {
  CommunitiesScreen,
  type CommunitiesScreenProps,
} from "./screens/CommunitiesScreen.js";
export {
  CallsScreen,
  type CallsScreenProps,
} from "./screens/CallsScreen.js";
export {
  ProfileScreen,
  type ProfileScreenProps,
} from "./screens/ProfileScreen.js";

// Bubble Tail (extracted from iOSStatusBar)
export { BubbleTail } from "./BubbleTail.js";

// Advanced Features (Phase 16)
export {
  ReactionsBar,
  ReactionPicker,
  type Reaction,
  COMMON_REACTIONS,
} from "./Reactions.js";
export {
  LinkPreview,
  MiniLinkPreview,
  type LinkPreviewData,
} from "./LinkPreview.js";
export { ReplyQuote, type ReplyToData } from "./ReplyQuote.js";
