/**
 * WhatsApp Components Index
 *
 * Re-exports all WhatsApp UI components for easy importing.
 */

// Icons
export * from "./Icons.js";

// Components
export { Header, type HeaderProps } from "./Header.js";
export {
  ChatMessageItem,
  type ChatMessageItemProps,
} from "./ChatMessageItem.js";
export { MessageBody, type MessageBodyProps } from "./MessageBody.js";
export { SystemEvent, type SystemEventProps } from "./SystemEvent.js";
export {
  StatusRing,
  type StatusRingProps,
  type StatusSegmentState,
} from "./StatusRing.js";

// Date Separator
export { DateSeparator } from "./DateSeparator.js";

// Chats List Screen (now in screens folder)
export {
  ChatListScreen,
  type ChatListScreenProps,
} from "./screens/ChatListScreen.js";
export {
  UpdatesScreen,
  type UpdatesScreenProps,
} from "./screens/UpdatesScreen.js";
export {
  CommunitiesScreen,
  type CommunitiesScreenProps,
} from "./screens/CommunitiesScreen.js";
export { CallsScreen, type CallsScreenProps } from "./screens/CallsScreen.js";
export {
  ProfileScreen,
  type ProfileScreenProps,
} from "./screens/ProfileScreen.js";

export {
  LinkPreview,
  MiniLinkPreview,
  type LinkPreviewData,
} from "./LinkPreview.js";
export { ReplyQuote } from "./ReplyQuote.js";
