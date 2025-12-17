/**
 * Notifications Module Index
 * 
 * @description Consolidated notification system exports.
 * Types are in types/notification.ts, this contains logic.
 */

// Re-export types from central types module
export type {
    NotificationPriority,
    NotificationState,
    NotificationDeliverWhen,
    NotificationIR,
    NotificationInstance,
    Notification,
    NotificationGroup,
    NotificationPolicyIR,
    NotificationCenterState,
    DynamicIslandMode,
    DynamicIslandContent,
    DynamicIslandState,
    StatusBarIcon,
    NotificationQueueState,
} from "../types/notification";

export {
    IOS_NOTIFICATION_POLICY,
    ANDROID_NOTIFICATION_POLICY,
    DEFAULT_NOTIFICATION_CENTER,
    DEFAULT_DYNAMIC_ISLAND,
} from "../types/notification";

// Adapter system
export {
    NotificationAdapterRegistry,
    DEFAULT_NOTIFICATION_HEIGHT,
} from "../notification-adapter";
export type {
    FormattedNotification,
    NotificationAdapter,
    NotificationMeasurable,
} from "../notification-adapter";

// DSL helpers
export {
    showNotification,
    updateNotification,
    dismissNotification,
    tapNotification,
    swipeNotification,
    replyToNotification,
    toggleNotificationPanel,
    clearAllNotifications,
    setDynamicIsland,
    notificationDsl,
} from "../notification-dsl";
export type { NotificationOptions } from "../notification-dsl";

// View registry
export { NotificationViewRegistry } from "../notification-registry";
export type { NotificationViewProps, NotificationViewComponent } from "../notification-registry";

// Scheduler
export { NotificationScheduler } from "../scheduler/notification-scheduler";
