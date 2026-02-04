/**
 * Notifications Module - Notification system
 * 
 * @description All notification-related logic.
 * Note: Types are exported from ./types - don't re-export here to avoid conflicts.
 */

// Adapter system
export { createNotificationAdapterRegistry, DEFAULT_NOTIFICATION_HEIGHT } from "./adapter";
export type {
    FormattedNotification,
    NotificationAdapter,
    NotificationMeasurable,
    NotificationAdapterRegistryClass,
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

// Scheduler
export { NotificationScheduler } from "./scheduler";
