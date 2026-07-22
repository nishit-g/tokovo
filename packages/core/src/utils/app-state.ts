import {
  appInstanceId,
  type WorldState,
} from "../types/world-state.js";

export function getAppStateForDevice<T = unknown>(
  world: WorldState,
  appId: string,
  deviceId: string,
): T | undefined {
  return world.appInstances[appInstanceId(deviceId, appId)] as T | undefined;
}

export function requireAppStateForDevice<T = unknown>(
  world: WorldState,
  appId: string,
  deviceId: string,
): T {
  const state = getAppStateForDevice<T>(world, appId, deviceId);
  if (state === undefined) {
    throw new Error(
      `APP_INSTANCE_MISSING: app "${appId}" is not mounted on device "${deviceId}"`,
    );
  }
  return state;
}

export function getDeviceIdsForAppState(
  world: WorldState,
  appId: string,
): string[] {
  return Object.keys(world.devices)
    .filter((deviceId) =>
      Object.hasOwn(world.appInstances, appInstanceId(deviceId, appId)),
    )
    .sort();
}
