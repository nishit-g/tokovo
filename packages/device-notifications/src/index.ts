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
} from "./runtime/state";
export {
  IOS_NOTIFICATION_POLICY,
  ANDROID_NOTIFICATION_POLICY,
  DEFAULT_NOTIFICATION_CENTER,
  DEFAULT_DYNAMIC_ISLAND,
} from "./runtime/state";

export {
  notificationReducer,
  applyNotificationEvent,
  DEFAULT_POLICY,
} from "./runtime/reducer";
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
} from "./runtime/reducer";

export {
  createSelectors,
  createNotificationSelector,
  computeAnimationState,
  animationConfigFromTokens,
  getNotifications,
  getNotificationById,
  getGroupedNotifications,
} from "./runtime/selectors";
export type {
  AnimationState,
  NotificationAnimationInfo,
  StackedNotificationInfo,
} from "./runtime/selectors";

export { NotificationTrackBuilder } from "./dsl/builder";
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
} from "./dsl/builder";

export * from "./tokens";
export * from "./strategies";

export { useNotificationAnimation } from "./hooks/useNotificationAnimation";

export { registerNotificationPlugin } from "./plugin";
