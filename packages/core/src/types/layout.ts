/**
 * Layout Types - All layout-related types
 *
 * @description View kinds, layout configs, layout states, and semantic regions.
 */

import type { Notification } from "./notification";
import type { WorldState } from "./world-state";

// =============================================================================
// VIEW KINDS
// =============================================================================

export type ViewKind =
  | "CHAT"
  | "FEED"
  | "STORY"
  | "LOCKSCREEN"
  | "HOMESCREEN"
  | "FULLSCREEN"
  | "TRANSITION";

// =============================================================================
// LAYOUT RECT
// =============================================================================

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// =============================================================================
// SEMANTIC REGIONS
// =============================================================================

export interface SemanticRegion {
  id: string;
  rect: LayoutRect;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface SemanticLayoutState {
  regions: Record<string, SemanticRegion>;
  groups: Record<string, string[]>;
}

// =============================================================================
// LAYOUT CONTEXT
// =============================================================================

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface LayoutContext {
  world: WorldState;
  t: number;
  activeDeviceId: string;
  activeAppId: string;
  viewKind: ViewKind;
  activeConversationId?: string;
  activeFeedId?: string;
  activeStoryId?: string;
  viewportWidth: number;
  viewportHeight: number;
  /** Device safe area insets (notch, home indicator, etc.) */
  safeAreaInsets: SafeAreaInsets;
  config?: Partial<LayoutConfig>;
}

// =============================================================================
// LAYOUT CONFIG
// =============================================================================

export interface LayoutConfig {
  cinematicMode: "NONE" | "FOLLOW_LAST_MESSAGE" | "FOCUS_ON_RANGE";
  chat: ChatLayoutConfig;
  feed: FeedLayoutConfig;
  story: StoryLayoutConfig;
  lockscreen: LockscreenLayoutConfig;
  transition: TransitionLayoutConfig;
}

export interface ChatLayoutConfig {
  bubbleWidth: number;
  baseBubbleHeight: number;
  charsPerLine: number;
  lineHeight: number;
  verticalGap: number;
  topPadding: number;
  bottomPadding: number;
  messageAppearDuration: number;
  messageAppearOffset: number;
  scrollEasingDuration: number;
  maxScrollCatchupSpeed: number;
  lockToBottom: boolean;
}

export interface FeedLayoutConfig {
  cardWidth: number;
  baseCardHeight: number;
  verticalGap: number;
  topPadding: number;
  bottomPadding: number;
  charsPerLine: number;
  lineHeight: number;
  scrollEasingDuration: number;
  maxScrollCatchupSpeed: number;
  startAtTop: boolean;
  autoScroll?: boolean;
}

export interface StoryLayoutConfig {
  defaultStoryDuration: number;
  progressBarHeight: number;
  storyGap: number;
  storyTransitionDuration: number;
}

export interface LockscreenLayoutConfig {
  topPadding: number;
  notificationGap: number;
  notificationWidth: number;
  baseNotificationHeight: number;
  charsPerLine: number;
  lineHeight: number;
  stackMaxNotifications: number;
  appearDuration: number;
}

export interface TransitionLayoutConfig {
  defaultScale: number;
  zoomedScale: number;
  panDuration: number;
  zoomDuration: number;
  notifications?: {
    appearDuration: number;
    dismissDuration: number;
  };
}

// =============================================================================
// LAYOUT STATES
// =============================================================================

export interface BaseLayoutState {
  kind: ViewKind;
  semantic?: SemanticLayoutState;
}

export type LayoutState =
  | ChatLayoutState
  | FeedLayoutState
  | StoryLayoutState
  | LockscreenLayoutState
  | TransitionLayoutState;

// Chat Layout
export interface ChatLayoutState extends BaseLayoutState {
  kind: "CHAT";
  scrollY: number;
  contentHeight: number;
  isAtBottom: boolean;
  messageLayouts: Record<string, ChatMessageLayout>;
  typingLayout?: TypingLayout | null;
  meta: ChatLayoutMeta;
}

export interface ChatMessageLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
  translateX: number;
  rect?: LayoutRect;
}

export interface TypingLayout {
  y: number;
  height: number;
  opacity: number;
  rect?: LayoutRect;
}

export interface ChatLayoutMeta {
  lastMessageId?: string;
  isGroupChat?: boolean;
}

// Feed Layout
export interface FeedLayoutState extends BaseLayoutState {
  kind: "FEED";
  scrollY: number;
  contentHeight: number;
  isAtBottom: boolean;
  itemLayouts: Record<string, FeedItemLayout>;
  meta: FeedLayoutMeta;
}

export interface FeedItemLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
  scale: number;
}

export interface FeedLayoutMeta {
  firstVisibleItemId?: string;
  lastVisibleItemId?: string;
  focusedItemId?: string;
}

// Story Layout
export interface StoryLayoutState extends BaseLayoutState {
  kind: "STORY";
  activeStoryIndex: number;
  storyCount: number;
  storyProgress: number;
  storyLayouts: StoryItemLayout[];
}

export interface StoryItemLayout {
  id: string;
  index: number;
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
}

// Lockscreen Layout
export interface LockscreenLayoutState extends BaseLayoutState {
  kind: "LOCKSCREEN";
  notificationLayouts: NotificationLayout[];
  meta: LockscreenLayoutMeta;
}

export interface NotificationLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
}

export interface LockscreenLayoutMeta {}

// Transition Layout
export interface TransitionLayoutState extends BaseLayoutState {
  kind: "TRANSITION";
  deviceTranslateX: number;
  deviceTranslateY: number;
  deviceScale: number;
  deviceRotation: number;
  overlayOpacity: number;
  meta: TransitionLayoutMeta;
}

export interface TransitionLayoutMeta {}
