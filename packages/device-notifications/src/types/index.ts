/**
 * Notification Types
 *
 * Core type definitions for the notification system.
 */

// =============================================================================
// NOTIFICATION IR (Intermediate Representation)
// =============================================================================

export type NotificationMode = "headsup" | "lockscreen" | "both" | "silent";
export type NotificationPriority = "low" | "default" | "high" | "urgent";

/**
 * Notification IR - The authoring-time representation
 */
export interface NotificationIR {
  /** Unique notification ID */
  id: string;

  /** App that owns this notification */
  appId: string;

  /** Notification title */
  title: string;

  /** Notification body text */
  body: string;

  /** Display mode */
  mode?: NotificationMode;

  /** Priority level */
  priority?: NotificationPriority;

  /** App icon (URL or emoji) */
  icon?: string;

  /** Preview content */
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };

  /** Action buttons */
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    destructive?: boolean;
  }>;

  /** Group key for stacking */
  groupKey?: string;

  /** Thread ID for conversations */
  threadId?: string;

  /** Can reply inline */
  replyable?: boolean;

  /** App-specific metadata */
  metadata?: Record<string, any>;
}

// =============================================================================
// NOTIFICATION INSTANCE (Runtime State - Canonical Shape)
// =============================================================================

export type NotificationState = "pending" | "headsUp" | "inShade" | "dismissed";

/**
 * NotificationInstance - Runtime representation with frame timing
 *
 * This is the CANONICAL shape used throughout the system.
 * Contains all IR fields PLUS runtime timing/state fields.
 */
export interface NotificationInstance {
  // === IDENTITY ===
  /** Unique ID */
  id: string;

  /** Device this notification is on */
  deviceId: string;

  /** App that owns this notification */
  appId: string;

  // === CONTENT (from IR) ===
  /** Notification title */
  title: string;

  /** Notification body text */
  body: string;

  /** App icon (URL or emoji) */
  icon?: string;

  /** Preview content */
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };

  /** Action buttons */
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    destructive?: boolean;
  }>;

  /** Can reply inline */
  replyable?: boolean;

  /** Category (for smart rendering) */
  category?: string;

  /** App-specific metadata */
  metadata?: Record<string, any>;

  // === GROUPING ===
  /** Group key for stacking */
  groupKey?: string;

  /** Thread ID for conversations */
  threadId?: string;

  // === TIMING ===
  /** Frame when created/delivered */
  createdAtFrame: number;

  /** Frame when shown as heads-up (computed by scheduler) */
  shownAtFrame?: number;

  /** Frame when dismissed */
  dismissedAtFrame?: number;

  // === STATE ===
  /** Current state */
  state: NotificationState;

  /** Display mode */
  mode: NotificationMode;

  /** Priority level */
  priority: NotificationPriority;

  /** Delivery condition */
  deliverWhen?: "always" | "unlocked" | "locked";

  /** Has been tapped */
  tapped?: boolean;

  /** Animation state */
  animationState?: "entering" | "visible" | "exiting" | "dismissed";
}

// =============================================================================
// DYNAMIC ISLAND - Re-export from core
// =============================================================================

export type { DynamicIslandState, DynamicIslandMode } from "@tokovo/core";

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export FormattedNotification and adapter types
export type {
  FormattedNotification,
  NotificationAdapter,
} from "./adapter-types";
