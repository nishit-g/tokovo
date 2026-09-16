/**
 * Serializable authoring contract for deterministic device notifications.
 *
 * Apps describe semantic content and actions. The notification capability
 * resolves delivery policy, lifecycle, grouping, privacy and presentation.
 */

export type NotificationInterruptionLevelIR =
  | "passive"
  | "active"
  | "timeSensitive"
  | "critical";

export type NotificationPrivacyIR = "public" | "private" | "sensitive";
export interface NotificationVisualTokensIR {
  card?: string;
  text?: string;
  secondaryText?: string;
  accent?: string;
  border?: string;
  radius?: number;
  padding?: number;
}
export type NotificationPreviewPolicyIR = "always" | "whenUnlocked" | "never";
export type NotificationDeliveryConditionIR =
  | "always"
  | "onlyWhenLocked"
  | "onlyWhenUnlocked"
  | "onlyWhenAppClosed";

export interface NotificationMediaIR {
  kind: "image" | "video";
  src: string;
  alt?: string;
  aspectRatio?: number;
}

export interface NotificationContentIR {
  title: string;
  body: string;
  subtitle?: string;
  /** Optional communication sender image rendered ahead of the app icon. */
  avatar?: {
    src: string;
    alt?: string;
  };
  media?: NotificationMediaIR;
}

export interface NotificationNavigationTargetIR {
  appId?: string;
  route?: string;
  params?: Record<string, unknown>;
}

export interface NotificationAppEventTargetIR {
  appId?: string;
  type: string;
  payload?: Record<string, unknown>;
}

export type NotificationActionTargetIR =
  | {
      navigation: NotificationNavigationTargetIR;
      appEvent?: NotificationAppEventTargetIR;
    }
  | {
      navigation?: NotificationNavigationTargetIR;
      appEvent: NotificationAppEventTargetIR;
    };

export interface NotificationActionIR {
  id: string;
  label: string;
  role?: "default" | "destructive";
  target: NotificationActionTargetIR;
}

export interface NotificationReplyIR {
  actionId: string;
  placeholder?: string;
  /** Payload key receiving the authored reply text (for example `text`). */
  textPayloadKey?: string;
  target: NotificationActionTargetIR;
}

export interface NotificationIntentIR {
  id: string;
  deviceId: string;
  appId: string;
  appInstanceId?: string;
  deliverAtFrame: number;
  /** Stable ordering for notifications delivered on the same frame. */
  sequence?: number;
  content: NotificationContentIR;
  category?: "message" | "social" | "work" | "system" | "reminder";
  threadId?: string;
  groupId?: string;
  interruption?: NotificationInterruptionLevelIR;
  privacy?: NotificationPrivacyIR;
  previewPolicy?: NotificationPreviewPolicyIR;
  deliveryCondition?: NotificationDeliveryConditionIR;
  foregroundBehavior?: "suppress" | "present";
  sound?: "default" | "silent" | { soundId: string; volume?: number };
  bannerDurationFrames?: number;
  retentionUntilFrame?: number;
  actions?: NotificationActionIR[];
  reply?: NotificationReplyIR;
  defaultAction?: NotificationActionTargetIR;
  metadata?: Record<string, unknown>;
}

export type NotificationInteractionTypeIR =
  | "tap"
  | "authenticate"
  | "expand"
  | "expandGroup"
  | "collapseGroup"
  | "swipeLeft"
  | "swipeRight"
  | "setDisplay"
  | "scrollHistory"
  | "collapse"
  | "beginReply"
  | "chooseAction"
  | "reply"
  | "markRead"
  | "dismiss"
  | "clearAll"
  | "openCenter"
  | "closeCenter";

export interface NotificationInteractionIR {
  id?: string;
  deviceId: string;
  atFrame: number;
  type: NotificationInteractionTypeIR;
  notificationId?: string;
  actionId?: string;
  replyText?: string;
  inputSessionId?: string;
  display?: "count" | "stack" | "list";
  /** Normalized history position: 0 is newest, 1 is oldest visible content. */
  scrollPosition?: number;
  /** Explicit authoritative app badge count after acknowledgement; never inferred from cards. */
  badgeCount?: number;
  /** App-owned read event, kept separate from dismissal and navigation. */
  readTarget?: NotificationAppEventTargetIR;
  /** Stable ordering for multiple interactions authored on the same frame. */
  sequence?: number;
}

/** Compile-time sink exposed to app lowerers. It never mutates runtime state. */
export interface NotificationIntentEmitter {
  emitNotification(intent: NotificationIntentIR): void;
  emitNotificationInteraction(interaction: NotificationInteractionIR): void;
}
