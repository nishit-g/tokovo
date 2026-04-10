import type {
  TeamsNotificationDismissPayload,
  TeamsNotificationPushPayload,
  TeamsState,
} from "../types/index.js";

export function handleNotificationPush(
  state: TeamsState,
  payload: TeamsNotificationPushPayload,
  at: number,
): void {
  state.notifications[payload.id] = {
    id: payload.id,
    title: payload.title,
    text: payload.text,
    kind: payload.kind ?? "system",
    appId: "app_teams",
    createdAtFrame: at,
    expiresAtFrame: at + (payload.ttlFrames ?? 180),
    target: payload.target,
  };
  state.ui.notificationIds = [
    payload.id,
    ...state.ui.notificationIds.filter((id) => id !== payload.id),
  ].slice(0, 5);
}

export function handleNotificationDismiss(
  state: TeamsState,
  payload: TeamsNotificationDismissPayload,
  at: number,
): void {
  const notification = state.notifications[payload.id];
  if (!notification) return;
  notification.dismissedAtFrame = at;
  state.ui.notificationIds = state.ui.notificationIds.filter((id) => id !== payload.id);
}
