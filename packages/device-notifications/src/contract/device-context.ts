import type {
  NotificationDeviceContextOperation,
  NotificationDeviceContextState,
  PreparedNotificationActionEffect,
  PreparedNotificationDevice,
} from "./types.js";

type ContextOperation = NotificationDeviceContextOperation & {
  sourceOrder: number;
};

const EMPTY_ACTION_EFFECTS: readonly PreparedNotificationActionEffect[] = [];
const operationIndexes = new WeakMap<
  PreparedNotificationDevice,
  WeakMap<object, readonly ContextOperation[]>
>();

function getContextOperations(
  device: PreparedNotificationDevice,
  actionEffects: readonly PreparedNotificationActionEffect[],
): readonly ContextOperation[] {
  let byEffects = operationIndexes.get(device);
  if (!byEffects) {
    byEffects = new WeakMap<object, readonly ContextOperation[]>();
    operationIndexes.set(device, byEffects);
  }
  const effectsKey = actionEffects as object;
  const existing = byEffects.get(effectsKey);
  if (existing) return existing;

  const created: ContextOperation[] = [
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
  byEffects.set(effectsKey, created);
  return created;
}

export function resolveNotificationDeviceContext(
  device: PreparedNotificationDevice,
  frame: number,
  actionEffects: readonly PreparedNotificationActionEffect[] = EMPTY_ACTION_EFFECTS,
): NotificationDeviceContextState {
  const state: NotificationDeviceContextState = {
    isLocked: device.initialLocked,
    dnd: device.initialDnd,
    foregroundAppId: device.initialForegroundAppId,
  };
  const operations = getContextOperations(device, actionEffects);

  for (const operation of operations) {
    if (operation.at > frame) break;
    switch (operation.type) {
      case "lock":
        state.isLocked = true;
        break;
      case "unlock":
        state.isLocked = false;
        break;
      case "goHome":
        state.foregroundAppId = undefined;
        break;
      case "openApp":
        if (operation.appId) state.foregroundAppId = operation.appId;
        break;
      case "setDnd":
        state.dnd = operation.enabled;
        break;
    }
  }

  return state;
}
