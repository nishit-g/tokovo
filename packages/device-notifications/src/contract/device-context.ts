import type {
  NotificationDeviceContextOperation,
  NotificationDeviceContextState,
  PreparedNotificationActionEffect,
  PreparedNotificationDevice,
} from "./types.js";

type ContextOperation = NotificationDeviceContextOperation & {
  sourceOrder: number;
};
type ContextSnapshot = { at: number; state: NotificationDeviceContextState };

const EMPTY_ACTION_EFFECTS: readonly PreparedNotificationActionEffect[] = [];
const operationIndexes = new WeakMap<
  PreparedNotificationDevice,
  WeakMap<object, readonly ContextSnapshot[]>
>();

function getContextOperations(
  device: PreparedNotificationDevice,
  actionEffects: readonly PreparedNotificationActionEffect[],
): readonly ContextSnapshot[] {
  let byEffects = operationIndexes.get(device);
  if (!byEffects) {
    byEffects = new WeakMap<object, readonly ContextSnapshot[]>();
    operationIndexes.set(device, byEffects);
  }
  const effectsKey = actionEffects as object;
  const existing = byEffects.get(effectsKey);
  if (existing) return existing;

  const created: ContextOperation[] = [
    ...actionEffects.filter((effect) => effect.deviceId === device.id && effect.authenticated).map((effect) => ({
      at: effect.at, sequence: effect.sequence, deviceId: effect.deviceId, sourceOrder: 0, type: "unlock" as const,
    })),
    ...device.operations.map((operation) => ({
      ...operation,
      sourceOrder: 0,
    })),
    ...actionEffects
      .filter(
        (effect) =>
          effect.deviceId === device.id &&
          effect.target.navigation !== undefined &&
          (effect.target.navigation.appId !== undefined ||
            effect.target.navigation.route !== undefined),
      )
      .map((effect) => ({
        at: effect.at,
        sequence: effect.sequence,
        deviceId: effect.deviceId,
        sourceOrder: 1,
        type: "openApp" as const,
        appId: effect.target.navigation?.appId ?? "",
        route: effect.target.navigation?.route,
        params: effect.target.navigation?.params,
      })),
  ].sort(
    (left, right) =>
      left.at - right.at ||
      left.sequence - right.sequence ||
      left.sourceOrder - right.sourceOrder,
  );
  const state: NotificationDeviceContextState = {
    isAuthenticated: !device.initialLocked,
    isLocked: device.initialLocked,
    dnd: device.initialDnd,
    foregroundAppId: device.initialForegroundAppId,
  };
  const snapshots = created.map((operation) => {
    switch (operation.type) {
      case "lock": state.isLocked = true; state.isAuthenticated = false; break;
      case "authenticate": state.isAuthenticated = true; break;
      case "unlock": state.isLocked = false; state.isAuthenticated = true; break;
      case "goHome": state.foregroundAppId = undefined; break;
      case "openApp": if (operation.appId) state.foregroundAppId = operation.appId; break;
      case "setDnd": state.dnd = operation.enabled; break;
    }
    return { at: operation.at, state: { ...state } };
  });
  byEffects.set(effectsKey, snapshots);
  return snapshots;
}

export function resolveNotificationDeviceContext(
  device: PreparedNotificationDevice,
  frame: number,
  actionEffects: readonly PreparedNotificationActionEffect[] = EMPTY_ACTION_EFFECTS,
): NotificationDeviceContextState {
  const state: NotificationDeviceContextState = {
    isAuthenticated: !device.initialLocked,
    isLocked: device.initialLocked,
    dnd: device.initialDnd,
    foregroundAppId: device.initialForegroundAppId,
  };
  const operations = getContextOperations(device, actionEffects);

  let low = 0;
  let high = operations.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (operations[middle].at <= frame) low = middle + 1;
    else high = middle;
  }
  return low > 0 ? { ...operations[low - 1].state } : state;
}
