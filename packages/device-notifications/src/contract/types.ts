import type {
  NotificationActionIR,
  NotificationActionTargetIR,
  NotificationContentIR,
  NotificationDeliveryConditionIR,
  NotificationIntentIR,
  NotificationInteractionIR,
  NotificationInterruptionLevelIR,
  NotificationMediaIR,
  NotificationPreviewPolicyIR,
  NotificationPrivacyIR,
  NotificationReplyIR,
} from "@tokovo/ir";

export type NotificationPlatform = "ios" | "android";
export type NotificationAppearance = "light" | "dark";
export type NotificationThemeId = "system";

export interface NotificationAppPresentation {
  appName: string;
  icon: string;
  accentColor: string;
  leadingImage?: string;
  leadingImageAlt?: string;
  title: string;
  body: string;
  subtitle?: string;
}

export interface NotificationAppAdapter {
  appId: string;
  format(intent: NotificationIntentIR): NotificationAppPresentation;
  defaultAction?(intent: NotificationIntentIR): NotificationActionTargetIR;
}

export interface NotificationDeviceDescriptor {
  id: string;
  platform: NotificationPlatform;
  appearance: NotificationAppearance;
  locale: string;
  initialLocked: boolean;
  initialDnd: boolean;
  initialForegroundAppId?: string;
}

export type NotificationDeviceContextOperation =
  | { at: number; sequence: number; deviceId: string; type: "lock" }
  | { at: number; sequence: number; deviceId: string; type: "unlock" }
  | { at: number; sequence: number; deviceId: string; type: "goHome" }
  | {
      at: number;
      sequence: number;
      deviceId: string;
      type: "openApp";
      appId: string;
      route?: string;
      params?: Record<string, unknown>;
    }
  | {
      at: number;
      sequence: number;
      deviceId: string;
      type: "setDnd";
      enabled: boolean;
    };

export interface NotificationPrepareInput {
  fps: number;
  durationInFrames: number;
  intents: readonly NotificationIntentIR[];
  interactions: readonly NotificationInteractionIR[];
  devices: readonly NotificationDeviceDescriptor[];
  deviceOperations?: readonly NotificationDeviceContextOperation[];
  adapters: ReadonlyMap<string, NotificationAppAdapter>;
}

export type NotificationDeliveryOutcome = "delivered" | "suppressed";
export type NotificationSuppressionReason = "deliveryCondition";
export type NotificationAlertSuppressionReason = "focus" | "foreground";

export interface PreparedNotificationRecord {
  id: string;
  deviceId: string;
  appId: string;
  appInstanceId: string;
  deliverAtFrame: number;
  sequence: number;
  content: NotificationContentIR;
  presentation: NotificationAppPresentation;
  category: NonNullable<NotificationIntentIR["category"]>;
  threadId?: string;
  groupId?: string;
  interruption: NotificationInterruptionLevelIR;
  privacy: NotificationPrivacyIR;
  previewPolicy: NotificationPreviewPolicyIR;
  deliveryCondition: NotificationDeliveryConditionIR;
  foregroundBehavior: NonNullable<NotificationIntentIR["foregroundBehavior"]>;
  sound: NonNullable<NotificationIntentIR["sound"]>;
  actions: readonly NotificationActionIR[];
  reply?: NotificationReplyIR;
  defaultAction: NotificationActionTargetIR;
  metadata: Readonly<Record<string, unknown>>;
  retentionUntilFrame?: number;
  delivery: {
    outcome: NotificationDeliveryOutcome;
    suppressionReason?: NotificationSuppressionReason;
    alertSuppressionReason?: NotificationAlertSuppressionReason;
    centerEligible: boolean;
    lockScreenEligible: boolean;
    bannerStartFrame?: number;
    bannerEndFrame?: number;
    soundAtFrame?: number;
  };
}

export interface PreparedNotificationInteraction extends Omit<
  NotificationInteractionIR,
  "sequence"
> {
  sequence: number;
}

export interface PreparedNotificationActionEffect {
  at: number;
  sequence: number;
  deviceId: string;
  notificationId: string;
  interactionType: "tap" | "chooseAction" | "reply";
  actionId?: string;
  replyText?: string;
  replyTextField?: string;
  target: NotificationActionTargetIR;
}

export interface PreparedNotificationDevice {
  id: string;
  platform: NotificationPlatform;
  appearance: NotificationAppearance;
  locale: string;
  initialLocked: boolean;
  initialDnd: boolean;
  initialForegroundAppId?: string;
  operations: readonly NotificationDeviceContextOperation[];
}

export interface PreparedNotificationProgram {
  version: "1";
  fps: number;
  durationInFrames: number;
  records: readonly PreparedNotificationRecord[];
  interactions: readonly PreparedNotificationInteraction[];
  devices: Readonly<Record<string, PreparedNotificationDevice>>;
  actionEffects: readonly PreparedNotificationActionEffect[];
}

export interface NotificationDeviceContextState {
  isLocked: boolean;
  dnd: boolean;
  foregroundAppId?: string;
}

export type NotificationRecordLifecycle =
  | "scheduled"
  | "suppressed"
  | "delivered"
  | "acted"
  | "dismissed"
  | "expired";

export interface NotificationRecordRuntimeState {
  id: string;
  lifecycle: NotificationRecordLifecycle;
  deliveredAtFrame?: number;
  actedAtFrame?: number;
  dismissedAtFrame?: number;
  actionId?: string;
  replyText?: string;
}

export interface NotificationRuntimeState {
  records: Readonly<Record<string, NotificationRecordRuntimeState>>;
  orderedIds: readonly string[];
  centerOpen: boolean;
  centerOpenedAtFrame?: number;
}

export interface NotificationThemeProjection {
  id: string;
  platform: NotificationPlatform;
  appearance: NotificationAppearance;
  colors: {
    banner: string;
    card: string;
    cardSecondary: string;
    centerScrim: string;
    text: string;
    secondaryText: string;
    border: string;
    action: string;
    actionDestructive: string;
  };
  geometry: {
    bannerTop: number;
    bannerHorizontalMargin: number;
    bannerMinHeight: number;
    cardRadius: number;
    cardPadding: number;
    iconSize: number;
    lockScreenTop: number;
    centerTop: number;
    centerHorizontalMargin: number;
    stackGap: number;
    maxLockScreenGroups: number;
    maxCenterGroups: number;
  };
  typography: {
    fontFamily: string;
    appSize: number;
    titleSize: number;
    bodySize: number;
    timestampSize: number;
  };
  motion: {
    bannerEnterFramesAt30: number;
    bannerExitFramesAt30: number;
    cardEnterFramesAt30: number;
    centerEnterFramesAt30: number;
  };
}

export type NotificationAnimationPhase = "entering" | "visible" | "exiting";

export interface NotificationItemProjection {
  id: string;
  appId: string;
  appName: string;
  icon: string;
  accentColor: string;
  leadingImage?: string;
  leadingImageAlt?: string;
  title: string;
  body: string;
  subtitle?: string;
  media?: NotificationMediaIR;
  direction: "ltr" | "rtl";
  deliveredAtFrame: number;
  ageLabel: string;
  interruption: NotificationInterruptionLevelIR;
  privacy: NotificationPrivacyIR;
  actions: readonly NotificationActionIR[];
  reply?: NotificationReplyIR;
  animation: {
    phase: NotificationAnimationPhase;
    progress: number;
  };
}

export interface NotificationGroupProjection {
  key: string;
  appId: string;
  count: number;
  latestAtFrame: number;
  items: readonly NotificationItemProjection[];
}

export interface NotificationDeviceProjection {
  deviceId: string;
  platform: NotificationPlatform;
  appearance: NotificationAppearance;
  locale: string;
  direction: "ltr" | "rtl";
  strings: {
    centerTitle: string;
    newNotification: string;
    reply: string;
    timeSensitive: string;
    critical: string;
  };
  theme: NotificationThemeProjection;
  deviceContext: NotificationDeviceContextState;
  banner?: NotificationItemProjection;
  lockScreenGroups: readonly NotificationGroupProjection[];
  center: {
    open: boolean;
    progress: number;
    groups: readonly NotificationGroupProjection[];
  };
  statusBarIcons: readonly {
    appId: string;
    icon: string;
    count: number;
  }[];
  cinematicSubjects: {
    banner?: { x: number; y: number; width: number; height: number };
    lockScreen?: { x: number; y: number; width: number; height: number };
    center?: { x: number; y: number; width: number; height: number };
  };
}

export interface NotificationProjectionConfig {
  viewportWidth: number;
  viewportHeight: number;
  pointScale: number;
  safeAreaTop: number;
  themeId?: NotificationThemeId;
}

export interface NotificationAudioCue {
  id: string;
  at: number;
  deviceId: string;
  soundId?: string;
  volume: number;
  critical: boolean;
}
