/**
 * Notification Types - All notification-related types
 *
 * @description Notification IR, instances, policies, and center state.
 */

// =============================================================================
// NOTIFICATION PRIORITY & STATE
// =============================================================================

/** Notification priority levels */
export type NotificationPriority =
  | "passive"
  | "active"
  | "timeSensitive"
  | "critical";

/** Notification lifecycle state */
export type NotificationState =
  | "queued"
  | "pending"
  | "delivered"
  | "headsUp"
  | "inShade"
  | "onLockscreen"
  | "dismissed";

/** Notification delivery conditions */
export type NotificationDeliverWhen =
  | "always"
  | "onlyWhenLocked"
  | "onlyWhenUnlocked"
  | "onlyWhenAppClosed";

// =============================================================================
// NOTIFICATION IR (Intermediate Representation)
// =============================================================================

/**
 * NotificationIR - The Immutable Request
 * What the app sends. Stable, serializable, and device-agnostic.
 */
export interface NotificationIR {
  // Identity
  id: string;
  appId: string;
  channelId?: string;

  // Content
  title: string;
  body: string;
  icon?: string;

  // Media / Rich Content
  preview?: {
    kind: "text" | "image" | "video";
    value: string;
    aspectRatio?: number;
  };
  payload?: Record<string, unknown>;

  // Semantics
  category?: "message" | "call" | "system" | "reminder";
  threadKey?: string;
  groupKey?: string;
  peopleIds?: string[];

  // Actions
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    destructive?: boolean;
  }>;
  replyable?: boolean;
}

// =============================================================================
// NOTIFICATION INSTANCE
// =============================================================================

/**
 * NotificationInstance - The Mutable State
 * What the Engine tracks. Includes lifecycle, timestamps, and OS state.
 */
export interface NotificationInstance {
  id: string;
  ir: NotificationIR;

  // Lifecycle
  state: NotificationState;

  // Timestamps (Frame numbers)
  createdAtFrame: number;
  deliveredAtFrame?: number;
  shownAtFrame?: number;
  dismissedAtFrame?: number;
  expiresAtFrame?: number;

  // Encapsulated State from OS
  deviceId?: string;

  // Computed Priority / Mode
  importance?: "low" | "default" | "high" | "critical";
  mode?: "lockscreen" | "headsup" | "both" | "silent";
}

// Backward Compatibility
export type Notification = NotificationInstance;
export type NotificationIR_Alias = NotificationIR;

// =============================================================================
// NOTIFICATION GROUP
// =============================================================================

export interface NotificationGroup {
  key: string;
  appId: string;
  notifications: NotificationInstance[];
  collapsed: boolean;
  count: number;
  latestAt: number;
}

// =============================================================================
// NOTIFICATION POLICY
// =============================================================================

export interface NotificationPolicyIR {
  maxHeadsUpVisible: number;
  headsUpDurationByPriority: Record<NotificationPriority, number>;
  replaceOnNewFromSameThread: boolean;
  groupCollapseThreshold: number;
  autoGroupByApp: boolean;
  statusBarIconLimit: number;
  expandDurationMs: number;
}

export const IOS_NOTIFICATION_POLICY: NotificationPolicyIR = {
  maxHeadsUpVisible: 1,
  headsUpDurationByPriority: {
    passive: 0,
    active: 90,
    timeSensitive: 150,
    critical: 240,
  },
  replaceOnNewFromSameThread: true,
  groupCollapseThreshold: 3,
  autoGroupByApp: true,
  statusBarIconLimit: 0,
  expandDurationMs: 300,
};

export const ANDROID_NOTIFICATION_POLICY: NotificationPolicyIR = {
  maxHeadsUpVisible: 1,
  headsUpDurationByPriority: {
    passive: 0,
    active: 120,
    timeSensitive: 180,
    critical: 9999,
  },
  replaceOnNewFromSameThread: false,
  groupCollapseThreshold: 4,
  autoGroupByApp: true,
  statusBarIconLimit: 5,
  expandDurationMs: 200,
};

// =============================================================================
// NOTIFICATION CENTER STATE
// =============================================================================

export interface NotificationCenterState {
  items: Notification[];
  headsUp: string | null;
  headsUpQueue: string[];
  groups: NotificationGroup[];
}

export const DEFAULT_NOTIFICATION_CENTER: NotificationCenterState = {
  items: [],
  headsUp: null,
  headsUpQueue: [],
  groups: [],
};

// =============================================================================
// DYNAMIC ISLAND
// =============================================================================

export type DynamicIslandMode = "idle" | "minimal" | "compact" | "expanded";
export type DynamicIslandContent =
  | "notification"
  | "music"
  | "call"
  | "timer"
  | "recording"
  | "location"
  | null;

export interface DynamicIslandState {
  visible: boolean;
  mode: DynamicIslandMode;
  activeContent: DynamicIslandContent;
  lockedUntil?: number;
  appId?: string;
  content?: {
    title?: string;
    subtitle?: string;
    icon?: string;
  };
}

export const DEFAULT_DYNAMIC_ISLAND: DynamicIslandState = {
  visible: true,
  mode: "idle",
  activeContent: null,
};

// =============================================================================
// STATUS BAR ICONS
// =============================================================================

export interface StatusBarIcon {
  appId: string;
  count: number;
  iconUrl?: string;
}

// =============================================================================
// NOTIFICATION QUEUE STATE (V2)
// =============================================================================

export interface NotificationQueueState {
  headsUp: NotificationInstance | null;
  lockScreen: NotificationInstance[];
  dynamicIsland?: DynamicIslandState;
}
