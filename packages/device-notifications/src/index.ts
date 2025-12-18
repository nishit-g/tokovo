/**
 * @tokovo/device-notifications
 * 
 * Enterprise-grade notification system for Tokovo.
 * 
 * @example
 * ```typescript
 * import { NotificationTrackBuilder } from "@tokovo/device-notifications";
 * 
 * const noti = new NotificationTrackBuilder(30, "phone", getOrder);
 * 
 * noti.at("2s").show({
 *     appId: "app_whatsapp",
 *     title: "Alex",
 *     body: "Hey! How are you?",
 * });
 * 
 * noti.at("5s").dismiss("notif_1");
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
    NotificationIR,
    NotificationInstance,
    NotificationMode,
    NotificationPriority,
    DynamicIslandMode,
    DynamicIslandState,
    FormattedNotification,
    NotificationAdapter,
} from "./types";

export type {
    NotificationPayloads,
    NotificationEventType,
    ShowNotificationPayload,
    DismissNotificationPayload,
    TapNotificationPayload,
    SwipeNotificationPayload,
    DynamicIslandPayload,
} from "./types/payloads";

// =============================================================================
// DSL
// =============================================================================

export {
    NotificationTrackBuilder,
    NotificationPointBuilder,
} from "./dsl/track-builder";

// =============================================================================
// IR
// =============================================================================

export type { NotificationTrackEvent } from "./ir/track-event";
export { isNotificationEvent } from "./ir/track-event";

// =============================================================================
// LOWERING
// =============================================================================

export {
    notificationV2Lowering,
    NOTIFICATION_EVENT_TYPES as LOWERING_EVENT_TYPES,
} from "./lowering/handler";

// =============================================================================
// REDUCER
// =============================================================================

export {
    notificationReducer,
    NOTIFICATION_EVENT_TYPES,
} from "./reducer";

// =============================================================================
// ADAPTERS
// =============================================================================

export {
    NotificationAdapterRegistry,
    DEFAULT_NOTIFICATION_HEIGHT,
} from "./adapters/registry";

// =============================================================================
// AUDIO
// =============================================================================

export {
    notificationAudioRules,
    defaultNotificationSounds,
} from "./assets/audio-rules";

// =============================================================================
// PLUGIN
// =============================================================================

export {
    NotificationPlugin,
    registerNotificationPlugin,
} from "./plugin";

// =============================================================================
// SCHEDULER
// =============================================================================

export { NotificationScheduler } from "./scheduler";

// =============================================================================
// VIEWS
// =============================================================================

export { HeadsUpNotification } from "./views/HeadsUpNotification";
export { IOSNotificationStrategy } from "./strategies/IOSNotificationStrategy";
export { AndroidNotificationStrategy } from "./strategies/AndroidNotificationStrategy";

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

// Auto-register plugin on import
import { registerNotificationPlugin } from "./plugin";
registerNotificationPlugin();
