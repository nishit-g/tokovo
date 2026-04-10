import { produce } from "immer";
import type { Draft } from "immer";
import { DEFAULT_NOTIFICATION_CENTER } from "@tokovo/core";
import type {
  WorldState,
  NotificationInstance,
  NotificationIR,
  DynamicIslandState,
  NotificationGroup,
} from "@tokovo/core";

export type NotificationMode = "headsup" | "lockscreen" | "both";
export type NotificationPriority = "low" | "default" | "high" | "critical";
export type DynamicIslandMode = "compact" | "minimal" | "expanded";

export interface ShowPayload {
  kind: "show";
  id: string;
  appId: string;
  title: string;
  body: string;
  icon?: string;
  mode?: NotificationMode;
  priority?: NotificationPriority;
  duration?: number;
  groupKey?: string;
  threadKey?: string;
  actions?: Array<{ id: string; label: string; destructive?: boolean }>;
  replyable?: boolean;
  metadata?: Record<string, unknown>;
}

export interface DismissPayload {
  kind: "dismiss";
  id: string;
}

export interface TapPayload {
  kind: "tap";
  id: string;
  actionId?: string;
}

export interface SwipePayload {
  kind: "swipe";
  id: string;
  direction: "left" | "right";
}

export interface ReplyPayload {
  kind: "reply";
  id: string;
  text: string;
}

export interface DynamicIslandPayload {
  kind: "dynamicIsland";
  visible: boolean;
  mode?: DynamicIslandMode;
}

export interface ClearAllPayload {
  kind: "clearAll";
}

export type NotificationPayload =
  | ShowPayload
  | DismissPayload
  | TapPayload
  | SwipePayload
  | ReplyPayload
  | DynamicIslandPayload
  | ClearAllPayload;

export interface NotificationEvent {
  kind: "DEVICE";
  type: string;
  deviceId: string;
  at: number;
  payload?: NotificationPayload;
}

export interface NotificationPolicy {
  headsUpDuration: number;
  cleanupDelayFrames: number;
  autoOpenOnTap: boolean;
}

interface NotificationCenterRuntimeState {
  items: NotificationInstance[];
  groups: NotificationGroup[];
  headsUp: string | null;
  headsUpQueue: string[];
  isOpen?: boolean;
  openedAtFrame?: number | null;
}

export const DEFAULT_POLICY: NotificationPolicy = {
  headsUpDuration: 150,
  cleanupDelayFrames: 45,
  autoOpenOnTap: true,
};

function isShowPayload(
  payload: NotificationPayload | undefined,
): payload is ShowPayload {
  return payload?.kind === "show";
}

function isDismissPayload(
  payload: NotificationPayload | undefined,
): payload is DismissPayload {
  return payload?.kind === "dismiss";
}

function isTapPayload(
  payload: NotificationPayload | undefined,
): payload is TapPayload {
  return payload?.kind === "tap";
}

function isSwipePayload(
  payload: NotificationPayload | undefined,
): payload is SwipePayload {
  return payload?.kind === "swipe";
}

function isReplyPayload(
  payload: NotificationPayload | undefined,
): payload is ReplyPayload {
  return payload?.kind === "reply";
}

function isDynamicIslandPayload(
  payload: NotificationPayload | undefined,
): payload is DynamicIslandPayload {
  return payload?.kind === "dynamicIsland";
}

function createNotificationInstance(
  payload: ShowPayload,
  frame: number,
  deviceId: string,
  policy: NotificationPolicy,
): NotificationInstance {
  const ir: NotificationIR = {
    id: payload.id,
    appId: payload.appId,
    title: payload.title,
    body: payload.body,
    icon: payload.icon,
    actions: payload.actions,
    replyable: payload.replyable,
    groupKey: payload.groupKey,
    threadKey: payload.threadKey,
    payload: payload.metadata,
  };

  const duration = payload.duration ?? policy.headsUpDuration;

  return {
    id: payload.id,
    appId: payload.appId,
    title: payload.title,
    body: payload.body,
    icon: payload.icon,
    deviceId,
    ir,
    state: "headsUp",
    mode: payload.mode ?? "headsup",
    createdAtFrame: frame,
    shownAtFrame: frame,
    expiresAtFrame: frame + duration,
  };
}

export function notificationReducer(
  notifications: NotificationInstance[],
  event: NotificationEvent,
  policy: NotificationPolicy = DEFAULT_POLICY,
): NotificationInstance[] {
  return produce(notifications, (draft) => {
    applyNotificationEventToDraft(draft, event, policy);

    const cleanupThreshold = event.at - policy.cleanupDelayFrames;

    return draft.filter((n) => {
      const isDismissed = n.state === "dismissed";
      const isExpired =
        n.expiresAtFrame !== undefined && event.at > n.expiresAtFrame;

      if (!isDismissed && !isExpired) {
        return true;
      }

      const effectiveEndFrame = n.dismissedAtFrame ?? n.expiresAtFrame ?? 0;
      return effectiveEndFrame > cleanupThreshold;
    });
  });
}

function findNotificationById(
  draft: Draft<NotificationInstance[]>,
  id: string,
): Draft<NotificationInstance> | undefined {
  return draft.find((n) => n.id === id);
}

function buildNotificationGroups(
  notifications: NotificationInstance[],
): NotificationGroup[] {
  const groups = new Map<string, NotificationGroup>();

  for (const notification of notifications) {
    if (notification.state === "dismissed") continue;

    const key =
      notification.ir.groupKey ||
      (notification.ir.threadKey
        ? `${notification.appId}_${notification.ir.threadKey}`
        : notification.appId);

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        appId: notification.appId,
        notifications: [],
        collapsed: true,
        count: 0,
        latestAt: 0,
      };
      groups.set(key, group);
    }

    group.notifications.push(notification);
    group.count += 1;
    group.latestAt = Math.max(
      group.latestAt,
      notification.shownAtFrame ?? notification.createdAtFrame ?? 0,
    );
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      notifications: [...group.notifications].sort(
        (a, b) =>
          (b.shownAtFrame ?? b.createdAtFrame ?? 0) -
          (a.shownAtFrame ?? a.createdAtFrame ?? 0),
      ),
    }))
    .sort((a, b) => b.latestAt - a.latestAt);
}

function applyNotificationEventToDraft(
  draft: Draft<NotificationInstance[]>,
  event: NotificationEvent,
  policy: NotificationPolicy,
): void {
  const { payload } = event;

  switch (event.type) {
    case "SHOW_NOTIFICATION":
    case "NOTIFICATION_SHOW": {
      if (!isShowPayload(payload)) break;
      const instance = createNotificationInstance(
        payload,
        event.at,
        event.deviceId,
        policy,
      );
      const existingIdx = draft.findIndex((n) => n.id === payload.id);
      if (existingIdx !== -1) {
        draft[existingIdx] = instance;
      } else {
        draft.push(instance);
      }
      break;
    }

    case "DISMISS_NOTIFICATION":
    case "NOTIFICATION_DISMISS": {
      if (!isDismissPayload(payload)) break;
      const notification = findNotificationById(draft, payload.id);
      if (notification) {
        notification.state = "dismissed";
        notification.dismissedAtFrame = event.at;
      }
      break;
    }

    case "TAP_NOTIFICATION":
    case "NOTIFICATION_TAP": {
      if (!isTapPayload(payload)) break;
      const notification = findNotificationById(draft, payload.id);
      if (notification) {
        notification.state = "dismissed";
        notification.dismissedAtFrame = event.at;
      }
      break;
    }

    case "SWIPE_NOTIFICATION":
    case "NOTIFICATION_SWIPE": {
      if (!isSwipePayload(payload)) break;
      if (payload.direction === "right") {
        const notification = findNotificationById(draft, payload.id);
        if (notification) {
          notification.state = "dismissed";
          notification.dismissedAtFrame = event.at;
        }
      }
      break;
    }

    case "REPLY_NOTIFICATION":
    case "NOTIFICATION_REPLY": {
      if (!isReplyPayload(payload)) break;
      const notification = findNotificationById(draft, payload.id);
      if (notification) {
        notification.state = "dismissed";
        notification.dismissedAtFrame = event.at;
      }
      break;
    }

    case "CLEAR_ALL_NOTIFICATIONS":
    case "NOTIFICATION_CLEAR_ALL": {
      for (const n of draft) {
        if (n.state !== "dismissed") {
          n.state = "dismissed";
          n.dismissedAtFrame = event.at;
        }
      }
      break;
    }

    default:
      break;
  }
}

export function applyNotificationEvent(
  draft: Draft<WorldState>,
  event: { at: number; type?: string; deviceId?: string; payload?: unknown },
  policy: NotificationPolicy = DEFAULT_POLICY,
): void {
  const deviceId = event.deviceId;
  if (!deviceId) return;

  const device = draft.devices[deviceId];
  if (!device) return;

  if (!device.notifications) {
    device.notifications = [];
  }
  if (!device.notificationCenter) {
    device.notificationCenter = {
      ...DEFAULT_NOTIFICATION_CENTER,
      items: [],
      groups: [],
      headsUpQueue: [],
    };
  }
  const notificationCenter =
    device.notificationCenter as Draft<NotificationCenterRuntimeState>;

  if (
    event.type === "OPEN_APP" ||
    event.type === "GO_HOME" ||
    event.type === "LOCK" ||
    event.type === "UNLOCK"
  ) {
    notificationCenter.isOpen = false;
    notificationCenter.openedAtFrame = null;
  }

  const notifEvent: NotificationEvent = {
    kind: "DEVICE",
    type: event.type || "",
    deviceId,
    at: event.at,
    payload: event.payload as NotificationPayload,
  };

  if (
    event.type === "DYNAMIC_ISLAND" ||
    event.type === "NOTIFICATION_DYNAMIC_ISLAND"
  ) {
    if (isDynamicIslandPayload(notifEvent.payload)) {
      const dynamicIsland: DynamicIslandState = {
        visible: notifEvent.payload.visible,
        mode: notifEvent.payload.mode ?? "compact",
        activeContent: null,
      };
      device.dynamicIsland = dynamicIsland;
    }
    return;
  }

  if (event.type === "TOGGLE_NOTIFICATION_PANEL") {
    const payload = event.payload as { open?: boolean } | undefined;
    const open =
      typeof payload?.open === "boolean"
        ? payload.open
        : !notificationCenter.isOpen;
    notificationCenter.isOpen = open;
    notificationCenter.openedAtFrame = open ? event.at : null;
  }

  if (event.type === "TAP_NOTIFICATION" || event.type === "NOTIFICATION_TAP") {
    const tapPayload = notifEvent.payload;
    if (policy.autoOpenOnTap && isTapPayload(tapPayload)) {
      const notifications = device.notifications as NotificationInstance[];
      const notification = notifications.find((n) => n.id === tapPayload.id);
      if (notification?.ir?.appId) {
        device.foregroundAppId = notification.ir.appId;
        notificationCenter.isOpen = false;
        notificationCenter.openedAtFrame = null;
      }
    }
  }

  const notifications = device.notifications as NotificationInstance[];
  applyNotificationEventToDraft(notifications, notifEvent, policy);

  const cleanupThreshold = event.at - policy.cleanupDelayFrames;
  device.notifications = notifications.filter((n) => {
    const isDismissed = n.state === "dismissed";
    const isExpired =
      n.expiresAtFrame !== undefined && event.at > n.expiresAtFrame;

    if (!isDismissed && !isExpired) {
      return true;
    }

    const effectiveEndFrame = n.dismissedAtFrame ?? n.expiresAtFrame ?? 0;
    return effectiveEndFrame > cleanupThreshold;
  });

  notificationCenter.items = device.notifications as NotificationInstance[];
  notificationCenter.groups = buildNotificationGroups(
    notificationCenter.items as NotificationInstance[],
  );
  notificationCenter.headsUp = notificationCenter.items.find(
    (notification) =>
      notification.state !== "dismissed" &&
      notification.mode !== "lockscreen" &&
      notification.mode !== "silent",
  )?.id ?? null;
  notificationCenter.headsUpQueue = notificationCenter.items
    .filter(
      (notification) =>
        notification.state !== "dismissed" &&
        notification.mode !== "lockscreen" &&
        notification.mode !== "silent",
    )
    .map((notification) => notification.id);
}
