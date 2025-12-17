/**
 * Notifications Module - Notification system
 * 
 * @description All notification-related logic.
 * Note: Types are exported from ./types - don't re-export here to avoid conflicts.
 */

// Adapter system
export {
    NotificationAdapterRegistry,
    DEFAULT_NOTIFICATION_HEIGHT,
} from "./adapter";
export type {
    FormattedNotification,
    NotificationAdapter,
    NotificationMeasurable,
} from "./adapter";

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
} from "./dsl";
export type { NotificationOptions } from "./dsl";

// View registry
export { NotificationViewRegistry } from "./registry";
export type { NotificationViewProps, NotificationViewComponent } from "./registry";

// Scheduler
export { NotificationScheduler } from "./scheduler";
