import type { WorldState } from "@tokovo/core";

export interface XScreenProps {
  world: WorldState;
  deviceId: string;
  width: number;
  height: number;
}

export function requireDeviceClock(world: WorldState, deviceId: string): number {
  const device = world.devices[deviceId];
  if (!device) throw new Error(`X_DEVICE_MISSING: "${deviceId}" is not in world state`);
  return device.os.clock;
}
