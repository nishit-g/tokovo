import type { WorldState } from "../types/world-state.js";

export function getAppStateForDevice<T = unknown>(
  world: WorldState,
  appId: string,
  deviceId?: string,
): T | undefined {
  if (deviceId) {
    const scoped = world.appStateByDevice?.[deviceId]?.[appId];
    if (scoped !== undefined) {
      return scoped as T;
    }
  }

  return world.appState?.[appId] as T | undefined;
}

export function hasDeviceScopedAppState(
  world: WorldState,
  appId: string,
  deviceId?: string,
): boolean {
  return Boolean(
    deviceId &&
      world.appStateByDevice?.[deviceId] &&
      Object.hasOwn(world.appStateByDevice[deviceId], appId),
  );
}

export function getDeviceIdsForAppState(
  world: WorldState,
  appId: string,
): string[] {
  return Object.entries(world.appStateByDevice ?? {})
    .filter(([, appStates]) => Object.hasOwn(appStates, appId))
    .map(([deviceId]) => deviceId);
}

export function ensureAppStateForDevice<T>(
  world: WorldState,
  appId: string,
  deviceId: string | undefined,
  create: () => T,
): T {
  if (deviceId && world.appStateByDevice?.[deviceId]) {
    const scoped = world.appStateByDevice[deviceId];
    scoped[appId] ??= create();
    return scoped[appId] as T;
  }

  world.appState ??= {};
  world.appState[appId] ??= create();
  return world.appState[appId] as T;
}

/**
 * Return a read-only projection where legacy `appState[appId]` lookups point
 * at the requested device's app instances. The source world is not mutated.
 */
export function projectWorldForDevice(
  world: WorldState,
  deviceId?: string,
): WorldState {
  if (!deviceId) return world;
  const scoped = world.appStateByDevice?.[deviceId];
  if (!scoped || Object.keys(scoped).length === 0) return world;

  return {
    ...world,
    appState: {
      ...world.appState,
      ...scoped,
    },
  } as WorldState;
}
