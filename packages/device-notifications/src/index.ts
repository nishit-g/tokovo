export type {
  NotificationIR,
  NotificationInstance,
  NotificationState,
  NotificationPriority,
  NotificationGroup,
  NotificationCenterState,
  NotificationQueueState,
  DynamicIslandState,
  DynamicIslandMode,
  DynamicIslandContent,
} from "./runtime/state.js";
export {
  IOS_NOTIFICATION_POLICY,
  ANDROID_NOTIFICATION_POLICY,
  DEFAULT_NOTIFICATION_CENTER,
  DEFAULT_DYNAMIC_ISLAND,
} from "./runtime/state.js";

export {
  notificationReducer,
  applyNotificationEvent,
  DEFAULT_POLICY,
} from "./runtime/reducer.js";
export type {
  NotificationPolicy,
  ShowPayload,
  DismissPayload,
  TapPayload,
  SwipePayload,
  ReplyPayload,
  DynamicIslandPayload,
  ClearAllPayload,
  NotificationPayload,
  NotificationEvent,
  NotificationMode,
} from "./runtime/reducer.js";

export {
  createSelectors,
  createNotificationSelector,
  computeAnimationState,
  animationConfigFromTokens,
  getNotifications,
  getNotificationById,
  getGroupedNotifications,
} from "./runtime/selectors.js";
export type {
  AnimationState,
  NotificationAnimationInfo,
  StackedNotificationInfo,
} from "./runtime/selectors.js";

export { NotificationTrackBuilder } from "./dsl/builder.js";
export type {
  ShowOptions,
  NotificationDSLEvent,
  NotificationShowEvent,
  NotificationDismissEvent,
  NotificationTapEvent,
  NotificationSwipeEvent,
  NotificationReplyEvent,
  NotificationClearAllEvent,
  DynamicIslandEvent,
} from "./dsl/builder.js";

export * from "./tokens/index.js";
export * from "./strategies/index.js";

export { useNotificationAnimation } from "./hooks/useNotificationAnimation.js";

export { registerNotificationPlugin } from "./plugin.js";
